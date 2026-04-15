#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const NAMESPACE = 'me.youorder.yomventas';

const filesToFix = [
  {
    path: 'node_modules/@expo/cli/build/src/start/platforms/android/AndroidPlatformManager.js',
    method: '_resolveAlternativeLaunchUrl',
    replacement: `    _resolveAlternativeLaunchUrl(applicationId, props) {
        const namespace = '${NAMESPACE}';
        const activityPath = (props == null ? void 0 : props.launchActivity) ?? applicationId + '/' + namespace + '.react.activities.RootReactActivity';
        return activityPath;
    }`
  },
  {
    path: 'node_modules/@expo/cli/build/src/run/android/resolveLaunchProps.js',
    method: 'resolveLaunchPropsAsync',
    replacement: `async function resolveLaunchPropsAsync(projectRoot, options) {
    const mainActivity = await getMainActivityAsync(projectRoot);
    const packageName = await new _AndroidAppIdResolver.AndroidAppIdResolver(projectRoot).getAppIdFromNativeAsync();
    const customAppId = options.appId;
    const namespace = '${NAMESPACE}';
    const fullActivityName = mainActivity.startsWith('.') ? namespace + mainActivity : mainActivity;
    const launchActivity = customAppId && customAppId !== packageName ? customAppId + '/' + fullActivityName : packageName + '/' + fullActivityName;
    return {
        mainActivity,
        launchActivity,
        packageName,
        customAppId
    };
}`
  }
];

function fixFile(fileConfig) {
  const filePath = path.join(process.cwd(), fileConfig.path);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${fileConfig.path}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  if (fileConfig.method === '_resolveAlternativeLaunchUrl') {
    const regex = /_resolveAlternativeLaunchUrl\(applicationId, props\)\s*\{[^}]*\}/s;
    if (regex.test(content)) {
      content = content.replace(regex, fileConfig.replacement);
    }
  } else if (fileConfig.method === 'resolveLaunchPropsAsync') {
    // Match the complete function with proper brace counting
    const functionStart = 'async function resolveLaunchPropsAsync';
    const startIndex = content.indexOf(functionStart);
    
    if (startIndex !== -1) {
      // Find the opening brace
      const openBraceIndex = content.indexOf('{', startIndex);
      if (openBraceIndex !== -1) {
        // Count braces to find the matching closing brace
        let braceCount = 1;
        let endIndex = openBraceIndex + 1;
        
        while (braceCount > 0 && endIndex < content.length) {
          if (content[endIndex] === '{') braceCount++;
          else if (content[endIndex] === '}') braceCount--;
          endIndex++;
        }
        
        // Extract and replace the complete function
        const originalFunction = content.substring(startIndex, endIndex);
        content = content.substring(0, startIndex) + fileConfig.replacement + content.substring(endIndex);
      }
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${fileConfig.path}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed for ${fileConfig.path}`);
    return false;
  }
}

function main() {
  console.log('🔧 Fixing Expo activity resolution...\n');
  
  let fixedCount = 0;
  for (const fileConfig of filesToFix) {
    if (fixFile(fileConfig)) {
      fixedCount++;
    }
  }

  if (fixedCount > 0) {
    console.log(`\n✅ Fixed ${fixedCount} file(s)`);
  } else {
    console.log('\n✅ All files are already fixed');
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
