const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const isProduction = process.env.NODE_ENV === 'production' || process.env.CI === '1';

if (isProduction) {
  config.watchFolders = [];
  config.watchman = false;
  config.resetCache = true;
  
  config.watcher = {
    additionalExts: [],
    watchman: {
      deferStates: ['hg.update'],
    },
    healthCheck: {
      enabled: false,
    },
  };
}

config.resolver.platforms = ['native', 'android', 'ios', 'web'];
config.resolver.blockList = [
  /node_modules\/.*\/android\/\.cxx\/.*/,
  /node_modules\/.*\/\.cxx\/.*/,
  /\.cxx\/.*/,
  /node_modules\/.*\/android\/build\/.*/,
  /android\/build\/.*/,
  /CMakeFiles\/CMakeTmp\/.*/,
  /CMakeFiles\/.*\.dir$/,
];

module.exports = config;