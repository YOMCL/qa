import Constants from 'expo-constants';

const expoConfig = Constants.expoConfig?.extra;

export const API_BASE_URL = expoConfig?.API_BASE_URL || 'https://api.solopide.me/api/v2';
export const ADMIN_ORIGIN = expoConfig?.ADMIN_ORIGIN || 'http://localhost:3001';
export const APP_ENV = expoConfig?.APP_ENV || 'development';
export const MICROSOFT_CLIENT_ID = expoConfig?.MICROSOFT_CLIENT_ID || '';
export const MICROSOFT_REDIRECT_URI = expoConfig?.MICROSOFT_REDIRECT_URI || '';

console.log(`🚀 App running in ${APP_ENV} mode`);
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log(`🔗 Admin Origin: ${ADMIN_ORIGIN}`);
