#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const BUILD_DIR = './builds';
const SUPPORTED_PLATFORMS = ['android', 'ios'];
const SUPPORTED_PROFILES = ['production', 'production-apk', 'staging'];
const VERSION_FILE = path.join(__dirname, '..', 'src', 'config', 'version.json');

function validateArgs(args) {
  const { platform, profile } = args;
  
  if (!platform) {
    console.error('❌ Error: Platform is required');
    process.exit(1);
  }
  
  if (!profile) {
    console.error('❌ Error: Profile is required');
    process.exit(1);
  }
  
  if (!SUPPORTED_PLATFORMS.includes(platform)) {
    console.error(`❌ Error: Platform not supported. Supported: ${SUPPORTED_PLATFORMS.join(', ')}`);
    process.exit(1);
  }
  
  if (!SUPPORTED_PROFILES.includes(profile)) {
    console.error(`❌ Error: Profile not supported. Supported: ${SUPPORTED_PROFILES.join(', ')}`);
    process.exit(1);
  }

  if (platform === 'android') {
    const sourceFileName = profile === 'staging' 
      ? 'google-services-staging.json' 
      : 'google-services-production.json';
    const googleServicesPath = path.join(process.cwd(), 'config', sourceFileName);
    if (!fs.existsSync(googleServicesPath)) {
      console.error(`❌ Error: ${sourceFileName} file not found at config/${sourceFileName}`);
      console.error('This file is required for Android builds');
      process.exit(1);
    }
  }
  
  return true;
}

function copyGoogleServices(profile) {
  const sourceFileName = profile === 'staging' 
    ? 'google-services-staging.json' 
    : 'google-services-production.json';
  const sourcePath = path.join(process.cwd(), 'config', sourceFileName);
  const flavorFolder = profile === 'staging' ? 'staging' : 'release';
  
  const targetPaths = [
    path.join(process.cwd(), 'android', 'app', 'google-services.json'),
    path.join(process.cwd(), 'android', 'app', 'src', flavorFolder, 'google-services.json')
  ];
  
  for (const targetPath of targetPaths) {
    const targetDir = path.dirname(targetPath);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    fs.copyFileSync(sourcePath, targetPath);
    const relativePath = path.relative(process.cwd(), targetPath);
    console.log(`📋 Copied ${sourceFileName} to ${relativePath}`);
  }
}

function cleanupGoogleServices(profile) {
  const flavorFolder = profile === 'staging' ? 'staging' : 'release';
  const targetPaths = [
    path.join(process.cwd(), 'android', 'app', 'google-services.json'),
    path.join(process.cwd(), 'android', 'app', 'src', flavorFolder, 'google-services.json')
  ];
  
  for (const targetPath of targetPaths) {
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      const relativePath = path.relative(process.cwd(), targetPath);
      console.log(`🧹 Cleaned up google-services.json from ${relativePath}`);
    }
  }
}

function removeDuplicateWebpFiles() {
  const resPath = path.join(process.cwd(), 'android', 'app', 'src', 'main', 'res');
  
  if (!fs.existsSync(resPath)) {
    return;
  }
  
  let removedCount = 0;
  
  function removeWebpFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        removeWebpFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.webp')) {
        fs.unlinkSync(fullPath);
        removedCount++;
      }
    }
  }
  
  removeWebpFiles(resPath);
  
  if (removedCount > 0) {
    console.log(`🧹 Removed ${removedCount} duplicate .webp file(s) from Android resources`);
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--platform':
      case '-p':
        parsed.platform = args[++i];
        break;
      case '--profile':
      case '-pr':
        parsed.profile = args[++i];
        break;
      case '--env':
      case '-e':
        parsed.env = args[++i];
        break;
    }
  }
  
  if (!parsed.env) {
    parsed.env = parsed.profile === 'staging' ? 'staging' : 'production';
  }
  
  return parsed;
}

function executeCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  console.log(`📝 Command: ${command}\n`);
  
  try {
    execSync(command, { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error in ${description}:`, error.message);
    return false;
  }
}

function ensureBuildDir() {
  if (!fs.existsSync(BUILD_DIR)) {
    console.log(`📁 Creating directory ${BUILD_DIR}...`);
    fs.mkdirSync(BUILD_DIR, { recursive: true });
  }
}

function moveBuildFiles(platform, env) {
  console.log('\n📦 Looking for generated files...');
  
  const extensions = platform === 'android' ? ['*.aab', '*.apk'] : ['*.ipa'];
  const files = [];
  
  for (const ext of extensions) {
    try {
      const result = execSync(`find . -maxdepth 1 -name "${ext}"`, { 
        encoding: 'utf8',
        cwd: process.cwd()
      }).trim();
      
      if (result) {
        files.push(...result.split('\n').filter(f => f));
      }
    } catch (error) {
      console.error(`❌ Error finding ${ext}:`, error.message);
    }
  }
  
  if (files.length === 0) {
    console.log('⚠️  No generated files found');
    return false;
  }
  
  console.log(`📋 Files found: ${files.join(', ')}`);
  
  let movedCount = 0;
  const movedFiles = [];
  
  const versionData = JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
  const version = versionData.version;

  for (const file of files) {
    const fileName = path.basename(file);
    const fileExtension = path.extname(fileName);
    const newFileName = `${version}-${env}${fileExtension}`;
    const newPath = path.join(BUILD_DIR, newFileName);
    
    try {
      fs.renameSync(file, newPath);
      console.log(`✅ Moved: ${fileName} → ${newFileName}`);
      movedFiles.push(newPath);
      movedCount++;
    } catch (error) {
      console.error(`❌ Error moving ${fileName}:`, error.message);
    }
  }
  
  console.log(`\n🎉 ${movedCount} file(s) moved to ${BUILD_DIR}/`);
  
  if (movedCount > 0) {
    console.log('\n📁 Build file locations:');
    for (const filePath of movedFiles) {
      const fullPath = path.resolve(filePath);
      console.log(`   ${fullPath}`);
    }
  }
  
  return movedCount > 0;
}

function main() {
  console.log('🚀 Starting build process...\n');
  
  const args = parseArgs();
  
  if (!validateArgs(args)) {
    return;
  }
  
  console.log(`📋 Configuration:`);
  console.log(`   Platform: ${args.platform}`);
  console.log(`   Profile: ${args.profile}`);
  console.log(`   Environment: ${args.env}`);
  console.log(`   Output directory: ${BUILD_DIR}\n`);
  
  ensureBuildDir();
  
  const copyVersionCommand = 'npm run copy-version';
  if (!executeCommand(copyVersionCommand, 'Copying version')) {
    process.exit(1);
  }

  if (args.platform === 'android') {
    removeDuplicateWebpFiles();
    copyGoogleServices(args.profile);
  }
  
  const envVars = [
    `APP_ENV=${args.env}`,
    'NODE_ENV=production',
    'EXPO_NO_WATCHMAN=1',
    'CI=1',
    'METRO_NO_WATCH=1'
  ].join(' ');
  
  const easCommand = `${envVars} eas build -p ${args.platform} --profile ${args.profile} --local --clear-cache`;
  
  if (!executeCommand(easCommand, 'Executing EAS build')) {
    process.exit(1);
  }
  
  if (args.platform === 'android') {
    cleanupGoogleServices(args.profile);
  }
  
  if (!moveBuildFiles(args.platform, args.env)) {
    console.log('\n⚠️  Build completed but files could not be moved');
  }
  
  console.log('\n🎉 Build process completed successfully!');
  console.log(`📁 Files are located in: ${BUILD_DIR}/`);
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs, validateArgs };
