export type PushResult = { status: 'registered'; token: string } | { status: 'not-configured' | 'unsupported' | 'open-in-new-tab' | 'denied' };

export async function enablePush(): Promise<PushResult> {
  const appId = import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID'];
  const vapidKey = import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY'];
  const config = {
    apiKey: import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY'],
    projectId: import.meta.env['VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID'],
    appId, messagingSenderId: appId?.split(':')[1] ?? '',
  };
  if (!config.apiKey || !config.projectId || !appId || !vapidKey || !config.messagingSenderId) return { status: 'not-configured' };
  if (window.top !== window.self) return { status: 'open-in-new-tab' };
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return { status: 'unsupported' };
  const { getMessaging, getToken, isSupported, onMessage } = await import('firebase/messaging');
  if (!(await isSupported())) return { status: 'unsupported' };
  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') return { status: 'denied' };
  const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${new URLSearchParams(config).toString()}`);
  if (!registration.active) await new Promise<void>((resolve, reject) => {
    const worker = registration.installing ?? registration.waiting;
    if (!worker) { reject(new Error('تعذر تجهيز استقبال الإشعارات')); return; }
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') resolve();
      if (worker.state === 'redundant') reject(new Error('تعذر تجهيز استقبال الإشعارات'));
    });
  });
  const { initializeApp, getApps } = await import('firebase/app');
  const app = getApps().find(a => a.name === 'husayniya-messaging') ?? initializeApp(config, 'husayniya-messaging');
  const messaging = getMessaging(app);
  const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
  if (!token) return { status: 'denied' };
  if (!foregroundListenerStarted) {
    onMessage(messaging, payload => {
      window.dispatchEvent(new CustomEvent('husayniya-push-received'));
      void registration.showNotification(payload.notification?.title ?? 'خدمات الحسينية', { body: payload.notification?.body ?? '', icon: '/icon-192.png', data: { path: '/orders' } });
    });
    foregroundListenerStarted = true;
  }
  return { status: 'registered', token };
}
let foregroundListenerStarted = false;