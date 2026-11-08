import { useEffect, useState, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { Sparkles, ArrowLeft, LoaderCircle, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import type { Catalog } from '@/lib/customer-queries';
import { CATEGORY_ICONS } from '@/lib/labels';
import { recommendationInput, type RecommendationOutput } from '@/lib/recommendation-rules';
import { recommendServices } from '@/lib/recommendations.functions';
import { matchRecommendations } from '@/lib/recommendation-matcher';
import { REAL_PRODUCTS } from '@/lib/real-stores-data';

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

  async function performSearch(queryText: string) {
    const text = queryText.trim();
    if (!text) {
      setError('يرجى كتابة ما تبحث عنه');
      return;
    }
    setBusy(true);
    setError('');
    setResult(null);

    try {
      // 1. مطابقة مباشرة وفورية مع قاعدة البيانات الكاملة للمتاجر والمنتجات
      const localMatches = matchRecommendations(
        text,
        Number(area) || null,
        catalog.stores,
        REAL_PRODUCTS
      );

      // 2. إذا كان المستخدم مسجلًا للدخول، نحاول الاستعلام عن خادم الاقتراحات للتعزيز
      if (user) {
        try {
          const parsed = recommendationInput.safeParse({
            description: text,
            area_id: Number(area) || null,
          });
          if (parsed.success) {
            const serverRes = await recommend({ data: parsed.data });
            if (serverRes && serverRes.ok && serverRes.suggestions.length > 0) {
              setResult(serverRes);
              return;
            }
          }
        } catch (serverErr) {
          console.warn('Server recommendation fallback to live catalog matcher:', serverErr);
        }
      }

      // عرض نتائج محرك المطابقة المربوط بقاعدة البيانات والمنيو
      setResult(localMatches);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذر البحث عن اقتراحات الآن');
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    performSearch(description);
  }

  return (
    <section aria-labelledby="recommendation-heading" className="border-b bg-gradient-to-b from-secondary/50 via-secondary/20 to-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        {/* صندوق البحث البسيط والحديث */}
        <div className="rounded-2xl border border-border/80 bg-card/95 p-5 shadow-soft backdrop-blur-md md:p-7">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 id="recommendation-heading" className="text-xl font-bold md:text-2xl">
                بتدور على إيه؟
              </h2>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <div className="relative">
              <Textarea
                aria-label="وصف الخدمة أو الوجبة المطلوبة"
                placeholder={typed ? `${typed} |` : 'اكتب طلبك أو مشكلتك هنا...'}
                value={description}
                maxLength={1500}
                disabled={busy}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setError('');
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

            <div className="pt-1">
              <Button
                type="submit"
                disabled={busy || !description.trim()}
                className="h-11 w-full sm:w-auto px-6 rounded-xl text-sm font-semibold shadow-sm transition-transform active:scale-[0.98]"
              >
                {busy ? <LoaderCircle className="ml-2 size-4 animate-spin" /> : <Search className="ml-2 size-4" />}
                {busy ? 'جاري البحث في المتاجر والمنيو...' : 'ابحث واقترح لي الأنسب'}
              </Button>
            </div>
          </form>

          {/* نتائج الاقتراحات */}
          <div aria-live="polite" aria-busy={busy}>
            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
            {result && (
              <div className="mt-6 border-t pt-5">
                {result.suggestions.length > 0 ? (
                  <>
                    <p className="mb-4 text-sm font-semibold text-foreground">{result.summary}</p>
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
                                <div className="flex items-center gap-2 min-w-0">
                                  {store.logo_url ? (
                                    <img
                                      src={store.logo_url}
                                      alt=""
                                      loading="lazy"
                                      className="size-9 rounded-lg object-cover border"
                                    />
                                  ) : (
                                    <span className="grid size-9 place-items-center rounded-lg bg-secondary text-lg">
                                      {CATEGORY_ICONS[store.category]}
                                    </span>
                                  )}
                                  <h3 className="truncate text-base font-semibold group-hover:text-primary transition-colors">
                                    {store.name}
                                  </h3>
                                </div>
                                <ArrowLeft className="size-4 shrink-0 text-primary transition-transform group-hover:-translate-x-1" />
                              </div>
                              <p className="mb-3 mt-2 break-words text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {suggestion.reason}
                              </p>
                            </div>
                            <div className="flex flex-wrap justify-between gap-2 border-t pt-2 text-xs text-muted-foreground">
                              <span>{catalog.areas.find((a) => a.id === store.area_id)?.name ?? 'الحسينية'}</span>
                              <span className={store.is_open ? 'text-emerald-600 font-semibold' : ''}>
                                {store.is_open ? '🟢 مفتوح الآن' : '⚪ مغلق'}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 text-center sm:p-6 space-y-4">
                    <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-primary/10 text-2xl">
                      😂
                    </div>
                    <p className="text-base font-semibold leading-relaxed text-foreground md:text-lg max-w-xl mx-auto">
                      {result.summary}
                    </p>
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground mb-3 font-medium">
                        جرّب تبحث عن حاجات متوفرة عندنا في الحسينية:
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {[
                          'كباب وكفتة من الباز',
                          'بيتزا مقرمشة من السندباد',
                          'سباك شاطر لتسريب الحوض',
                          'صيدلية 24 ساعة',
                          'دكتور باطنة وأطفال',
                          'طلبات سوبر ماركت وبقالة',
                        ].map((hint) => (
                          <button
                            key={hint}
                            type="button"
                            onClick={() => {
                              setDescription(hint);
                              performSearch(hint);
                            }}
                            className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer shadow-xs"
                          >
                            {hint}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
