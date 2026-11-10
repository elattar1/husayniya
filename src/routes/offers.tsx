import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Flame,
  Percent,
  Clock,
  Tag,
  Copy,
  Check,
  ShoppingCart,
  Store,
  Truck,
  Sparkles,
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  Gift,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { pageMeta } from "@/lib/page-meta";
import { useOffersVisibility } from "@/lib/use-offers-visibility";
import { toast } from "sonner";

export const Route = createFileRoute("/offers")({
  head: () =>
    pageMeta(
      "عروض وتخفيضات الحسينية 🔥",
      "أقوى العروض الحصرية والخصومات اليومية من مطاعم ومتاجر الحسينية مع التوصيل السريع لجميع القرى والمراكز"
    ),
  component: OffersPage,
});

// باقات الكوبونات المتاحة
const PROMO_COUPONS = [
  {
    code: "HUSAYNIYA20",
    discount: "خصم 20 ج.م",
    condition: "للطلبات فوق 120 ج.م",
    badge: "الأكثر استخداماً",
    color: "from-amber-500 to-orange-600",
  },
  {
    code: "FREE-DELIVERY",
    discount: "توصيل مجاني 🚚",
    condition: "للطلبات فوق 150 ج.م",
    badge: "عرض خاص",
    color: "from-emerald-600 to-teal-700",
  },
  {
    code: "WEEKEND15",
    discount: "خصم 15%",
    condition: "على قسم المطاعم والوجبات",
    badge: "نهاية الأسبوع",
    color: "from-purple-600 to-indigo-700",
  },
];

// بيانات العروض الواقعية لمتاجر الحسينية
const DEALS_DATA = [
  {
    id: "deal-1",
    store_id: "20000000-0000-0000-0000-000000000001",
    store_name: "مطعم وكافيه الباشا",
    store_area: "الحسينية - شارع المركز",
    category: "restaurants",
    name: "عرض الكومبو العائلي (2 برجر دبل تشيز + بيتزا وسط + بطاطس وبيبسي لتر)",
    description: "وجبة مشبعة تكفي من 3 إلى 4 أفراد بأعلى جودة مع الصوصات والبطاطس المقرمشة.",
    original_price: 260,
    discount_price: 189,
    discount_percent: 27,
    savings: 71,
    image_url: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=700&auto=format&fit=crop&q=80",
    claimed_percentage: 86,
    is_flash: true,
    free_delivery: true,
    rating: 4.9,
  },
  {
    id: "deal-2",
    store_id: "20000000-0000-0000-0000-000000000006",
    store_name: "سوبر ماركت أولاد رجب",
    store_area: "الحسينية - الميدان الرئيسي",
    category: "supermarkets",
    name: "باقة الخير الأسبوعية (زيت عافية 800 مل + سكر أبيض فاخر 1 كجم + أرز مصري درجة أولى)",
    description: "أجود السلع التموينية والأساسية للمنزل بخصم حقيقي وتوفير مباشر.",
    original_price: 180,
    discount_price: 139,
    discount_percent: 23,
    savings: 41,
    image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=700&auto=format&fit=crop&q=80",
    claimed_percentage: 74,
    is_flash: false,
    free_delivery: false,
    rating: 4.8,
  },
  {
    id: "deal-3",
    store_id: "20000000-0000-0000-0000-000000000002",
    store_name: "حضرموت شيخ العرب",
    store_area: "الحسينية - أمام البنك الأهلي",
    category: "restaurants",
    name: "صينية تكا شيخ العرب (فرخة تكا كاملة على الفحم + أرز بسمتي بالخلطة + طحينة ومخلل)",
    description: "فراخ طازجة متبلة بخلطة حضرموت الأصلية مشوية على الفحم مع خبز سخن.",
    original_price: 240,
    discount_price: 175,
    discount_percent: 27,
    savings: 65,
    image_url: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=700&auto=format&fit=crop&q=80",
    claimed_percentage: 92,
    is_flash: true,
    free_delivery: true,
    rating: 4.9,
  },
  {
    id: "deal-4",
    store_id: "20000000-0000-0000-0000-000000000003",
    store_name: "صيدلية د. العطار",
    store_area: "الحسينية - بجوار المستشفى المركزي",
    category: "pharmacies",
    name: "باقة تقوية المناعة والنشاط (فيتامين سي 1000 مجم فوار + زنك وأوميجا 3 أصلية)",
    description: "مكملات غذائية أصلية ومصرحة من وزارة الصحة لدعم صحة الأسرة والمناعة.",
    original_price: 155,
    discount_price: 115,
    discount_percent: 26,
    savings: 40,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80",
    claimed_percentage: 65,
    is_flash: false,
    free_delivery: false,
    rating: 4.9,
  },
  {
    id: "deal-5",
    store_id: "20000000-0000-0000-0000-000000000005",
    store_name: "بيتزا وحلواني الإمبراطور",
    store_area: "الحسينية - شارع المدارس",
    category: "restaurants",
    name: "عرض الثنائي (بيتزا لارج سوبر سوبريم + فطيرة نوتيلا كراميل مكسرات صغيرة)",
    description: "عجينة إيطالية خفيفة غنية بالجبن الموتزاريلا الطبيعي مع تحلية نوتيلا ساخنة.",
    original_price: 215,
    discount_price: 159,
    discount_percent: 26,
    savings: 56,
    image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80",
    claimed_percentage: 80,
    is_flash: false,
    free_delivery: true,
    rating: 4.7,
  },
  {
    id: "deal-6",
    store_id: "20000000-0000-0000-0000-000000000007",
    store_name: "هايبر ماركت المدينة",
    store_area: "الحسينية - مدخل المدينة",
    category: "supermarkets",
    name: "عرض الألبان الفاخر (جبنة رومي قديمة 250 جم + حليب جهينة كامل الدسم + جبنة بيضاء براميلي)",
    description: "منتجات ألبان طازجة يومياً من أفضل المزارع المصرية الموثوقة.",
    original_price: 165,
    discount_price: 125,
    discount_percent: 24,
    savings: 40,
    image_url: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=700&auto=format&fit=crop&q=80",
    claimed_percentage: 70,
    is_flash: false,
    free_delivery: false,
    rating: 4.8,
  },
];

