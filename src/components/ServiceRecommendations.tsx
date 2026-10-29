import { useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Sparkles, ArrowLeft, LoaderCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import type { Catalog } from '@/lib/customer-queries';
import { recommendationInput, type RecommendationOutput } from '@/lib/recommendation-rules';
import { recommendServices } from '@/lib/recommendations.functions';

const EXAMPLES = [
  'محتاج سباك يصلح تسريب تحت حوض المطبخ',
  'عايز أحجز عند دكتور أطفال بكرة الصبح',
  'نفسي في بيتزا وعصير توصيل للبيت',
  'محتاج كهربائي يركب نجفة في الصالة',
  'عايز صيدلية فيها دوا برد وبنادول',
  'محتاج طلبات سوبر ماركت: رز وزيت وسكر',
  'نجار يصلح باب دولاب مكسور',
  'هدية عيد ميلاد لبنت عندها 10 سنين',
  'فني يصلح غسالة مش بتعصر',
];

function useTypewriter(active: boolean) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!active) return;
    let order = [...EXAMPLES].sort(() => Math.random() - 0.5);
    let i = 0, pos = 0, deleting = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = order[i];
      if (!deleting) {
        pos++;
        setText(full.slice(0, pos));
        if (pos === full.length) { deleting = true; timer = setTimeout(tick, 1800); return; }
        timer = setTimeout(tick, 70);
      } else {
        pos--;
        setText(full.slice(0, pos));
        if (pos === 0) {
          deleting = false; i++;
          if (i >= order.length) { order = [...EXAMPLES].sort(() => Math.random() - 0.5); i = 0; }
          timer = setTimeout(tick, 400); return;
        }
        timer = setTimeout(tick, 35);
      }
    };
    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [active]);
  return text;
}

export function ServiceRecommendations({ catalog, area }: { catalog: Catalog; area: string }) {
  const { user } = useAuth();
  const recommend = useServerFn(recommendServices);
  const [description, setDescription] = useState('');
  const typed = useTypewriter(!description);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RecommendationOutput | null>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !user) return;
    const parsed = recommendationInput.safeParse({ description, area_id: Number(area) || null });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'تحقق من الوصف'); return; }
    setBusy(true); setError(''); setResult(null);
    try {
      const response = await recommend({ data: parsed.data });
      if (response.ok) setResult(response);
      else setError(response.message);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'تعذر الحصول على الاقتراحات الآن');
    } finally { setBusy(false); }
  }
  return <section aria-labelledby="recommendation-heading" className="border-b bg-secondary/40">
    <div className="mx-auto max-w-6xl px-4 py-7">
      <div className="mb-4 flex items-center gap-3"><Sparkles className="size-6 shrink-0 text-primary" /><h2 id="recommendation-heading" className="text-xl">ما الخدمة التي تحتاجها؟</h2><span className="text-xs text-muted-foreground">Lovable AI</span></div>
      <form onSubmit={submit} className="flex flex-col items-start gap-3 sm:flex-row">
        <div className="w-full flex-1"><Textarea aria-label="وصف الخدمة المطلوبة" placeholder="مثلًا: محتاج سباك يصلح تسريب تحت حوض المطبخ" value={description} maxLength={1500} disabled={busy} onChange={e => { setDescription(e.target.value); setError(''); setResult(null); }} className="min-h-24 bg-card" />
          {area && <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin size={13} />{catalog.areas.find(a => String(a.id) === area)?.name}</p>}
        </div>
        {user ? <Button type="submit" disabled={busy || !description.trim()} className="h-11 w-full shrink-0 sm:w-auto">{busy ? <LoaderCircle className="animate-spin" /> : <Sparkles />}{busy ? 'جاري البحث عن الأنسب...' : 'اقترح لي خدمات'}</Button> : <Button asChild className="h-11 w-full shrink-0 sm:w-auto"><Link to="/auth" search={{ redirect: '/' }}>سجل الدخول للاقتراحات<ArrowLeft /></Link></Button>}
      </form>
      <div aria-live="polite" aria-busy={busy}>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
        {result && <div className="mt-5"><p className="mb-4 text-sm">{result.summary}</p><div className="grid gap-3 md:grid-cols-3">{result.suggestions.map(suggestion => {
          const store = catalog.stores.find(s => s.id === suggestion.store_id);
          if (!store) return null;
          return <Link key={store.id} to="/stores/$storeId" params={{ storeId: store.id }} className="min-w-0 rounded-lg border bg-card p-4 transition-colors hover:border-primary"><div className="flex items-center justify-between gap-2"><h3 className="break-words text-base">{store.name}</h3><ArrowLeft className="size-4 shrink-0 text-primary" /></div><p className="mb-3 mt-2 break-words text-sm text-muted-foreground">{suggestion.reason}</p><div className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>{catalog.areas.find(a => a.id === store.area_id)?.name ?? 'الحسينية'}</span><span className={store.is_open ? 'text-success' : ''}>{store.is_open ? 'مفتوح' : 'مغلق الآن'}</span></div></Link>;
        })}</div></div>}
      </div>
    </div>
  </section>;
}