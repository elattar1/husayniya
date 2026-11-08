import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export const isNativePlatform = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform();

/**
 * Initializes native mobile features when running inside Capacitor (Android / iOS).
 * - Matches Status Bar color with the brand theme (#045353)
 * - Intercepts hardware Back button on Android to navigate back instead of exiting
 * - Dismisses splash screen smoothly once the app is loaded
 */
export async function initCapacitorApp(): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Configure Status Bar
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#045353' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    }
  } catch (err) {
    console.warn('[Capacitor] StatusBar init error:', err);
  }

  try {
    // 2. Android Hardware Back Button navigation
    App.addListener('backButton', ({ canGoBack }) => {
      // If modal or dialog is open, or history can go back
      if (window.history.length > 1 && canGoBack) {
        window.history.back();
      } else {
        // At root page: minimize / exit
        App.exitApp();
      }
    });
  } catch (err) {
    console.warn('[Capacitor] BackButton listener error:', err);
  }

  try {
    // 3. Dismiss Splash Screen
    await SplashScreen.hide();
  } catch (err) {
    console.warn('[Capacitor] SplashScreen hide error:', err);
  }
}
