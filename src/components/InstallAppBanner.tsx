import { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const DISMISS_KEY = 'install-banner-dismissed-at';
const DISMISS_DAYS = 7;

export function InstallAppBanner() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    const dismissed = Number(localStorage.getItem(DISMISS_KEY) || 0);
    if (standalone || Date.now() - dismissed < DISMISS_DAYS * 864e5) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) { setIos(true); setShow(true); }
    const onPrompt = (e: Event) => { e.preventDefault(); setEvent(e as InstallEvent); setShow(true); };
    const onInstalled = () => setShow(false);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  if (!show) return null;
  const dismiss = () => { localStorage.setItem(DISMISS_KEY, String(Date.now())); setShow(false); };
  const install = async () => { if (!event) return; await event.prompt(); await event.userChoice; setEvent(null); setShow(false); };

  return (
    <div role="dialog" aria-label="تثبيت التطبيق" className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg border bg-card p-3 shadow-soft md:bottom-4">
      <img src="/icon-192.png" alt="" className="size-11 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">ثبّت تطبيق خدمات الحسينية</p>
        <p className="text-xs text-muted-foreground">
          {ios ? <>اضغط <Share className="inline size-3.5" /> مشاركة ثم «إضافة إلى الشاشة الرئيسية»</> : 'افتحه من شاشة موبايلك بضغطة واحدة'}
        </p>
      </div>
      {!ios && <Button size="sm" onClick={install}><Download size={15} />تثبيت</Button>}
      <Button size="icon" variant="ghost" aria-label="إغلاق" onClick={dismiss}><X size={16} /></Button>
    </div>
  );
}
