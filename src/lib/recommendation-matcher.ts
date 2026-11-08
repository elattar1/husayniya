import { REAL_PRODUCTS, type RealProduct, type RealStore } from './real-stores-data.ts';
import type { RecommendationOutput } from './recommendation-rules';

export type StoreForMatch = Pick<
  RealStore,
  'id' | 'name' | 'category' | 'area_id' | 'description' | 'specialty' | 'is_open'
>;

// كلمات شائعة وحروف جر نتجاهلها لمنع التطابقات غير المرتبطة
const STOP_WORDS = new Set([
  'في', 'من', 'على', 'عن', 'الى', 'إلى', 'مع', 'او', 'أو', 'ثم', 'حتى',
  'عايز', 'عايزه', 'محتاج', 'محتاجه', 'نفسي', 'بدور', 'دورلي', 'ابعتلي',
  'عاوز', 'عاوزه', 'بدي', 'احتاج', 'اريد', 'لو', 'سمحت', 'ياريت',
  'شاطر', 'كويس', 'ممتاز', 'احسن', 'افضل', 'اقرب', 'ارخص', 'انظف',
  'علشان', 'عشان', 'بتاع', 'بتاعة', 'بتاعت', 'لي', 'ليا', 'ليه',
  'واحد', 'واحده', 'كدا', 'كده', 'جدا', 'خالص', 'بسرعه', 'دلوقتي', 'النهارده', 'بكره'
]);

// تنظيف وتوحيد الحروف العربية للبحث الذكي
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[ًٌٍَُِّْـ]/g, '') // إزالة التشكيل والتطويل
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/[^a-z0-9\u0621-\u064A\s]/g, ' ') // إزالة الرموز
    .replace(/\s+/g, ' ')
    .trim();
}

