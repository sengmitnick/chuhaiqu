module.exports = {
  expo: {
    name: 'Simple Habit Tracker',
    slug: 'simple-habit-tracker',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#6366f1',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#6366f1',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    extra: {
      // Map system env vars to EXPO_PUBLIC_ format
      APP_PORT: process.env.APP_PORT || process.env.EXPO_PUBLIC_APP_PORT || '3001',
      PUBLIC_HOST: process.env.PUBLIC_HOST || process.env.EXPO_PUBLIC_PUBLIC_HOST || '',
      CLACKY_PREVIEW_DOMAIN_BASE: process.env.CLACKY_PREVIEW_DOMAIN_BASE || process.env.EXPO_PUBLIC_CLACKY_PREVIEW_DOMAIN_BASE || '',
    },
  },
};
