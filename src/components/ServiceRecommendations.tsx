import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Sparkles, ArrowLeft, LoaderCircle, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import type { Catalog } from '@/lib/customer-queries';
import { recommendationInput, type RecommendationOutput } from '@/lib/recommendation-rules';
import { recommendServices } from '@/lib/recommendations.functions';

const EXAMPLES = [
  'محتاج سباك شاطر يصلح تسريب تحت حوض المطبخ',
  'عايز كباب وكفتة مشوية من مطعم الباز لعزومة عائلية',
  'بدور على صيدلية فاتحة 24 ساعة في شارع المركز',
  'محتاج دكتور باطنة وكلى متخصص في الحسينية',
  'عايز أطلب بيتزا سوبر سوبريم وكريب مقرمش من السندباد',
  'كهربائي يركب نجف وإضاءة ليد بروفايل في الشقة',
  'علبة كشري ميكس كبير وطاجن مكرونة باللحمة المفرومة',
  'محتاج ونش رفع عفش وسيارات نقل أثاث حديثة',
  'عايز أطلب حفاضات أطفال وحليب أطفال من الصيدلية',
  'دكتور أسنان ممتاز لتنظيف الجير وعلاج العصب',
  'فطير مشلتت فلاحي بالسمن البلدي وعسل',
  'عايز وجبة فرايد تشيكن كرسبي واستربس حار من بازوكا',
  'كيلو سمك بلدي مشوي وطاجن جمبري إسكندراني',
  'محتاج نجار يصلح دواليب ويغير كوالين الأبواب',
  'شركة رش مبيدات ومكافحة حشرات وتعقيم للمنزل',
  'بوكيه ورد جوري طبيعي مع بوكس شوكولاتة لهدية مناسبة',
  'عايز فول مدمس بالسمن البلدي وفلافل سخنة من الشبراوي',
  'فني تكييفات يشحن فريون ويعمل صيانة دورية',
];

const QUICK_CHIPS = [
  'سباكة وصيانة',
  'مشويات وطواجن',
  'صيدلية 24 ساعة',
  'بيتزا وكريب',
  'كشف أسنان',
  'كشري وطواجن',
  'نقل وتغليف عفش',
];

function useTypewriter(active: boolean) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (!active) return;
    let order = [...EXAMPLES].sort(() => Math.random() - 0.5);
    let i = 0,
      pos = 0,
      deleting = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const full = order[i] ?? '';
      if (!deleting) {
        pos++;
        setText(full.slice(0, pos));
        if (pos === full.length) {
          deleting = true;
          timer = setTimeout(tick, 2200);
          return;
        }
        timer = setTimeout(tick, 45);
      } else {
        pos--;
        setText(full.slice(0, pos));
        if (pos === 0) {
          deleting = false;
          i++;
          if (i >= order.length) {
            order = [...EXAMPLES].sort(() => Math.random() - 0.5);
            i = 0;
          }
          timer = setTimeout(tick, 400);
          return;
        }
        timer = setTimeout(tick, 20);
      }
    };

    timer = setTimeout(tick, 400);
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
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'تحقق من الوصف');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const response = await recommend({ data: parsed.data });
      if (response.ok) setResult(response);
      else setError(response.message);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'تعذر الحصول على الاقتراحات الآن');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="recommendation-heading" className="border-b bg-gradient-to-b from-secondary/50 via-secondary/20 to-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* صندوق البحث المحسّن بتصميم حديث وفخم */}
        <div className="rounded-2xl border border-border/80 bg-card/95 p-5 shadow-soft backdrop-blur-md md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 id="recommendation-heading" className="text-xl font-bold md:text-2xl">
                ما الخدمة التي تحتاجها؟
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                اكتب طلبك أو مشكلتك وسنقترح عليك أفضل الأماكن والفنيين في الحسينية
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Textarea
                aria-label="وصف الخدمة المطلوبة"
                placeholder={typed ? `${typed} |` : 'اكتب ما تبحث عنه...'}
                value={description}
                maxLength={1500}
                disabled={busy}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
                  setResult(null);
                }}
                className="min-h-24 w-full rounded-xl border border-border/90 bg-background/80 p-4 text-base leading-relaxed transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              {area && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={13} className="text-primary" />
                  <span>المنطقة المحددة: {catalog.areas.find((a) => String(a.id) === area)?.name}</span>
                </div>
              )}
            </div>

            {/* اقتراحات سريعة بنقرة واحدة */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-xs text-muted-foreground ml-1">اقتراحات سريعة:</span>
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    setDescription(`محتاج ${chip} في الحسينية`);
                    setError('');
                  }}
                  className="rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs text-foreground/80 transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {user ? (
                <Button
                  type="submit"
                  disabled={busy || !description.trim()}
                  className="h-11 w-full sm:w-auto px-6 rounded-xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.98]"
                >
                  {busy ? <LoaderCircle className="ml-2 size-4 animate-spin" /> : <Search className="ml-2 size-4" />}
                  {busy ? 'جاري البحث عن الأنسب...' : 'ابحث واقترح لي الأنسب'}
                </Button>
              ) : (
                <Button asChild className="h-11 w-full sm:w-auto px-6 rounded-xl text-sm font-semibold shadow-sm">
                  <Link to="/auth" search={{ redirect: '/' }}>
                    سجل الدخول للاقتراحات المخصصة
                    <ArrowLeft className="mr-2 size-4" />
                  </Link>
                </Button>
              )}
            </div>
          </form>

          {/* نتائج الاقتراحات */}
          <div aria-live="polite" aria-busy={busy}>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
            {result && (
              <div className="mt-6 border-t pt-5">
                <p className="mb-4 text-sm font-medium">{result.summary}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  {result.suggestions.map((suggestion) => {
                    const store = catalog.stores.find((s) => s.id === suggestion.store_id);
                    if (!store) return null;
                    return (
                      <Link
                        key={store.id}
                        to="/stores/$storeId"
                        params={{ storeId: store.id }}
                        className="group flex flex-col justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="break-words text-base font-semibold group-hover:text-primary transition-colors">
                              {store.name}
                            </h3>
                            <ArrowLeft className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
                          </div>
                          <p className="mb-3 mt-2 break-words text-xs text-muted-foreground line-clamp-2">
                            {suggestion.reason}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
                          <span>{catalog.areas.find((a) => a.id === store.area_id)?.name ?? 'الحسينية'}</span>
                          <span className={store.is_open ? 'text-success font-medium' : ''}>
                            {store.is_open ? 'مفتوح الآن' : 'مغلق'}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
