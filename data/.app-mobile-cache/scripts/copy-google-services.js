#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ENV = process.env.APP_ENV || process.argv[2] || 'staging';

const sourceFileName = ENV === 'production' 
  ? 'google-services-production.json'
  : 'google-services-staging.json';

const sourcePath = path.join(process.cwd(), 'config', sourceFileName);
const targetPath = path.join(process.cwd(), 'android', 'app', 'google-services.json');

if (!fs.existsSync(sourcePath)) {
  console.error(`❌ Error: ${sourceFileName} not found at config/${sourceFileName}`);
  process.exit(1);
}

const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

fs.copyFileSync(sourcePath, targetPath);
console.log(`✅ Copied ${sourceFileName} to android/app/google-services.json`);

