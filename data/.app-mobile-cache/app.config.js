const ENV = process.env.APP_ENV || 'development';

const envConfig = {
  development: {
    API_BASE_URL: 'https://api.solopide.me/api/v2',
    ADMIN_ORIGIN: 'http://localhost:3001',
    APP_NAME: 'Yom Ventas (Dev)',
    BUNDLE_ID: 'me.youorder.yomventas.dev',
    MICROSOFT_CLIENT_ID: 'd5399449-6cb4-49d0-963f-2303026b559b',
    MICROSOFT_REDIRECT_URI: 'me.youorder.yomventas.dev://oauth/redirect/'
  },
  staging: {
    API_BASE_URL: 'https://api.solopide.me/api/v2',
    ADMIN_ORIGIN: 'https://admin.solopide.me',
    APP_NAME: 'Yom Ventas (Staging)',
    BUNDLE_ID: 'me.youorder.yomventas.debug',
    MICROSOFT_CLIENT_ID: 'd5399449-6cb4-49d0-963f-2303026b559b',
    MICROSOFT_REDIRECT_URI: 'me.youorder.yomventas.debug://oauth/redirect/'
  },
  production: {
    API_BASE_URL: 'https://api.youorder.me/api/v2',
    ADMIN_ORIGIN: 'https://admin.youorder.me',
    APP_NAME: 'Yom Ventas',
    BUNDLE_ID: 'me.youorder.yomventas',
    MICROSOFT_CLIENT_ID: '9d76ec2a-1011-4b61-8876-c62b7cbc3aec',
    MICROSOFT_REDIRECT_URI: 'me.youorder.yomventas://oauth/redirect/'
  },
};

const config = envConfig[ENV];

module.exports = {
  expo: {
    name: config.APP_NAME,
    slug: 'app-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: config.BUNDLE_ID,
    userInterfaceStyle: 'automatic',
    newArchEnabled: false,
    ios: {
      supportsTablet: true,
      bundleIdentifier: config.BUNDLE_ID,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: config.BUNDLE_ID,
      appAuthRedirectScheme: config.BUNDLE_ID,
    },
    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash-icon.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],
    ],

    extra: {
      API_BASE_URL: config.API_BASE_URL,
      ADMIN_ORIGIN: config.ADMIN_ORIGIN,
      APP_ENV: ENV,
      MICROSOFT_CLIENT_ID: config.MICROSOFT_CLIENT_ID,
      MICROSOFT_REDIRECT_URI: config.MICROSOFT_REDIRECT_URI,
      eas: {
        projectId: "b7b1756a-0b07-43be-aaed-83928de33ae9"
      }
    }
  },
};