// قواميس الكلمات المفتاحية لمطاعم وخدمات الحسينية
const INTENT_KEYWORDS: Record<string, { category: string; storeHints?: string[]; keywords: string[]; defaultReason: string }> = {
  grills: {
    category: 'restaurants',
    storeHints: ['الباز', 'مشويات', 'كبابجي', 'الامانه'],
    keywords: ['مشويات', 'مشوي', 'كباب', 'كفته', 'ريش', 'طرب', 'لحم', 'لحمه', 'ميكس جريل', 'فراخ مشويه', 'شيش طاووق', 'حمام', 'طاجن', 'طواجن', 'عزومه', 'سلطات', 'طحينه'],
    defaultReason: 'يقدم أشهر المشويات واللحوم البلدي والطواجن الطازجة مع السلطات والعيش البلدي',
  },
  pizza: {
    category: 'restaurants',
    storeHints: ['السندباد', 'بيتزا'],
    keywords: ['بيتزا', 'بيتسا', 'مارجريتا', 'سوبريم', 'سوبر سوبريم', 'بيبروني', 'موتزاريلا', 'فطير', 'فطاير', 'ايطالي'],
    defaultReason: 'متخصص في البيتزا الإيطالية والفطائر الشرقية المقرمشة بحشوات متنوعة',
  },
  fastfood: {
    category: 'restaurants',
    storeHints: ['بازوكا', 'كريب', 'نعمه', 'الريم'],
    keywords: ['برجر', 'كريب', 'بانيني', 'كرسبي', 'استربس', 'فرايد تشيكن', 'زنجر', 'ساندوتش', 'وجبه', 'شاورما', 'حواوشي', 'ريزو'],
    defaultReason: 'يوفر أشهى سندوتشات البرجر والكريب والوجبات السريعة المقرمشة بالتوصيل السريع',
  },
  seafood: {
    category: 'restaurants',
    storeHints: ['اسماك', 'سمك', 'بحريات'],
    keywords: ['سمك', 'اسماك', 'جمبري', 'سبيط', 'سي فود', 'بحري', 'بلطي', 'بوري', 'مشوي رده', 'طاجن جمبري', 'سنجاري'],
    defaultReason: 'يوفر تشكيلة أسماك طازجة يومية مشوية ومقلية وطواجن جمبري بالخلطة الإسكندراني',
  },
  koshari: {
    category: 'restaurants',
    storeHints: ['كشري', 'التحرير', 'الزعيم'],
    keywords: ['كشري', 'دقه', 'تقليه', 'طاجن مكرونه', 'مكرونه باللحمه', 'صلصه', 'رز بلبن'],
    defaultReason: 'يقدم كشري مصري أصيل وطواجن مكرونة بالفرن وأطباق حلو طازجة',
  },
  breakfast: {
    category: 'restaurants',
    storeHints: ['الشبراوي', 'فول'],
    keywords: ['فول', 'فلافل', 'طعميه', 'بطاطس', 'باذنجان', 'فطار', 'سحور', 'سلطه بلدي'],
    defaultReason: 'يقدم أفضل وجبات الفطور الشعبي من الفول المدمس والفلافل الساخنة والمقبلات',
  },
  cafe: {
    category: 'restaurants',
    storeHints: ['كافيه', 'مقهى', 'رويال'],
    keywords: ['قهوه', 'كافيه', 'شاي', 'لاتيه', 'عصير', 'سموزي', 'ايس كوفي', 'مشروبات', 'قعده'],
    defaultReason: 'جلسات راقية ومشروبات ساخنة وعصائر طبيعية طازجة',
  },
  supermarket: {
    category: 'supermarkets',
    storeHints: ['سوبر ماركت', 'ماركت', 'الشيماء', 'الان'],
    keywords: ['سوبر ماركت', 'بقاله', 'جبنه', 'جبن', 'رومي', 'حليب', 'لبن', 'بيض', 'زيت', 'ارز', 'رز', 'سكر', 'شاي', 'منظفات', 'معلبات', 'تونه', 'مكرونه', 'بسكوت', 'طلبات بيت'],
    defaultReason: 'يوفر جميع مستلزمات البقالة والمواد الغذائية والألبان والمنظفات بأسعار مناسبة',
  },
  pharmacy: {
    category: 'pharmacies',
    storeHints: ['صيدليه', 'الفتح', 'الحسينيه الجديده'],
    keywords: ['صيدليه', 'دواء', 'دوا', 'روشته', 'علاج', 'مسكن', 'بنادول', 'حقن', 'كمامه', 'حفاضات', 'حليب اطفال', 'فيتامين', 'مضاد حيوي', 'شاش', 'قطن', 'ضغط', 'سكر', '24 ساعه'],
    defaultReason: 'صيدلية متكاملة توفر الأدوية والمستلزمات الطبية ورعاية على مدار 24 ساعة',
  },
  doctor: {
    category: 'doctors',
    storeHints: ['دكتور', 'عياده', 'طبيب', 'عناني', 'شهاب', 'الدسوقي'],
    keywords: ['دكتور', 'طبيب', 'عياده', 'كشف', 'اسنان', 'باطنه', 'اطفال', 'عظام', 'جلديه', 'عيون', 'انف واذن', 'مخ واعصاب', 'نساء وتوليد', 'سونار', 'تحليل'],
    defaultReason: 'كشف واستشارات طبية متخصصة مع إمكانية حجز الموعد مسبقًا',
  },
  plumbing: {
    category: 'maintenance',
    storeHints: ['سباك', 'سباكه', 'احمد'],
    keywords: ['سباك', 'سباكه', 'تسريب', 'حنفيات', 'خلاط', 'مواسير', 'حوض', 'بالوعه', 'سخان', 'ماتور ميه', 'تاسيس سباكه'],
    defaultReason: 'فني سباكة معتمد لصيانة التسريبات وتأسيس وصيانة شبكات المياه والصرف الصحي',
  },
  electrical: {
    category: 'maintenance',
    storeHints: ['كهربائي', 'كهرباء', 'محمود علي'],
    keywords: ['كهربائي', 'كهرباء', 'نجف', 'ليد', 'بروفايل', 'فيشه', 'مفتاح كهرباء', 'اسلاك', 'لوحه', 'قاطع'],
    defaultReason: 'فني كهرباء متخصص في تركيب النجف والإضاءات الحديثة وصيانة الأعطال المنزلية',
  },
  ac: {
    category: 'maintenance',
    storeHints: ['تكييف', 'تبريد', 'احمد ابراهيم'],
    keywords: ['تكييف', 'تكييفات', 'فريون', 'شحن فريون', 'صيانه تكييف', 'شارب', 'كارير', 'تبريد'],
    defaultReason: 'صيانة دورية وشحن فريون وتنظيف وحدات التكييف بأحدث الأجهزة',
  },
  carpentry: {
    category: 'maintenance',
    storeHints: ['نجار', 'نجاره', 'سامح'],
    keywords: ['نجار', 'نجاره', 'دولاب', 'باب', 'شباك', 'كالون', 'اوكره', 'تنجيد', 'انتريه', 'مطبخ خشب'],
    defaultReason: 'نجارة منزلية متخصصة في تصليح الأبواب والدواليب والمطابخ وتغيير الكوالين',
  },
  appliances: {
    category: 'maintenance',
    storeHints: ['صيانه اجهزه', 'غسالات'],
    keywords: ['غساله', 'غسالات', 'ثلاجه', 'بوتاجاز', 'سخان غاز', 'فرن', 'مروحه', 'ميكروويف'],
    defaultReason: 'صيانة فورية للأجهزة الكهربائية وقطع غيار أصلية في المنزل',
  },
  moving: {
    category: 'home',
    storeHints: ['نقل عفش', 'ونش', 'البرنس'],
    keywords: ['نقل عفش', 'ونش', 'رفع عفش', 'تغليف', 'عربيات نقل', 'اثاث', 'فك وتركيب'],
    defaultReason: 'سيارات نقل مجهزة وأوناش رفع عفش هيدروليكية مع تغليف كامل للأثاث',
  },
  pest: {
    category: 'home',
    storeHints: ['مكافحه حشرات', 'رش', 'الالمانيه'],
    keywords: ['حشرات', 'رش', 'مبيدات', 'نمل', 'صراصير', 'بق', 'فئران', 'تعقيم', 'نظافه'],
    defaultReason: 'مكافحة آمنة للحشرات والقوارض بأمصال معتمدة وتعقيم شامل للمنزل',
  },
  gifts: {
    category: 'gifts',
    storeHints: ['ورد', 'هدايا', 'لافندر'],
    keywords: ['ورد', 'بوكيه', 'شوكولاته', 'هديه', 'هدايا', 'عيد ميلاد', 'تغليف', 'ساعه', 'برفان', 'عطور'],
    defaultReason: 'بوكيهات ورد طبيعي وتغليف هدايا راقية مع بوكسات شوكولاتة للمناسبات',
  },
};

