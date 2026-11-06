import type { SearchSchemaInput } from '@tanstack/react-router';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Search, MapPin, ArrowLeft, Star, Clock3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pageMeta } from '@/lib/page-meta';
import { catalogQuery } from '@/lib/customer-queries';
import { CATEGORY_ICONS, money } from '@/lib/labels';
import { CustomerError, CustomerNotFound } from '@/components/CustomerFeedback';
import hero from '@/assets/hero.jpg';
import { ServiceRecommendations } from '@/components/ServiceRecommendations';

export const Route = createFileRoute('/')({
  validateSearch: (s: SearchSchemaInput & { q?: unknown; category?: unknown; area?: unknown }) => ({
    q: typeof s.q === 'string' ? s.q : '',
    category: typeof s.category === 'string' ? s.category : '',
    area: typeof s.area === 'string' ? s.area : '',
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData({ ...catalogQuery, revalidateIfStale: true }),
  head: () =>
    pageMeta(
      'المتاجر والخدمات في الحسينية',
      'ابحث عن متاجر الحسينية والمطاعم والأطباء والخدمات المنزلية، واطلب وتابع طلبك من مكان واحد'
    ),
  component: Browse,
  errorComponent: CustomerError,
  notFoundComponent: CustomerNotFound,
});

function Browse() {
  const { data } = useSuspenseQuery(catalogQuery);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const update = (values: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...values }), replace: true });

  const stores = data.stores.filter(
    (s) =>
      (!search.category || s.category === search.category) &&
      (!search.area || String(s.area_id) === search.area) &&
      `${s.name} ${s.description} ${s.specialty ?? ''}`.includes(search.q.trim())
  );

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={hero}
          alt="الحسينية بمحافظة الشرقية"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto max-w-6xl px-4 py-12 text-primary-foreground md:py-16">
          <p className="mb-3 flex items-center gap-2 text-sm font-medium text-white/90 drop-shadow-sm">
            <MapPin size={16} className="text-white" /> الحسينية، الشرقية
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md md:text-5xl">
            خدمات الحسينية
          </h1>
          <p className="mb-8 mt-3 text-lg text-white/90 drop-shadow-sm max-w-xl">
            متاجر بلدك وخدماتها، أقرب إليك.
          </p>

          {/* خانتا البحث واختيار المنطقة مستطيلتان ومنفصلتان بالليكويد جلاس الفاخر وبشفافية موزونة */}
          <div className="flex max-w-3xl flex-col gap-3 sm:flex-row">
            {/* خانة البحث المستطيلة المنفصلة */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-5 text-white/85" />
              <input
                type="text"
                className="liquid-glass-rect h-12 w-full rounded-xl border pr-11 pl-10 text-base font-medium text-white placeholder:text-white/80 focus:outline-none focus:ring-2 focus:ring-white/70 focus:bg-white/40 transition-all"
                aria-label="البحث عن خدمة أو متجر"
                placeholder="ابحث عن مطعم، صيدلية، طبيب، سباك أو متجر..."
                value={search.q}
                onChange={(e) => update({ q: e.target.value })}
              />
              {search.q && (
                <button
                  type="button"
                  onClick={() => update({ q: '' })}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full size-6 grid place-items-center text-white/80 hover:text-white hover:bg-white/30 transition-all"
                  title="مسح البحث"
                  aria-label="مسح البحث"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* قائمة اختيار المنطقة المستطيلة المنفصلة */}
            <div className="relative sm:w-56">
              <MapPin className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-white/85" />
              <select
                aria-label="المنطقة"
                className="liquid-glass-rect h-12 w-full appearance-none rounded-xl border pr-10 pl-8 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-white/70 focus:bg-white/40 transition-all cursor-pointer"
                value={search.area}
                onChange={(e) => update({ area: e.target.value })}
              >
                <option value="" className="bg-slate-900 text-white font-medium">كل المناطق في الحسينية</option>
                {data.areas.map((a) => (
                  <option key={a.id} value={a.id} className="bg-slate-900 text-white font-medium">
                    {a.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/80 text-xs">
                ▼
              </div>
            </div>
          </div>
        </div>
      </section>

      <ServiceRecommendations catalog={data} area={search.area} />

      <section className="mx-auto max-w-6xl px-4 py-7">
        <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
          <Button variant={!search.category ? 'default' : 'outline'} onClick={() => update({ category: '' })}>
            كل الخدمات
          </Button>
          {data.categories.map((c) => (
            <Button
              className="shrink-0"
              key={c.slug}
              variant={search.category === c.slug ? 'default' : 'outline'}
              onClick={() => update({ category: c.slug })}
            >
              <span>{CATEGORY_ICONS[c.slug]}</span>
              {c.name}
            </Button>
          ))}
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl">
            {data.categories.find((c) => c.slug === search.category)?.name ?? 'اكتشف متاجر الحسينية'}
          </h2>
          <span className="text-sm text-muted-foreground">{stores.length} متجر ومقدم خدمة</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => {
            const banner = s.banner_url || s.logo_url;
            return (
              <Link
                key={s.id}
                to="/stores/$storeId"
                params={{ storeId: s.id }}
                className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-hover"
              >
                {/* الجزء العلوي: صورة البانر تحت اللوجو مع تدرج لأسفل */}
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  {banner ? (
                    <img
                      src={banner}
                      alt={`بانر ${s.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/10 via-muted to-card" />
                  )}

                  {/* تدرج فيد من الأعلى للأسفل ليندمج تماماً مع خلفية البطاقة */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-card/50 to-card" />

                  {/* الشارات العلوية: القسم وحالة الفتح/الإغلاق فوق البانر */}
                  <div className="absolute inset-x-3.5 top-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                      {data.categories.find((c) => c.slug === s.category)?.name}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md ${
                        s.is_open ? 'bg-emerald-600/90 text-white shadow-sm' : 'bg-black/60 text-white/80'
                      }`}
                    >
                      <Clock3 size={12} />
                      {s.is_open ? 'مفتوح' : 'مغلق'}
                    </span>
                  </div>

                  {/* اللوجو فوق صورة البانر مع اسم المتجر والمنطقة */}
                  <div className="absolute inset-x-3.5 bottom-2 flex items-end gap-3">
                    {s.logo_url ? (
                      <img
                        src={s.logo_url}
                        alt={`لوجو ${s.name}`}
                        loading="lazy"
                        className="size-14 shrink-0 rounded-xl border-2 border-card bg-card object-cover shadow-md"
                      />
                    ) : (
                      <span className="grid size-14 shrink-0 place-items-center rounded-xl border-2 border-card bg-card text-2xl shadow-md">
                        {CATEGORY_ICONS[s.category]}
                      </span>
                    )}
                    <div className="min-w-0 flex-1 pb-0.5">
                      <h3 className="truncate text-base font-bold text-foreground transition-colors group-hover:text-primary">
                        {s.name}
                      </h3>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                        <MapPin size={12} className="shrink-0 text-primary" />
                        {data.areas.find((a) => a.id === s.area_id)?.name ?? 'الحسينية'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* باقي البيانات تظهر بوضوح تام أسفل التدرج */}
                <div className="flex flex-1 flex-col p-4 pt-2">
                  <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                    {s.description || s.specialty}
                  </p>

                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                    <span className="flex items-center gap-1 font-medium">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {s.reviews_count ? `${s.rating} (${s.reviews_count} تقييم)` : 'جديد'}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-primary transition-transform group-hover:-translate-x-1">
                      {s.category === 'doctors' ? money(s.booking_fee) : 'عرض المتجر'}
                      <ArrowLeft size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!stores.length && (
          <div className="space-y-4 py-16 text-center">
            <Search className="mx-auto size-10 text-muted-foreground" />
            <h3>لا توجد نتائج مطابقة</h3>
            <Button variant="outline" onClick={() => update({ q: '', category: '', area: '' })}>
              مسح البحث
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