function OffersPage() {
  const cart = useCart();
  const { isVisible: isOffersVisible } = useOffersVisibility();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // عداد تنازلي لعروض اليوم الخاطفة (Flash Deals)
  const [timeLeft, setTimeLeft] = useState({ hours: 6, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // إذا كانت تابة العروض مخفية من الإدارة
  if (!isOffersVisible) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md mx-auto space-y-4 rounded-3xl border bg-card p-8 shadow-soft">
          <div className="size-16 rounded-full bg-muted grid place-items-center mx-auto text-2xl">
            🔒
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            قسم العروض غير متاح حالياً
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تم إيقاف تابة وقسم العروض مؤقتاً بواسطة الإدارة للتحديث وتجهيز عروض وتخفيضات جديدة لأهل الحسينية الكرام. تصفح باقي خدمات ومتاجر المدينة بكل سهولة.
          </p>
          <div className="pt-2">
            <Button asChild className="font-bold">
              <Link to="/">العودة للمتاجر والخدمات</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // نسخ كود الخصم
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`تم نسخ الكوبون: ${code}، يمكنك استخدامه عند الدفع!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // إضافة العرض للسلة مباشرة
  const handleAddToCart = (deal: (typeof DEALS_DATA)[0]) => {
    const added = cart.add(
      { id: deal.store_id, name: deal.store_name },
      {
        product_id: deal.id,
        name: deal.name,
        price: deal.discount_price,
      }
    );
    if (added) {
      toast.success(`تمت إضافة "${deal.name}" إلى سلتك بسعر العرض (${deal.discount_price} ج.م)`);
    }
  };

  // تصفية العروض حسب التبويب
  const filteredDeals = DEALS_DATA.filter((d) => {
    if (activeTab === "all") return true;
    if (activeTab === "flash") return d.is_flash;
    if (activeTab === "free_delivery") return d.free_delivery;
    return d.category === activeTab;
  });

  const flashDealOfTheDay = DEALS_DATA[0];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 1. البانر الترويجي الكبير والعداد التنازلي */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#063b36] via-[#094d47] to-primary text-white py-12 px-4 md:py-16 shadow-md">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1.5px,transparent_1.5px)] [background-size:20px_20px]" />
        
        <div className="mx-auto max-w-6xl relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full liquid-glass-rect px-3.5 py-1 text-xs font-semibold text-white/95">
            <Flame className="size-4 animate-bounce text-amber-300" />
            عروض حصرية لأهل الحسينية الكرام
          </div>

          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl text-white drop-shadow-md">
            عروض وتخفيضات الحسينية 🔥
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-white/90 leading-relaxed font-medium">
            وفر مع أقوى العروض اليومية، باقات الوجبات، وتخفيضات السوبر ماركت والصيدليات مع خدمة التوصيل السريع لجميع القرى والمراكز.
          </p>

          {/* عداد العروض الخاطفة بنمط الليكويد جلاس المستطيل المعتمد بالموقع */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-3 rounded-xl liquid-glass-rect px-5 py-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                <Clock className="size-4 animate-spin text-amber-300" />
                تنتهي صفقات اليوم خلال:
              </div>
              <div className="flex items-center gap-1 font-mono text-sm font-bold text-white" dir="ltr">
                <span className="bg-white/20 px-2 py-0.5 rounded text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span>:</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-white">{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. كوبونات الخصم السريعة القابلة للنسخ */}
      <section className="mx-auto max-w-6xl px-4 -mt-5 relative z-20">
        <div className="grid gap-3 sm:grid-cols-3">
          {PROMO_COUPONS.map((coupon) => (
            <div
              key={coupon.code}
              className="rounded-2xl border bg-card p-4 shadow-soft flex items-center justify-between gap-3 transition-all hover:shadow-md"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold">
                    {coupon.badge}
                  </span>
                  <span className="font-bold text-sm text-foreground">{coupon.discount}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{coupon.condition}</p>
                <code className="inline-block text-xs font-mono font-bold text-primary mt-1" dir="ltr">
                  {coupon.code}
                </code>
              </div>

              <Button
                size="sm"
                variant={copiedCode === coupon.code ? "default" : "outline"}
                onClick={() => handleCopyCode(coupon.code)}
                className="shrink-0 text-xs font-semibold h-9 gap-1.5 border-dashed"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    نسخ الكود
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. صفقة اليوم الخاطفة (Flash Spotlight) */}
      <section className="mx-auto max-w-6xl px-4 mt-8">
        <div className="rounded-3xl border bg-gradient-to-r from-amber-500/10 via-card to-card p-5 sm:p-7 shadow-soft overflow-hidden relative">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* صورة المنتج مع شارة الخصم */}
            <div className="relative w-full md:w-80 h-52 sm:h-64 rounded-2xl overflow-hidden shrink-0 shadow-md">
              <img
                src={flashDealOfTheDay.image_url}
                alt={flashDealOfTheDay.name}
                className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-3 right-3 rounded-xl bg-destructive text-destructive-foreground px-3 py-1 text-xs font-extrabold shadow-md flex items-center gap-1">
                <Flame className="size-3.5" />
                خصم {flashDealOfTheDay.discount_percent}%
              </div>
              {flashDealOfTheDay.free_delivery && (
                <div className="absolute bottom-3 right-3 rounded-lg bg-emerald-600 text-white px-2.5 py-0.5 text-[11px] font-bold shadow-md flex items-center gap-1">
                  <Truck className="size-3" />
                  توصيل مجاني
                </div>
              )}
            </div>

            {/* تفاصيل صفقة اليوم */}
            <div className="flex-1 space-y-3 text-right w-full">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 px-3 py-0.5 text-xs font-bold">
                  ⚡ صفقة اليوم الكبرى
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Store className="size-3.5 text-primary" />
                  {flashDealOfTheDay.store_name}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                {flashDealOfTheDay.name}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {flashDealOfTheDay.description}
              </p>

              {/* الأسعار ونسبة التوفير */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-extrabold text-primary">
                  {flashDealOfTheDay.discount_price} ج.م
                </span>
                <span className="text-base text-muted-foreground line-through">
                  {flashDealOfTheDay.original_price} ج.م
                </span>
                <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs px-2 py-0.5">
                  وفرت {flashDealOfTheDay.savings} ج.م 🎉
                </span>
              </div>

              {/* شريط نسبة الحجز */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>تم طلب {flashDealOfTheDay.claimed_percentage}% من كمية العرض</span>
                  <span className="text-amber-600 font-bold">متبقي كمية محدودة</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${flashDealOfTheDay.claimed_percentage}%` }}
                  />
                </div>
              </div>

              {/* أزرار الإجراء */}
              <div className="flex items-center gap-3 pt-3">
                <Button
                  onClick={() => handleAddToCart(flashDealOfTheDay)}
                  className="flex-1 font-bold h-11 gap-2 shadow-sm"
                >
                  <ShoppingCart className="size-4" />
                  أضف للسلة بسعر العرض
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="font-semibold h-11"
                >
                  <Link to="/stores/$storeId" params={{ storeId: flashDealOfTheDay.store_id }}>
                    زيارة المتجر
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. تبويبات تصفية العروض */}
      <section className="mx-auto max-w-6xl px-4 mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            جميع العروض والتخفيضات
          </h2>
          <span className="text-xs text-muted-foreground font-medium">
            {filteredDeals.length} عرض متوفر حالياً
          </span>
        </div>

        {/* أزرار التصفية الأفقية */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "all", label: "🔥 كل العروض" },
            { id: "flash", label: "⚡ عروض خاطفة" },
            { id: "restaurants", label: "🍔 مطاعم ومأكولات" },
            { id: "supermarkets", label: "🛒 سوبر ماركت" },
            { id: "pharmacies", label: "💊 صيدليات وعناية" },
            { id: "free_delivery", label: "🚚 توصيل مجاني" },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="shrink-0 rounded-xl"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* شبكة كروت العروض */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {filteredDeals.map((deal) => (
            <article
              key={deal.id}
              className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-hover"
            >
              {/* صورة العرض مع الشارات */}
              <div className="relative h-48 w-full overflow-hidden bg-muted">
                <img
                  src={deal.image_url}
                  alt={deal.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2.5 right-2.5 rounded-lg bg-destructive text-destructive-foreground px-2.5 py-1 text-xs font-extrabold shadow-sm flex items-center gap-1">
                  <Percent className="size-3" />
                  خصم {deal.discount_percent}%
                </div>
                {deal.free_delivery && (
                  <div className="absolute top-2.5 left-2.5 rounded-lg bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm flex items-center gap-1">
                    <Truck className="size-3" />
                    توصيل مجاني
                  </div>
                )}
                <div className="absolute bottom-2.5 right-2.5 rounded-md bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 text-[10px] font-medium flex items-center gap-1">
                  <Star className="size-3 text-amber-400 fill-amber-400" />
                  {deal.rating}
                </div>
              </div>

              {/* بيانات العرض والمتجر */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-primary">{deal.store_name}</span>
                    <span>{deal.store_area}</span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                    {deal.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {deal.description}
                  </p>
                </div>

                <div className="pt-2 border-t space-y-3">
                  {/* الأسعار والتوفير */}
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-extrabold text-primary">
                        {deal.discount_price} ج.م
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {deal.original_price} ج.م
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      وفرت {deal.savings} ج.م
                    </span>
                  </div>

                  {/* أزرار السلة وتصفح المتجر */}
                  <div className="grid grid-cols-5 gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(deal)}
                      className="col-span-4 font-bold text-xs h-10 gap-1.5 shadow-xs"
                    >
                      <ShoppingCart className="size-3.5" />
                      أضف للسلة بالعرض
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="col-span-1 h-10 px-0 grid place-items-center"
                      title="عرض المتجر"
                    >
                      <Link to="/stores/$storeId" params={{ storeId: deal.store_id }}>
                        <Store className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. شريط الأمان والضمان لأهل الحسينية */}
      <section className="mx-auto max-w-6xl px-4 mt-12">
        <div className="rounded-2xl border bg-card p-6 shadow-soft grid gap-4 sm:grid-cols-3 text-center">
          <div className="space-y-1.5">
            <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary mx-auto">
              <ShieldCheck className="size-5" />
            </div>
            <strong className="text-sm font-bold block">عروض حقيقية ومضمونة</strong>
            <span className="text-xs text-muted-foreground">تخفيضات موثوقة من أصحاب المتاجر والمطاعم المعتمدين</span>
          </div>

          <div className="space-y-1.5">
            <div className="grid size-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 mx-auto">
              <Truck className="size-5" />
            </div>
            <strong className="text-sm font-bold block">توصيل سريع لباب بيتك</strong>
            <span className="text-xs text-muted-foreground">أسطول كباتن جاهز لتوصيل طلباتك طازجة وسريعة</span>
          </div>

          <div className="space-y-1.5">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-500/10 text-amber-600 mx-auto">
              <Gift className="size-5" />
            </div>
            <strong className="text-sm font-bold block">نقاط وهدايا مستمرة</strong>
            <span className="text-xs text-muted-foreground">كوبونات خصم وتخفيضات تتجدد أسبوعياً لجميع الطلبات</span>
          </div>
        </div>
      </section>
    </div>
  );
}