/**
 * ردود فكاهية ذكية باللهجة المصرية عند كتابة استفسار ليس له علاقة بالمتاجر أو الخدمات
 */
export function getHumorousEgyptianReply(rawQuery: string): string {
  const norm = normalizeArabic(rawQuery);

  // 1. الجواز والارتباط والعلاقات والخطوبة
  if (/(جواز|اتجوز|عروس|عريس|مزه|بنت الحلال|حب عمري|بحبك|خطوب|ارتبط|شريكه حيات|مطلقه|عانس|رومانس|ماذون)/.test(norm)) {
    return 'يا سيدي ألف مبروك مقدماً وربنا يرزقك ببنت الحلال وتفرح بيك الحسينية كلها! 💍 بس إحنا هنا بنوصل أكل ودوا وسباكة مش مأذون شرعي ولا خطّابة! 😂 بس لما ترتبط وعايز تورتة خطوبة أو بوكيه ورد وعشا رومانسي.. إحنا في الخدمة!';
  }

  // 2. الفضاء والصواريخ والخيال العلمي
  if (/(صاروخ|مركب.*فضائي|فضاء|مريخ|ناسا|كائن.*فضائي|سفين.*فضاء|قمر صناعي|مجره|كوكب|نيزك|فضائيين)/.test(norm)) {
    return 'صاروخ فضائي في الحسينية يا فنان؟! 🚀 إحنا آخرنا توكتوك طيارة يوصلك الطلب في خمس دقايق وميوقفهوش أي مطب، إنما المريخ دا تركبله من موقف فاقوس بقى! 😂 خليك في كريب أو بيتزا تدفيك!';
  }

  // 3. السياسة والبرلمان والرؤساء
  if (/(رئيس|حكوم|وزير|مجلس شعب|برلمان|انتخاب|سياس|البيت الابيض|امم متحد|بايدن|ترامب|بوتين)/.test(norm)) {
    return 'يا باشا إحنا ناس غلابة بتوع كشري وبيتزا وكباب وسباكة! 🚓😅 خلينا في أكل العيش وطلب العشا الحلو وروق بالك وبلاش السكة دي عشان منروحش ورا مصنع الكراسي! 😉';
  }

  // 4. السلاح والعنف والممنوعات
  if (/(سلاح|قنبل|مسدس|بندق|دباب|خناق|ضرب نار|مخدر|بانجو|حشيش|بودر|سم|مطوه|سنج|قتل)/.test(norm)) {
    return 'ألو النجدة؟! 🚨👮‍♂️ يا عم صلي على النبي! إحنا هنا بتوع كباب وكفتة وفول وطعمية وصيدليات.. مش في فيلم إبراهيم الأبيض! اطلبلك طاجن سخن يروق أعصابك ويهدي النفوس أحسن!';
  }

  // 5. الفلوس والقروض والذهب والثراء السريع
  if (/(فلوس|سلف|مليون|مليار|قرض|ذهب|كنز|دولار|يورو|عاوز فلوس|محتاج فلوس|غني|ثري)/.test(norm)) {
    return 'لو كان معانا ملايين وسلفيات مكناش فتحنا أبلكيشن ليل نهار في الحسينية! 💸 إحنا بنجيبلك الفطار والغدا والأدوية لحد باب بيتك، إنما السلف تلف والرد خسارة يا غالي! 😂';
  }

  // 6. الزهق والاكتئاب والنوم والملل
  if (/(زهقان|تعبان|مخنوق|حزين|ملل|عايز انام|نعسان|مكتئب|فشلت|ضايع|هموت|روتين|مخنوقه)/.test(norm)) {
    return 'سلامتك ألف سلامة من الزهق والخنقة يا غالي! ❤️ الدنيا والله متستاهلش.. اطلبلك وجبة فرايد تشيكن كرسبي أو كريب نوتيلا بالموز مع عصير مثلج وهتلاقي هرمون السعادة ضرب في السما! 🍔🥤';
  }

  // 7. المذاكرة والامتحانات والفيزياء
  if (/(امتحان|مذاكر|ثانوي|فيزيا|كيميا|معادل|مسال|دروس|واجب|دحيح|جامع|كليه)/.test(norm)) {
    return 'مسائل وفيزياء وكيمياء كمان؟! 📚 دا إحنا هربانين من المذاكرة بالعافية! قوم ذاكر يا بطل وإحنا علينا سندوتشات السهرة والقهوة المظبوطة اللي تخليك تفهم المنهج في قعدة واحدة! ☕🧠';
  }

  // 8. العربيات الفارهة والطيارات
  if (/(لامبورجيني|فيراري|طيار|يخت|هليكوبتر|تسلا|بورش|بي ام|رولز رويس|بوغاتي)/.test(norm)) {
    return 'لامبورجيني في شوارع الحسينية؟! المطبات هتعيط في الزاوية يا فنان! 🏎️😂 خدلك لفة مع كابتن التوصيل على الموتوسيكل أسرع وأشيك ومطبات بلدنا متقدرش عليه!';
  }

  // 9. الكورة والتعصب الكروي
  if (/(اهلي|زمالك|ريال مدريد|برشلون|ميسي|رونالدو|كوره|حكم|دوري|كاس العالم)/.test(norm)) {
    return 'سيب التعصب على جنب وخلينا في الأهم! ⚽ أيًا كان مين اللي كسبان ومين خسران، لازمك طاجن مشويات أو صينية بيتزا تروق بيها أعصابك وأنت بتتفرج على الماتش! 🍕';
  }

  // 10. الحيوانات المفترسة والغريبة
  if (/(اسد|نمر|فيل|ديناصور|تمساح|تعبان|قرد|زراف|حوت|قرش)/.test(norm)) {
    return 'ديناصور وأسد في الحسينية؟! 🦁🦖 كدا إحنا محتاجين نفتح قسم حديقة حيوانات بقى! إحنا آخرنا كبدة وحواوشي وفراخ وسوبر ماركت، تحب نطلبلك غدا معتبر يظبطك؟ 😂';
  }

  // 11. الدردشة والهزار والاستهبال
  if (/(مين انت|اسمك ايه|عامل ايه|ازيك|يا ابني|هزر|نكت|نكته|هههه|غبي|حمار|اهبل|بوت|روبوت)/.test(norm)) {
    return 'منور يا ابن الأصول وسكر محلي محطوط على كريمة! 😉 بس سيبك من الرغي دا وبطنك أولى.. قولي نفسك تاكل إيه أو محتاج خدمة إيه في الحسينية وطلبك مجاب في ثواني! 🍽️';
  }

  // 12. الرد العام الفكاهي لأي بحث عشوائي بعيد تماماً عن المتاجر
  const cleanQ = rawQuery.trim().slice(0, 50);
  return `يا باشا قلبنا الحسينية كلها من شارع المركز ومفارق القصاصين لحد الصالحية على "${cleanQ}" ملقيناش منها خالص! 😂 شكلها لسا منزلتش مصر.. جرب تطلب أكل، صيدلية، سباك، دكتور، أو بقالة وهنطير ونجيبهالك! 🛵💨`;
}

