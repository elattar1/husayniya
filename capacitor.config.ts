import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.husayniya.services',
  appName: 'خدمات الحسينية',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    url: 'https://husayniya.lovable.app',
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#045353',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
    },
    StatusBar: {
      backgroundColor: '#045353',
      style: 'DARK',
    },
  },
};

export default config;
