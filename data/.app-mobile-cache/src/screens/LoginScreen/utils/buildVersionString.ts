import Constants from 'expo-constants';
import versionData from '../../../config/version.json';

export const buildVersionString = () => {
  const buildType = __DEV__ ? 'debug' : 'release';
  const appEnv = Constants.expoConfig?.extra?.APP_ENV || 'development';
  const projectId = `yom-${appEnv}`;
  const appVersion = `${versionData.major}.${versionData.minor}.${versionData.fix}${versionData.preRelease}`;
  
  let versionString = appVersion;
  
  if (buildType !== 'release') {
    versionString += ` ${buildType}`;
  }
  
  versionString += ` ${projectId}`;
  
  return `Yom 2025 | ${versionString}`;
}; 