/**
 * محرك مطابقة ذكي يبحث في المتاجر والمنتجات وقاعدة البيانات
 * ويدعم المطاعم وكافة الخدمات باللهجة المصرية مع حس فكاهي عند الخروج عن السياق
 */
export function matchRecommendations(
  query: string,
  areaId: number | null | undefined,
  stores: StoreForMatch[],
  products: RealProduct[] = REAL_PRODUCTS
): RecommendationOutput {
  const normQuery = normalizeArabic(query);
  const rawTokens = normQuery.split(/\s+/).filter((t) => t.length > 1);
  const queryTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));

  const effectiveTokens = queryTokens.length > 0 ? queryTokens : rawTokens;

  if (!effectiveTokens.length || !stores.length) {
    return {
      summary: 'يرجى كتابة ما تبحث عنه لاقتراح أفضل المتاجر والخدمات في الحسينية.',
      suggestions: [],
    };
  }

  // فحص مباشر للمواضيع الفكاهية الصريحة الخارجة عن سياق المتاجر والخدمات
  const isHumorTopic = /(جواز|اتجوز|عروس|عريس|صاروخ|مركب.*فضائي|فضاء|مريخ|ناسا|رئيس|حكوم|وزير|سلاح|قنبل|مسدس|مخدر|بانجو|حشيش|مليون|مليار|قرض|كنز|زهقان|مخنوق|عايز انام|امتحان|فيزيا|كيميا|لامبورجيني|فيراري|طيار|هليكوبتر|ديناصور|اسد|مين انت|اسمك ايه|هزر|نكته)/.test(
    normQuery
  );

  if (isHumorTopic) {
    return {
      summary: getHumorousEgyptianReply(query),
      suggestions: [],
    };
  }

  // كشف النوايا المحددة من القاموس
  const matchedIntents: (typeof INTENT_KEYWORDS)[string][] = [];
  const targetCategories = new Set<string>();

  for (const intent of Object.values(INTENT_KEYWORDS)) {
    const hits = intent.keywords.filter((kw) => {
      const normKw = normalizeArabic(kw);
      return normQuery.includes(normKw) || effectiveTokens.some((t) => normKw === t || (t.length >= 3 && normKw.includes(t)));
    });
    if (hits.length > 0) {
      matchedIntents.push(intent);
      targetCategories.add(intent.category);
    }
  }

  type ScoredStore = {
    store: StoreForMatch;
    score: number;
    matchedProducts: string[];
    customReason: string;
  };

  const scored: ScoredStore[] = stores.map((store) => {
    let score = 0;
    const storeProducts = products.filter((p) => p.store_id === store.id && p.is_available);
    const matchedProductNames: string[] = [];

    const normName = normalizeArabic(store.name);
    const normDesc = normalizeArabic(store.description || '');
    const normSpec = normalizeArabic(store.specialty || '');
    const storeText = `${normName} ${normDesc} ${normSpec}`;

    // إذا كانت هناك تصنيفات مقصودة، نكافئ المتجر من نفس القسم ونستبعد الأقسام البعيدة
    if (targetCategories.size > 0) {
      if (targetCategories.has(store.category)) {
        score += 80;
      } else {
        score -= 150;
      }
    }

    // 1. مطابقة مباشرة بالاسم والتخصص
    for (const token of effectiveTokens) {
      if (token.length >= 3 && normName.includes(token)) score += 120;
      else if (normName.includes(token)) score += 50;

      if (normSpec.includes(token)) score += 35;
      if (normDesc.includes(token)) score += 15;
    }

    // 2. مطابقة المنتجات والمنيو
    for (const p of storeProducts) {
      const pNorm = normalizeArabic(`${p.name} ${p.description}`);
      for (const token of effectiveTokens) {
        if (pNorm.includes(token)) {
          score += 40;
          if (!matchedProductNames.includes(p.name)) {
            matchedProductNames.push(p.name);
          }
        }
      }
    }

    // 3. مطابقة النوايا المكتشفة (Intents)
    for (const intent of matchedIntents) {
      if (intent.storeHints?.some((h) => normName.includes(normalizeArabic(h)))) {
        score += 70;
      }
      for (const kw of intent.keywords) {
        const normKw = normalizeArabic(kw);
        if (normName.includes(normKw)) {
          score += 25;
        } else if (storeText.includes(normKw)) {
          score += 15;
        }
        for (const p of storeProducts) {
          if (normalizeArabic(p.name).includes(normKw) && !matchedProductNames.includes(p.name)) {
            matchedProductNames.push(p.name);
            score += 20;
          }
        }
      }
    }

    // 4. ترجيح المتجر المفتوح
    if (store.is_open) score += 10;

    // 5. ترجيح نفس المنطقة المحددة
    if (areaId && store.area_id === areaId) score += 15;

    // صياغة سبب ذكي ومخصص للمتجر
    let customReason = '';
    if (matchedProductNames.length > 0) {
      customReason = `يوفر ${matchedProductNames.slice(0, 3).join('، ')} بجودة وسرعة توصيل`;
    } else {
      const relevantIntent = matchedIntents.find(
        (i) => i.category === store.category || i.storeHints?.some((h) => normName.includes(normalizeArabic(h)))
      );
      if (relevantIntent) {
        customReason = relevantIntent.defaultReason;
      } else if (store.specialty) {
        customReason = `متخصص في ${store.specialty} بالحسينية`;
      } else {
        customReason = store.description || 'يقدم أفضل الخدمات والمنتجات بجودة ممتازة';
      }
    }

    return {
      store,
      score,
      matchedProducts: matchedProductNames,
      customReason,
    };
  });

  // ترتيب النتائج تنازلياً حسب أعلى مطابقة
  scored.sort((a, b) => b.score - a.score);

  // اختيار أفضل المتاجر المطابقة
  const topMatches = scored.filter((s) => s.score > 30).slice(0, 3);

  // إذا لم نجد أي متجر مطابق إطلاقاً (البحث غير مرتبط بالخدمات والمتاجر)
  if (topMatches.length === 0) {
    return {
      summary: getHumorousEgyptianReply(query),
      suggestions: [],
    };
  }

  const summary = `وجدنا لك أفضل الأماكن في الحسينية بناءً على طلبك (${query}):`;

  return {
    summary,
    suggestions: topMatches.map((m) => ({
      store_id: m.store.id,
      reason: m.customReason.slice(0, 280),
    })),
  };
}
