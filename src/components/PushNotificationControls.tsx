import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { BellRing, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { registerPushDevice, sendTestPush } from '@/lib/push.functions';

export function PushNotificationControls() {
  const register = useServerFn(registerPushDevice), send = useServerFn(sendTestPush);
  const [token, setToken] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const [newTab, setNewTab] = useState(false);
  useEffect(() => {
    const received = () => setMessage('تم استقبال إشعار الاختبار على هذا الجهاز.');
    window.addEventListener('husayniya-push-received', received);
    return () => window.removeEventListener('husayniya-push-received', received);
  }, []);
  async function enable() {
    setBusy(true); setMessage(''); setNewTab(false);
    try {
      const { enablePush } = await import('@/lib/push-browser');
      let timer: ReturnType<typeof setTimeout> | undefined;
      const result = await Promise.race([
        enablePush(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('لم يكتمل اتصال إشعارات هذا الجهاز؛ تحقق من الإنترنت وافتح التطبيق المنشور في متصفحك ثم أعد المحاولة.')), 25000); }),
      ]).finally(() => { if (timer) clearTimeout(timer); });
      if (result.status === 'registered') {
        await register({ data: { token: result.token } }); setToken(result.token); setMessage('تم تفعيل إشعارات هذا الجهاز.');
      } else {
        setNewTab(result.status === 'open-in-new-tab');
        setMessage({ 'not-configured': 'حدّث ربط Firebase واختر Include web push.', unsupported: 'هذا المتصفح لا يدعم الإشعارات؛ على آيفون أضف التطبيق للشاشة الرئيسية ثم افتحه منها.', 'open-in-new-tab': 'افتح التطبيق في تبويب مستقل أو استخدم التطبيق المنشور لتفعيل الإشعارات.', denied: 'الإشعارات غير مسموحة؛ فعّلها من إعدادات الموقع في متصفحك ثم حاول مرة أخرى.' }[result.status]);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'تعذر تفعيل الإشعارات'); }
    finally { setBusy(false); }
  }
  async function test() {
    setBusy(true); setMessage('');
    try { await send({ data: { token } }); setMessage(current => current || 'قبل Firebase إرسال الاختبار؛ تحقق من إشعارات تليفونك.'); }
    catch (error) { setToken(''); setMessage(error instanceof Error ? error.message : 'تعذر إرسال الاختبار'); }
    finally { setBusy(false); }
  }
  return <section className="mb-7 border-y py-4"><div className="flex flex-wrap items-center gap-3"><h2 className="mr-0 text-lg">إشعارات الموبايل</h2><Button variant="outline" disabled={busy} onClick={enable}><BellRing />{token ? 'تحديث التفعيل' : 'تفعيل الإشعارات'}</Button><Button disabled={busy || !token} onClick={test}><Send />إرسال إشعار اختبار</Button>{newTab && <Button variant="link" asChild><a href="/orders" target="_blank" rel="noopener noreferrer">فتح في تبويب مستقل</a></Button>}</div>{message && <p role="status" className="mt-3 break-words text-sm text-muted-foreground">{message}</p>}</section>;
}