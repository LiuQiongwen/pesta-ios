import 'dotenv/config';

export default {
  expo: {
    name: 'Pesta',
    slug: 'pesta-app',
    version: '1.0.0',
    scheme: 'pesta',
    orientation: 'portrait',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#01040d',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.pesta.app',
    },
    android: {
      package: 'com.pesta.app',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#01040d',
      },
    },
    plugins: ['expo-router', 'expo-secure-store'],
    extra: {
      WEB_URL:           process.env.WEB_URL           ?? 'https://your-pesta-site.com',
      SUPABASE_URL:      process.env.SUPABASE_URL      ?? '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? '',
    },
  },
};
