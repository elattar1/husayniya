import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.husayniya.services',
  appName: 'خدمات الحسينية',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    // If you want the native app to connect directly to the live deployed site
    // (giving instant updates, live server functions, and real-time chat without app store republishing):
    // set CAPACITOR_SERVER_URL in your environment or enter your domain here.
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
