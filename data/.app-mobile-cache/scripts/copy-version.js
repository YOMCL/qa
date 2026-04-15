#!/usr/bin/env node

/* eslint-env node */

const fs = require('fs');
const path = require('path');

function readVersionProperties() {
  const versionPath = path.join(__dirname, '..', 'android', 'version.properties');
  
  if (!fs.existsSync(versionPath)) {
    console.error('❌ Archivo version.properties no encontrado en android/');
    process.exit(1);
  }
  
  const content = fs.readFileSync(versionPath, 'utf8');
  const version = {};
  
  content.split('\n').forEach(line => {
    if (line.includes('=')) {
      const [key, value] = line.split('=');
      version[key.trim()] = value.trim();
    }
  });
  
  return version;
}

function createVersionJson() {
  try {
    const version = readVersionProperties();
    const versionString = `${version.major}.${version.minor}.${version.fix}${version.preRelease}`;
    
    const versionData = {
      version: versionString,
      major: version.major,
      minor: version.minor,
      fix: version.fix,
      preRelease: version.preRelease,
      code: version.code
    };
    
    const outputPath = path.join(__dirname, '..', 'src', 'config', 'version.json');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(versionData, null, 2));
    console.log(`✅ Versión copiada a ${outputPath}: ${versionString}`);
    
  } catch (error) {
    console.error('❌ Error copiando versión:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  createVersionJson();
} 