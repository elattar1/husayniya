// Auto-generated real stores catalog for Markaz Al-Husayniya
export type RealStore = {
  id: string;
  category: string;
  area_id: number;
  name: string;
  description: string;
  phone: string;
  address: string;
  specialty?: string | null;
  booking_fee: number;
  delivery_fee: number;
  commission_rate: number;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  is_open: boolean;
  logo_url: string;
  banner_url: string;
};

export type RealSection = {
  id: string;
  store_id: string;
  name: string;
  sort_order: number;
};

export type RealProduct = {
  id: string;
  store_id: string;
  section_id: string | null;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  image_url: string;
};

export const DEFAULT_AREAS = [
  { id: 1, name: 'الحسينية - وسط البلد' },
  { id: 2, name: 'منشأة أبو عمر' },
  { id: 3, name: 'سماكين الشرق' },
  { id: 4, name: 'الحلمية' },
  { id: 5, name: 'بني هلال' },
  { id: 6, name: 'الصالحية الجديدة' }
];

export const DEFAULT_CATEGORIES = [
  { slug: 'restaurants', name: 'المطاعم والكافيهات', kind: 'shop', sort: 1 },
  { slug: 'supermarkets', name: 'السوبر ماركت', kind: 'shop', sort: 2 },
  { slug: 'pharmacies', name: 'الصيدليات', kind: 'shop', sort: 3 },
  { slug: 'doctors', name: 'حجز الأطباء', kind: 'doctor', sort: 4 },
  { slug: 'maintenance', name: 'سباكة ونجارة وكهرباء وصيانة', kind: 'service', sort: 5 },
  { slug: 'gifts', name: 'الملابس والهدايا', kind: 'shop', sort: 6 },
  { slug: 'home', name: 'الخدمات المنزلية', kind: 'service', sort: 7 }
];

export const REAL_STORES: RealStore[] = [
  {
    "id": "20000000-0000-0000-0000-000000000006",
    "category": "supermarkets",
    "area_id": 1,
    "name": "سوبر ماركت الشيماء",
    "description": "أكبر تشكيلة بقالة، ألبان، زيوت، معلبات ومنظفات منزلية بأسعار الجملة",
    "phone": "01011223344",
    "address": "شارع المركز التجاري - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 110,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000007",
    "category": "supermarkets",
    "area_id": 1,
    "name": "الآن ماركت",
    "description": "ماركت حديث متكامل، مجمدات غذائية، معلبات، سناكس ومشروبات باردة",
    "phone": "01033445566",
    "address": "شارع المركز - بجوار بنك القاهرة",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.6,
    "reviews_count": 73,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000008",
    "category": "supermarkets",
    "area_id": 1,
    "name": "النجار ماركت",
    "description": "كل احتياجات البيت التموينية والعطارة والبقوليات بأفضل الأسعار",
    "phone": "01055667788",
    "address": "شارع المحكمة - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 12,
    "commission_rate": 10,
    "rating": 4.5,
    "reviews_count": 52,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000009",
    "category": "pharmacies",
    "area_id": 1,
    "name": "صيدلية الحسينية الجديدة",
    "description": "خدمة دواء ورعاية طبية على مدار 24 ساعة، استشارات صيدلية وتوصيل سريع",
    "phone": "01002702908",
    "address": "شارع المركز التجاري - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 5,
    "commission_rate": 10,
    "rating": 4.9,
    "reviews_count": 156,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000010",
    "category": "pharmacies",
    "area_id": 1,
    "name": "صيدلية الفتح",
    "description": "توفر كافة الأدوية المزمنة ومستلزمات الطوارئ والمستحضرات الطبية",
    "phone": "0552777528",
    "address": "خلف موقف الأتوبيس - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.6,
    "reviews_count": 64,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000011",
    "category": "pharmacies",
    "area_id": 1,
    "name": "صيدلية الشافعي الكبرى",
    "description": "قسم متكامل للعناية بالبشرة والشعر ومستحضرات التجميل والأدوية المستوردة",
    "phone": "01011447788",
    "address": "شارع بورسعيد - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 88,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000012",
    "category": "doctors",
    "area_id": 1,
    "name": "د. شهاب لبن - استشاري الباطنة والكلى والجهاز الهضمي",
    "description": "استشاري أمراض الباطنة والكلى، تشخيص وعلاج أمراض الكبد والجهاز الهضمي والسكر والضغط",
    "phone": "01022334488",
    "address": "شارع خليج الرمل - برج الأطباء - الدور الثاني",
    "specialty": "باطنة وجهاز هضمي وكلى",
    "booking_fee": 180,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.9,
    "reviews_count": 178,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000013",
    "category": "doctors",
    "area_id": 1,
    "name": "د. تامر الدسوقي - استشاري أمراض النساء والتوليد",
    "description": "استشاري أمراض النساء والتوليد وجراحة المناظير وعلاج العقم وتأخر الإنجاب",
    "phone": "01088990011",
    "address": "شارع المركز - برج الحكمة - الدور الثالث",
    "specialty": "نساء وتوليد وتأخر إنجاب",
    "booking_fee": 200,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 135,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000014",
    "category": "doctors",
    "area_id": 1,
    "name": "عيادة د. محمد عناني لطب وجراحة الأسنان",
    "description": "علاج الجذور والعصب، تجميل وتبييض الأسنان، زراعة الأسنان، وتركيبات الزيركون",
    "phone": "01099001122",
    "address": "شارع المركز - عمارة الصفا - الدور الأول",
    "specialty": "طب وجراحة الأسنان",
    "booking_fee": 120,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.9,
    "reviews_count": 142,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000015",
    "category": "doctors",
    "area_id": 1,
    "name": "د. منار سعيد رجب - أخصائية التغذية العلاجية",
    "description": "أخصائية التغذية العلاجية، أنظمة إنقاص وتثبيت الوزن، تغذية مرضى السكر ونحت القوام",
    "phone": "01033669922",
    "address": "شارع المركز - برج الأمل",
    "specialty": "تغذية علاجية ونحت القوام",
    "booking_fee": 140,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 91,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000016",
    "category": "maintenance",
    "area_id": 1,
    "name": "الأسطى أحمد لصيانة وتأسيس السباكة",
    "description": "كافة أعمال السباكة المنزلية، تصليح التسريبات، تأسيس شبكات المياه، وتركيب الفلاتر والسخانات",
    "phone": "01044556677",
    "address": "الحسينية وجميع القرى والمراكز التابعة",
    "specialty": "سباكة وأدوات صحية",
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 89,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000017",
    "category": "maintenance",
    "area_id": 1,
    "name": "كهربائي منازل - الأسطى محمود علي",
    "description": "صيانة أعطال الكهرباء المنزلية، تأسيس الشقق، تركيب الإضاءة الحديثة والليد واللوحات",
    "phone": "01088991133",
    "address": "شارع بورسعيد - الحسينية",
    "specialty": "تأسيس وصيانة كهرباء",
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 67,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000018",
    "category": "maintenance",
    "area_id": 1,
    "name": "الورشة الفنية للنجارة - الأسطى إبراهيم",
    "description": "صيانة الموبيليا، فك وتركيب غرف النوم والأثاث، وتصليح الأبواب والشبابيك والكوالين",
    "phone": "01066778899",
    "address": "شارع المحطة - الحسينية",
    "specialty": "نجارة وموبيليا",
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.6,
    "reviews_count": 45,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000019",
    "category": "maintenance",
    "area_id": 3,
    "name": "المركز الحديث لصيانة التكييفات والأجهزة",
    "description": "شحن وصيانة التكييفات المنزلية، صيانة الغسالات الأوتوماتيك والثلاجات مع ضمان على قطع الغيار",
    "phone": "01011229988",
    "address": "طريق سماكين الشرق الرئيسي - الحسينية",
    "specialty": "صيانة تبريد وتكييف وأجهزة كهربائية",
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 79,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1631545624777-628d689620ca?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000020",
    "category": "gifts",
    "area_id": 1,
    "name": "محل البرنسيسة للأزياء الحريمي",
    "description": "أرقى فساتين السهرة والعبايات الخروج الخليجي والدريسات الكاجوال التركي",
    "phone": "01022446688",
    "address": "شارع المركز التجاري - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 104,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000021",
    "category": "gifts",
    "area_id": 1,
    "name": "محل الدفة للملابس الرجالي",
    "description": "جلاليب خليجي ومصري فاخرة، قمصان وبناطيل كلاسيك، وأثواب راقية",
    "phone": "01033557799",
    "address": "شارع المحكمة - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 68,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000022",
    "category": "gifts",
    "area_id": 1,
    "name": "زهور وهدايا لافندر",
    "description": "تنسيق بوكيهات الورد الطبيعي، بوكسات الهدايا، شيكولاتة المناسبات والساعات الفاخرة",
    "phone": "01077881122",
    "address": "ميدان الحسينية الرئيسي",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.9,
    "reviews_count": 82,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000023",
    "category": "home",
    "area_id": 1,
    "name": "شركة النقاء للخدمات المنزلية ومكافحة الحشرات",
    "description": "إبادة ومكافحة جميع أنواع الحشرات والقوارض، غسيل السجاد والأنتريهات بالبخار الجاف وتعقيم المنازل",
    "phone": "01099112233",
    "address": "الحسينية ومحافظة الشرقية بالكامل",
    "specialty": "إبادة حشرات ونظافة منازل",
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 94,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000024",
    "category": "home",
    "area_id": 1,
    "name": "سند لخدمات نقل العفش وتغليف الأثاث",
    "description": "أحدث أوناش رفع الأثاث الهيدروليكية، سيارات مغلقة حديثة، تغليف كامل وفريق عمالة مدرب",
    "phone": "01055443322",
    "address": "الحسينية، فاقوس، ومراكز الشرقية",
    "specialty": "نقل عفش وونش هيدروليكي",
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.9,
    "reviews_count": 112,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000001",
    "category": "restaurants",
    "area_id": 1,
    "name": "مشويات الباز",
    "description": "أشهر مشويات ولحوم بلدي وطواجن في الحسينية وجزيرة سعود",
    "phone": "01023456781",
    "address": "شارع المركز الرئيسي - بجوار بنك مصر - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 124,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000002",
    "category": "restaurants",
    "area_id": 1,
    "name": "مطعم وكافيه السندباد",
    "description": "بيتزا إيطالي وفطائر شرقية وكريب وبرجر وجلسات عائلية مميزة",
    "phone": "01098765432",
    "address": "شارع المركز - أمام المحكمة القديمة - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 98,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000003",
    "category": "restaurants",
    "area_id": 1,
    "name": "كشري التحرير - الحسينية",
    "description": "أفضل أطباق وطواجن الكشري المصري الأصيل بأعلى جودة وسرعة توصيل",
    "phone": "01112233445",
    "address": "شارع المركز - بجوار موقف الشرق - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.6,
    "reviews_count": 85,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000101",
    "category": "restaurants",
    "area_id": 1,
    "name": "كشري الزعيم والحسيني",
    "description": "كشري مصري مميز مع إضافات كبدة إسكندراني وسجق وطواجن موتزاريلا",
    "phone": "01061234567",
    "address": "شارع بورسعيد - أمام مدرسة الثانوية بنين - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 76,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000102",
    "category": "restaurants",
    "area_id": 1,
    "name": "شاورما الريم السورية",
    "description": "أشهى ساندوتشات ووجبات الشاورما السوري دجاج ولحم وفتة شاورما بالثومية",
    "phone": "01099881122",
    "address": "شارع المركز التجاري - بجوار مسجد النور - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 110,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000103",
    "category": "restaurants",
    "area_id": 1,
    "name": "بازوكا فرايد تشيكن وبرجر",
    "description": "أقوى وجبات دجاج مقلي كرسبي مقرمش وساندوتشات برجر عملاقة وكول سلو",
    "phone": "01019283746",
    "address": "شارع المركز التجاري - تقاطع شارع بورسعيد - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 138,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000104",
    "category": "restaurants",
    "area_id": 1,
    "name": "مطعم الشبراوي - الحسينية",
    "description": "الفول المدمس بالسمن والزيت الحار، فلافل سخنة محشية، باذنجان وبطاطس وساندوتشات شعبية",
    "phone": "01033441155",
    "address": "شارع المركز - بجوار بنك مصر - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 160,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000105",
    "category": "restaurants",
    "area_id": 1,
    "name": "فطاطري عم شلتت",
    "description": "فطير مشلتت فلاحي بالسمن البلدي الفاخر، فطائر حادقة بميكس الجبن والسجق، وفطائر حلوة بالسكر واللبن",
    "phone": "01077665544",
    "address": "شارع المحكمة - أمام مدرسة التجارة - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.9,
    "reviews_count": 88,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000106",
    "category": "restaurants",
    "area_id": 1,
    "name": "أسماك ومأكولات بحرية الحسينية",
    "description": "أطازج الأسماك البوري والبلطي والجمبري والسبيط، شوي بالردة، زيت وليمون، وطواجن إسكندراني",
    "phone": "01088776655",
    "address": "شارع المحطة - بالقرب من ميدان المحطة - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 102,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000107",
    "category": "restaurants",
    "area_id": 1,
    "name": "مطعم نعمة للمأكولات السريعة والحواوشي",
    "description": "حواوشي بلدي على الفحم، ساندوتشات كبدة إسكندراني وسجق متبل وطحينة ومخلل",
    "phone": "01055449988",
    "address": "شارع المركز - بجوار صيدلية الحسينية - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 10,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 80,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000004",
    "category": "restaurants",
    "area_id": 1,
    "name": "حلويات وعصائر أولاد الشربيني",
    "description": "أفخر الحلويات الشرقية والغربية والتورت والعصائر الطبيعية الطازجة",
    "phone": "01065432198",
    "address": "شارع بورسعيد التجاري - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.9,
    "reviews_count": 140,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000005",
    "category": "restaurants",
    "area_id": 2,
    "name": "كافيه النخيل - منشأة أبو عمر",
    "description": "جلسات راقية ومشروبات قهوة عالمية وموكتيلات مثلجة ووافل وحلويات",
    "phone": "01223344556",
    "address": "مدخل منشأة أبو عمر الرئيسي - طريق الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.5,
    "reviews_count": 67,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000108",
    "category": "restaurants",
    "area_id": 3,
    "name": "مشويات وكبابجي الأمانة",
    "description": "كباب ضاني بلدي، ريش مشوية على الفحم، طرب، وكفتة متبلة مع الأرز البسمتي والسلطات",
    "phone": "01044332211",
    "address": "طريق سماكين الشرق الرئيسي - الحسينية",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 18,
    "commission_rate": 10,
    "rating": 4.8,
    "reviews_count": 73,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80"
  },
  {
    "id": "20000000-0000-0000-0000-000000000109",
    "category": "restaurants",
    "area_id": 1,
    "name": "رويال لاونج كافيه ومطعم",
    "description": "كافيه عصري ومطعم يقدم وجبات كريب وبرجر وحلويات وافل وجميع أنواع المشروبات الباردة والساخنة",
    "phone": "01099118833",
    "address": "ميدان الحسينية الرئيسي - برج النخبة - الدور الثاني",
    "specialty": null,
    "booking_fee": 0,
    "delivery_fee": 15,
    "commission_rate": 10,
    "rating": 4.7,
    "reviews_count": 92,
    "is_active": true,
    "is_open": true,
    "logo_url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80",
    "banner_url": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=80"
  }
];

export const REAL_SECTIONS: RealSection[] = [
  {
    "id": "30000000-0000-0000-0006-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "name": "الألبان والأجبان",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0006-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "name": "السلع الأساسية والزيوت",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0006-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "name": "المنظفات والعناية المنزلية",
    "sort_order": 3
  },
  {
    "id": "30000000-0000-0000-0007-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000007",
    "name": "المعلبات والمكرونة",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0007-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000007",
    "name": "المشروبات والقهوة",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0008-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000008",
    "name": "السلع التموينية والعطارة",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0009-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "name": "أدوية ومسكنات وفيتامينات",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0009-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "name": "رعاية الأم والطفل",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0009-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "name": "أجهزة ومستلزمات طبية",
    "sort_order": 3
  },
  {
    "id": "30000000-0000-0000-0010-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000010",
    "name": "أدوية ومسكنات عامة",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0011-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000011",
    "name": "العناية بالبشرة والتجميل",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0012-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000012",
    "name": "خدمات الحجز والكشف",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0013-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000013",
    "name": "خدمات الكشف والمتابعة",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0014-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000014",
    "name": "خدمات طب وتجميل الأسنان",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0015-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000015",
    "name": "خدمات الكشف والتغذية",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0016-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000016",
    "name": "خدمات السباكة المنزلية",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0017-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000017",
    "name": "أعمال الكهرباء المنزلية",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0018-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000018",
    "name": "خدمات النجارة والموبيليا",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0019-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000019",
    "name": "صيانة التكييف والأجهزة",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0020-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000020",
    "name": "فساتين وسواريهات",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0020-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000020",
    "name": "عبايات خروج ودريسات",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0021-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000021",
    "name": "أزياء رجالي وجلاليب",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0022-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000022",
    "name": "بوكيهات ورد طبيعي",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0022-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000022",
    "name": "بوكسات هدايا وشوكولاتة",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0023-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000023",
    "name": "خدمات المكافحة والتعقيم",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0023-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000023",
    "name": "غسيل المفروشات بالبخار",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0024-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000024",
    "name": "خدمات النقل والرفع والتغليف",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0001-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "name": "مشويات اللحوم والدواجن",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0001-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "name": "طواجن الفرن والأرز المعمر",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0001-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "name": "السلطات والمقبلات",
    "sort_order": 3
  },
  {
    "id": "30000000-0000-0000-0002-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "name": "البيتزا الإيطالي",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0002-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "name": "الكريب والسندوتشات",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0002-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "name": "الحلويات والفطير الحلو",
    "sort_order": 3
  },
  {
    "id": "30000000-0000-0000-0003-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "name": "أطباق وعلب الكشري",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0003-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "name": "طواجن المكرونة بالفرن",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0003-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "name": "الحلويات والإضافات",
    "sort_order": 3
  },
  {
    "id": "30000000-0000-0000-0101-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000101",
    "name": "أطباق الكشري المميز",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0101-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000101",
    "name": "طواجن الزعيم",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0102-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000102",
    "name": "ساندوتشات شاورما صاج",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0102-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000102",
    "name": "وجبات وفتة الشاورما",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0103-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000103",
    "name": "وجبات الدجاج المقرمش",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0103-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000103",
    "name": "برجر تشيكن ولحم",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0104-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000104",
    "name": "أطباق وعلب الفول والفلافل",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0104-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000104",
    "name": "الساندوتشات الشعبية والبطاطس",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0105-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000105",
    "name": "الفطير المشلتت الفلاحي",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0105-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000105",
    "name": "الفطير الشرقي الحادق",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0105-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000105",
    "name": "الفطير الحلو والحلو الشرقي",
    "sort_order": 3
  },
  {
    "id": "30000000-0000-0000-0106-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000106",
    "name": "الأسماك المشوية والمقلية",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0106-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000106",
    "name": "الجمبري والمأكولات البحرية",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0107-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000107",
    "name": "الحواوشي البلدي",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0107-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000107",
    "name": "ساندوتشات الكبدة والسجق",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0004-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000004",
    "name": "حلويات شرقية وتورت",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0004-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000004",
    "name": "عصائر فريش وكوكتيل",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0005-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000005",
    "name": "القهوة والمشروبات الساخنة",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0005-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000005",
    "name": "المشروبات الباردة والموكتيل",
    "sort_order": 2
  },
  {
    "id": "30000000-0000-0000-0108-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000108",
    "name": "كباب ومشويات ضاني",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0109-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000109",
    "name": "ساندوتشات وكريب لاونج",
    "sort_order": 1
  },
  {
    "id": "30000000-0000-0000-0109-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000109",
    "name": "المشروبات والوافل",
    "sort_order": 2
  }
];

export const REAL_PRODUCTS: RealProduct[] = [
  {
    "id": "40000000-0000-0000-0006-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "section_id": "30000000-0000-0000-0006-000000000001",
    "name": "جبن رومي قديم بطارخ ربع كيلو",
    "description": "جبن رومي مصري بلدي معتق عالي الجودة",
    "price": 90,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0006-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "section_id": "30000000-0000-0000-0006-000000000001",
    "name": "حليب جهينة كامل الدسم 1 لتر",
    "description": "حليب طبيعي معقم كامل الدسم غني بالكالسيوم",
    "price": 44,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0006-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "section_id": "30000000-0000-0000-0006-000000000002",
    "name": "زيت ذرة عافية نقي 800 مل",
    "description": "زيت ذرة طبيعي خفيف وصحي للطبخ والقلي",
    "price": 95,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0006-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "section_id": "30000000-0000-0000-0006-000000000002",
    "name": "أرز مصري درجة أولى فاخر 1 كجم",
    "description": "أرز أبيض حبة رفيعة منقى ومغسول وجاهز للطهي",
    "price": 36,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0006-000000000005",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "section_id": "30000000-0000-0000-0006-000000000001",
    "name": "طبق بيض أحمر مائدة طازج 30 بيضة",
    "description": "بيض مزارع الشرقية أحمر طازج يوم بيوم",
    "price": 165,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0006-000000000006",
    "store_id": "20000000-0000-0000-0000-000000000006",
    "section_id": "30000000-0000-0000-0006-000000000003",
    "name": "مسحوق غسيل أريال أوتوماتيك 2.5 كجم",
    "description": "مسحوق مركز للغسالات الأوتوماتيك مع داوني ونظافة فائقة",
    "price": 195,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0007-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000007",
    "section_id": "30000000-0000-0000-0007-000000000001",
    "name": "علبة تونة صن شاين قطع 185 جم",
    "description": "تونة قطع في زيت نباتي نقي سهلة الفتح",
    "price": 65,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0007-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000007",
    "section_id": "30000000-0000-0000-0007-000000000001",
    "name": "مكرونة الملكة أنواع مشكلة 400 جم",
    "description": "مكرونة قمح صلب سريعة الطهي لا تتعجن",
    "price": 15,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0007-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000007",
    "section_id": "30000000-0000-0000-0007-000000000002",
    "name": "قهوة نسكافيه جولد كلاسيك برطمان 100 جم",
    "description": "قهوة سريعة الذوبان بنكهة حبوب البن المحمصة الغنية",
    "price": 140,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0008-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000008",
    "section_id": "30000000-0000-0000-0008-000000000001",
    "name": "سكر أبيض نقي معبأ 1 كجم",
    "description": "سكر مكرر ناصع البياض سريع الذوبان",
    "price": 35,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0008-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000008",
    "section_id": "30000000-0000-0000-0008-000000000001",
    "name": "شاي العروسة أسود فاخر 250 جم",
    "description": "شاي أسود حبيبات عالي الجودة توليفة قوية",
    "price": 55,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0009-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "section_id": "30000000-0000-0000-0009-000000000001",
    "name": "بنادول إكسترا أحمر مسكن للصداع والحرارة",
    "description": "شريط 12 قرص باراسيتامول مع كافيين لفاعلية أسرع",
    "price": 45,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0009-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "section_id": "30000000-0000-0000-0009-000000000001",
    "name": "فيتامين سي فوار 1000 مجم عبوة 10 أقراص",
    "description": "أقراص فوارة سريعة الامتصاص لتعزيز المناعة ومقاومة البرد",
    "price": 50,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0009-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "section_id": "30000000-0000-0000-0009-000000000002",
    "name": "حفاضات أطفال بامبرز كلوت مقاس 4",
    "description": "عبوة توفير كلوت ناعم ومريح مانع للتسريب حتى 12 ساعة",
    "price": 230,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0009-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "section_id": "30000000-0000-0000-0009-000000000002",
    "name": "حليب أطفال هيرو بيبي نيوتراديفينس رقم 1",
    "description": "تركيبة غذائية متوازنة لحديثي الولادة من عمر يوم حتى 6 شهور",
    "price": 185,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0009-000000000005",
    "store_id": "20000000-0000-0000-0000-000000000009",
    "section_id": "30000000-0000-0000-0009-000000000003",
    "name": "جهاز ديجيتال أوتوماتيك لقياس ضغط الدم",
    "description": "جهاز دقيق مع كف ذراع وشاشة LCD كبيرة وذاكرة قراءات سابقة",
    "price": 890,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0010-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000010",
    "section_id": "30000000-0000-0000-0010-000000000001",
    "name": "كونجستال أقراص لنزلات البرد والاحتقان",
    "description": "علاج فعال للرشح وسيلان الأنف والصداع والجيوب الأنفية",
    "price": 35,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0010-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000010",
    "section_id": "30000000-0000-0000-0010-000000000001",
    "name": "فولتارين جل إيمولجيل مسكن موضعي 50 جم",
    "description": "جل مضاد للالتهابات ومسكن لآلام العضلات والمفاصل والظهر",
    "price": 65,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0011-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000011",
    "section_id": "30000000-0000-0000-0011-000000000001",
    "name": "غسول سيرافي للبشرة العادية والجافة 236 مل",
    "description": "منظف ومرطب بحمض الهيالورونيك والسيراميدات الأساسية",
    "price": 320,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0011-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000011",
    "section_id": "30000000-0000-0000-0011-000000000001",
    "name": "واقي شمس لاروش بوزيه أنثيليوس 50 مل",
    "description": "حماية فائقة من أشعة الشمس بملمس خفيف غير دهني للبشرة",
    "price": 420,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0012-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000012",
    "section_id": "30000000-0000-0000-0012-000000000001",
    "name": "حجز كشف باطنة وكلى وجهاز هضمي",
    "description": "كشف إكلينيكي وفحص دقيق ومتابعة وظائف الكلى وضغط الدم",
    "price": 180,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0012-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000012",
    "section_id": "30000000-0000-0000-0012-000000000001",
    "name": "فحص السونار التلفزيوني على البطن والحوض",
    "description": "أشعة موجات فوق صوتية لفحص الكبد والكلى والمرارة والمثانة",
    "price": 120,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0013-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000013",
    "section_id": "30000000-0000-0000-0013-000000000001",
    "name": "كشف نساء وتوليد مع سونار 4D",
    "description": "فحص شامل ومتابعة نمو الجنين بأحدث أجهزة السونار الملون رباعي الأبعاد",
    "price": 200,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0013-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000013",
    "section_id": "30000000-0000-0000-0013-000000000001",
    "name": "استشارة ومتابعة دورية للحمل",
    "description": "متابعة شهرية لتحاليل الدم والوزن والضغط وصحة الأم والجنين",
    "price": 80,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0014-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000014",
    "section_id": "30000000-0000-0000-0014-000000000001",
    "name": "كشف أسنان واستشارة خطة علاج متكاملة",
    "description": "فحص الفم والأسنان وتحديد مواعيد الجلسات والتركيبات",
    "price": 120,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0014-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000014",
    "section_id": "30000000-0000-0000-0014-000000000001",
    "name": "جلسة تنظيف جير وتلميع أسنان بالموجات الصوتية",
    "description": "إزالة الرواسب الجيرية وتلميع الأسنان للتخلص من البقع السطحية",
    "price": 250,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0014-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000014",
    "section_id": "30000000-0000-0000-0014-000000000001",
    "name": "حشو ليزر كمبوزيت ضوئي تجميلي",
    "description": "حشو تجميلي بنفس لون السن الطبيعي ومقاوم للتسوس",
    "price": 350,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0015-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000015",
    "section_id": "30000000-0000-0000-0015-000000000001",
    "name": "كشف تغذية + تحليل دهون InBody وبرنامج مخصص",
    "description": "قياس دقيق لنسبة الدهون والعضلات والماء ووضع دايت صحي متوازن",
    "price": 140,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0016-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000016",
    "section_id": "30000000-0000-0000-0016-000000000001",
    "name": "معاينة وفحص أعطال وتسريبات السباكة",
    "description": "كشف أماكن التسريب وتحديد القطع التالفة والإصلاحات المطلوبة",
    "price": 100,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0016-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000016",
    "section_id": "30000000-0000-0000-0016-000000000001",
    "name": "تركيب وصيانة خلاطات مياه وأحواض",
    "description": "تركيب خلاط مطبخ أو حمام جديد، تصليح المحابس، واختبار ضغط المياه",
    "price": 150,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0016-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000016",
    "section_id": "30000000-0000-0000-0016-000000000001",
    "name": "صيانة سخان مياه غاز أو كهرباء",
    "description": "تغيير الهيتر، فحص صمام الأمان وتفريغ الرواسب لرفع كفاءة التسخين",
    "price": 200,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0017-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000017",
    "section_id": "30000000-0000-0000-0017-000000000001",
    "name": "فحص شورت وتصليح قواطع الكهرباء",
    "description": "إصلاح الماس الكهربائي وتغيير القواطع الأوتوماتيكية التالفة باللوحة",
    "price": 120,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0017-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000017",
    "section_id": "30000000-0000-0000-0017-000000000001",
    "name": "تركيب نجف وإضاءة ليد بروفايل",
    "description": "تثبيت وتركيب النجف والأباليك وشريط ليد بروفايل بالسقف الجبس",
    "price": 150,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0018-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000018",
    "section_id": "30000000-0000-0000-0018-000000000001",
    "name": "صيانة وتصليح باب أو شباك وتغيير كالون",
    "description": "ضبط حركة الأبواب وتغيير المفصلات والمقابض والكوالين التالفة",
    "price": 120,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0018-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000018",
    "section_id": "30000000-0000-0000-0018-000000000001",
    "name": "فك وتركيب غرفة نوم خشب كاملة",
    "description": "فك دولاب وسرير وتسريحة ونقلها وتركيبها باحترافية وأمان",
    "price": 400,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0019-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000019",
    "section_id": "30000000-0000-0000-0019-000000000001",
    "name": "شحن فريون تكييف 1.5 حصان وتنظيف الفلاتر",
    "description": "شحن فريون هندي أصلي r22/r410 وتنظيف دورة الهواء والفلاتر",
    "price": 450,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1631545624777-628d689620ca?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0019-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000019",
    "section_id": "30000000-0000-0000-0019-000000000001",
    "name": "صيانة غسالة أوتوماتيك وتغيير الطلمبة أو السير",
    "description": "فحص كارتة الغسالة وماتور العصر وتصليح أعطال الصرف",
    "price": 250,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0020-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000020",
    "section_id": "30000000-0000-0000-0020-000000000001",
    "name": "فستان سواريه ستان أنيق للمناسبات",
    "description": "قصة عصرية خامة ستان حرير لامعة وتطريز راقي للمناسبات والأفراح",
    "price": 750,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0020-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000020",
    "section_id": "30000000-0000-0000-0020-000000000002",
    "name": "عباية خروج كريب سعودي مطرزة بالخرز الأسود",
    "description": "خامة كريب ملكي ناعمة مريحة فضفاضة تطريز يدوي فاخر",
    "price": 620,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0020-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000020",
    "section_id": "30000000-0000-0000-0020-000000000002",
    "name": "طرحة شيفون كويتي ناعمة مقاس كبير",
    "description": "طرحة خفيفة ثابتة غير قابلة للانزلاق ألوان صيفية مبهجة",
    "price": 85,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0021-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000021",
    "section_id": "30000000-0000-0000-0021-000000000001",
    "name": "جلباب رجالي فاخر ماركة الدفة خامة صيفي",
    "description": "قماش ياباني بارد ومريح بتطريز أنيق على الياقة والأكمام",
    "price": 450,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0021-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000021",
    "section_id": "30000000-0000-0000-0021-000000000001",
    "name": "قميص كلاسيك رجالي قطن مصري 100%",
    "description": "قصة سليم فت كلاسيكية مناسبة للعمل والمناسبات الرسمية",
    "price": 280,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0021-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000021",
    "section_id": "30000000-0000-0000-0021-000000000001",
    "name": "بنطلون جينز كاجوال شبابي مستورد",
    "description": "جينز قطن مطاط مريح متين يتحمل الغسيل اليومي",
    "price": 320,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1542272604-780c968565fe?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0022-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000022",
    "section_id": "30000000-0000-0000-0022-000000000001",
    "name": "بوكيه ورد جوري أحمر طبيعي مع تغليف أسود",
    "description": "تنسيق 20 وردة جوري هولندي فاخرة مع جبسوفيليا وتغليف حريري أنيق",
    "price": 380,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0022-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000022",
    "section_id": "30000000-0000-0000-0022-000000000002",
    "name": "بوكس هدايا شيكولاتة فيريرو روشيه مع عطر رجالي",
    "description": "صندوق أنيق محشو بالشوكولاتة الفاخرة وزجاجة عطر ثابتة مع كارت إهداء",
    "price": 550,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0022-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000022",
    "section_id": "30000000-0000-0000-0022-000000000002",
    "name": "طقم ساعة يد جلد طبيعي مع محفظة إهداء",
    "description": "ساعة يد ضد الماء بتصميم كلاسيكي ومحفظة جلد أسود بعلبة قطيفة",
    "price": 420,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0023-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000023",
    "section_id": "30000000-0000-0000-0023-000000000001",
    "name": "جلسة رش ومكافحة حشرات وقوارض شاملة بضمان",
    "description": "مبيدات آمنة مصرحة من وزارة الصحة بدون رائحة وبدون مغادرة المنزل مع ضمان 6 شهور",
    "price": 400,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0023-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000023",
    "section_id": "30000000-0000-0000-0023-000000000002",
    "name": "غسيل وتعقيم طقم أنتريه أو صالون بالبخار الجاف",
    "description": "تنظيف عميق وإزالة أصعب البقع والدهون والروائح الكريهة مع التعطير",
    "price": 350,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0023-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000023",
    "section_id": "30000000-0000-0000-0023-000000000001",
    "name": "نظافة وغسيل وتعقيم خزان مياه علوي للمنزل",
    "description": "تفريغ وتنظيف الرواسب والكلور وتعقيم جدران الخزان لضمان مياه نقية",
    "price": 300,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0024-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000024",
    "section_id": "30000000-0000-0000-0024-000000000001",
    "name": "ونش هيدروليكي لرفع وتنزيل الأثاث للأدوار العليا",
    "description": "ونش ألماني حديث يصل حتى الدور الثاني عشر للحفاظ على الأثاث من التجريح",
    "price": 700,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0024-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000024",
    "section_id": "30000000-0000-0000-0024-000000000001",
    "name": "تغليف كامل لمحتويات الشقة بفقاعات وبابلز وكرتون",
    "description": "تغليف الصيني والزجاج والتحف والشاشات والأجهزة الكهربائية بأعلى معايير الأمان",
    "price": 500,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0024-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000024",
    "section_id": "30000000-0000-0000-0024-000000000001",
    "name": "سيارة نقل مغلقة حديثة مخصصة لنقل الأثاث",
    "description": "سيارة صندوق مغلق مجهز من الداخل لتربيط الأثاث ومنع الحركة أثناء الطريق",
    "price": 600,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0001-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "section_id": "30000000-0000-0000-0001-000000000001",
    "name": "وجبة نصف دجاجة مشوية على الفحم",
    "description": "دجاجة متبلة مشوية على الفحم مع أرز بسمتي وسلطات وعيش",
    "price": 135,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0001-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "section_id": "30000000-0000-0000-0001-000000000001",
    "name": "ربع كيلو كفتة لحم بلدي مشوية",
    "description": "كفتة لحم بلدي متبلة على السيخ مع طحينة وعيش بلدي",
    "price": 150,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0001-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "section_id": "30000000-0000-0000-0001-000000000001",
    "name": "وجبة ميكس جريل الباز الفاخرة",
    "description": "كفتة مشوية + شيش طاووق + كباب مع أرز وسلطات",
    "price": 195,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0001-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "section_id": "30000000-0000-0000-0001-000000000002",
    "name": "طاجن لحم بلدي بالبصل والأورمة",
    "description": "طاجن لحم طازج في الفرن مع البصل المكرمل والبهارات",
    "price": 185,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0001-000000000005",
    "store_id": "20000000-0000-0000-0000-000000000001",
    "section_id": "30000000-0000-0000-0001-000000000003",
    "name": "مقبلات وسلطات مشكلة",
    "description": "طحينة بيضاء، بابا غنوج، ثومية، مخلل بلدي، عيش طازج",
    "price": 35,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0002-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "section_id": "30000000-0000-0000-0002-000000000001",
    "name": "بيتزا سوبر سوبريم إيطالي وسط",
    "description": "ميكس لحوم وجبن ومشروم وزيتون وفلفل ألوان وصوص طماطم",
    "price": 145,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0002-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "section_id": "30000000-0000-0000-0002-000000000001",
    "name": "بيتزا كرانشي دجاج رانش كوين",
    "description": "قطع دجاج مقرمشة مع صوص الرانش الغني وجبنة موتزاريلا",
    "price": 140,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0002-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "section_id": "30000000-0000-0000-0002-000000000002",
    "name": "كريب كرانشي دجاج زنجر حار",
    "description": "استربس حار مقرمش مع بطاطس وموتزاريلا وصوصات في كريب مقرمش",
    "price": 95,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0002-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "section_id": "30000000-0000-0000-0002-000000000002",
    "name": "ساندوتش برجر لحم دبل ميكس جبن",
    "description": "قطعتين لحم بقري مشوي مع شيدر وصوص خاص وبطاطس محمرة",
    "price": 110,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0002-000000000005",
    "store_id": "20000000-0000-0000-0000-000000000002",
    "section_id": "30000000-0000-0000-0002-000000000003",
    "name": "فطيرة شوكولاتة نوتيلا وموز ومكسرات",
    "description": "فطير شرقي مورق محشو شوكولاتة بندق وشرائح موز",
    "price": 85,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0003-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "section_id": "30000000-0000-0000-0003-000000000001",
    "name": "علبة كشري ميكس التحرير سوبر",
    "description": "أرز وعدس ومكرونة وتقلية مقرمشة وصلصة حارة ودقة وحمص",
    "price": 45,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0003-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "section_id": "30000000-0000-0000-0003-000000000001",
    "name": "علبة كشري جامبو عائلي",
    "description": "حجم عائلي مضاعف مع علب صلصة ودقة إضافية وتقلية",
    "price": 60,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0003-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "section_id": "30000000-0000-0000-0003-000000000002",
    "name": "طاجن مكرونة باللحم المفروم بالفرن",
    "description": "طاجن مكرونة بصلصة الطماطم المتبلة واللحم البلدي المفروم",
    "price": 65,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281081?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0003-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "section_id": "30000000-0000-0000-0003-000000000002",
    "name": "طاجن مكرونة بالفراخ والموتزاريلا",
    "description": "قطع دجاج متبلة مع مكرونة وجبنة موتزاريلا ذائبة بالفرن",
    "price": 75,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281081?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0003-000000000005",
    "store_id": "20000000-0000-0000-0000-000000000003",
    "section_id": "30000000-0000-0000-0003-000000000003",
    "name": "أرز باللبن فرن بالقشطة والمكسرات",
    "description": "أرز بالحليب البلدي والقشطة محمر الوجه بالفرن مع مكسرات",
    "price": 25,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0101-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000101",
    "section_id": "30000000-0000-0000-0101-000000000001",
    "name": "طبق كشري الزعيم بالكبدة الإسكندراني",
    "description": "كشري التحرير مع طبقة كبدة إسكندراني متبلة بالفلفل الحار والثوم",
    "price": 65,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0101-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000101",
    "section_id": "30000000-0000-0000-0101-000000000001",
    "name": "علبة كشري فوكس سوبر بالصلصة والتقلية",
    "description": "خلطة كشري غنية بالصلصة الخاصة وحمص الشام والتقلية المقرمشة",
    "price": 40,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0101-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000101",
    "section_id": "30000000-0000-0000-0101-000000000002",
    "name": "طاجن سجق بلدي بالموتزاريلا في الفرن",
    "description": "مكرونة قلم بقطع السجق الشرقي المتبل وجبنة موتزاريلا محمرة",
    "price": 80,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1621996346565-e3d5d6281081?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0102-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000102",
    "section_id": "30000000-0000-0000-0102-000000000001",
    "name": "ساندوتش شاورما دجاج صاج سوري كبير",
    "description": "شاورما دجاج متبلة في خبز صاج محمص مع ثومية ومخلل خيار",
    "price": 65,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0102-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000102",
    "section_id": "30000000-0000-0000-0102-000000000001",
    "name": "ساندوتش شاورما لحم صاج سوري بالبقدونس والطحينة",
    "description": "شاورما لحم عجل شرائح مع صوص طحينة وبصل وبقدونس وسماق",
    "price": 80,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0102-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000102",
    "section_id": "30000000-0000-0000-0102-000000000002",
    "name": "وجبة شاورما عربي دجاج مع البطاطس والثومية",
    "description": "ساندوتش شاورما مقطع رول مع بطاطس فارم فريتس وثومية ومخلل",
    "price": 100,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0102-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000102",
    "section_id": "30000000-0000-0000-0102-000000000002",
    "name": "فتة شاورما ميكس دجاج ولحم مع الخبز المحمص",
    "description": "أرز بسمتي أصفر مبهر مع شاورما دجاج ولحم وخبز شامي مقرمش وصوص ثومية",
    "price": 125,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0103-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000103",
    "section_id": "30000000-0000-0000-0103-000000000001",
    "name": "وجبة 3 قطع دجاج مقلي كرسبي مع البطاطس والخبز",
    "description": "3 قطع بروستد كرسبي مقرمشة مع بطاطس وصوص كول سلو وخبز كايزر",
    "price": 130,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0103-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000103",
    "section_id": "30000000-0000-0000-0103-000000000001",
    "name": "وجبة 5 قطع استربس دجاج حار مقرمش",
    "description": "أصابع دجاج مقرمشة مع صوص الرانش وصوص الباربكيو وبطاطس",
    "price": 120,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0103-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000103",
    "section_id": "30000000-0000-0000-0103-000000000002",
    "name": "ساندوتش بازوكا تشيكن تاور عملاق",
    "description": "قطعة صدور دجاج كرسبي مع أصابع جبن موتزاريلا وشيدر وصوص مايونيز حار",
    "price": 115,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0104-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000104",
    "section_id": "30000000-0000-0000-0104-000000000001",
    "name": "علبة فول مدمس بالسمن البلدي والليمون",
    "description": "فول بلدي مهروس متبل بالكمون والطحينة والسمن البلدي الطازج",
    "price": 25,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0104-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000104",
    "section_id": "30000000-0000-0000-0104-000000000001",
    "name": "طلب فلافل محشية عين كبرى (4 أقراص)",
    "description": "طعمية مقرمشة محشوة بخلطة البصل والشطة والسمسم المحمص",
    "price": 20,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0104-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000104",
    "section_id": "30000000-0000-0000-0104-000000000002",
    "name": "ساندوتش بطاطس بانيه مايونيز وكاتشب",
    "description": "بطاطس مقلية مقرمشة في خبز شامي مع مخلل وصوصات",
    "price": 15,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0104-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000104",
    "section_id": "30000000-0000-0000-0104-000000000001",
    "name": "علبة مسقعة بالباذنجان والفلفل الحار",
    "description": "مسقعة بلدي بصلصة الطماطم المسبكة والخل والثوم",
    "price": 25,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0105-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000105",
    "section_id": "30000000-0000-0000-0105-000000000001",
    "name": "فطيرة مشلتت فلاحي سمن بلدي وسط",
    "description": "فطير مورق بالسمن البلدي الصافي خفيف ومقرمش من الأطراف",
    "price": 85,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0105-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000105",
    "section_id": "30000000-0000-0000-0105-000000000002",
    "name": "فطيرة شرقي سجق بلدي وميكس جبن رومي وموتزاريلا",
    "description": "فطيرة حادقة محشوة سجق إسكندراني متبل وزيتون وفلفل وموتزاريلا",
    "price": 120,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0105-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000105",
    "section_id": "30000000-0000-0000-0105-000000000003",
    "name": "فطيرة كاسترد سكر ولبن وقشطة بلدي",
    "description": "فطيرة محشوة كاسترد ومسقية حليب محلى وسكر بودرة وقشطة",
    "price": 70,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0106-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000106",
    "section_id": "30000000-0000-0000-0106-000000000001",
    "name": "كيلو سمك بلدي مشوي بالردة مع الأرز والسلطة",
    "description": "سمك بلدي طازج مشوي بالردة متبل بالثوم والليمون والكمون والشطة",
    "price": 130,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0106-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000106",
    "section_id": "30000000-0000-0000-0106-000000000001",
    "name": "كيلو سمك بوري سنجاري بزيت وليمون بالفرن",
    "description": "سمك بوري مفتوح سنجاري مع خلطة طماطم وبصل وكرفس وليمون في الفرن",
    "price": 210,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0106-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000106",
    "section_id": "30000000-0000-0000-0106-000000000002",
    "name": "طاجن جمبري إسكندراني بصلصة الطماطم والفلفل",
    "description": "جمبري وسط في الفرن بصلصة الطماطم والثوم مع توابل السي فود",
    "price": 230,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0106-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000106",
    "section_id": "30000000-0000-0000-0106-000000000002",
    "name": "شوربة سي فود مخلية بالكريمة",
    "description": "شوربة غنية بقطع الجمبري والكاليماري والسمك الفيليه والكريمة اللباني",
    "price": 85,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0107-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000107",
    "section_id": "30000000-0000-0000-0107-000000000001",
    "name": "رغيف حواوشي لحم بلدي على الفحم مخصوص",
    "description": "لحم بقري بلدي متبل بالبهارات الشرقية في خبز بلدي مقرمش على الشواية",
    "price": 50,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0107-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000107",
    "section_id": "30000000-0000-0000-0107-000000000001",
    "name": "رغيف حواوشي لحم بالموتزاريلا والبسطرمة",
    "description": "حواوشي بلدي غني بالجبنة الموتزاريلا الذائبة وقطع البسطرمة",
    "price": 70,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0107-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000107",
    "section_id": "30000000-0000-0000-0107-000000000002",
    "name": "ساندوتش كبدة إسكندراني بالفلفل الحار والليمون",
    "description": "كبدة بلدي طازجة مقلية بالفلفل الأخضر الحار والخل والثوم في عيش فينو",
    "price": 30,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0107-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000107",
    "section_id": "30000000-0000-0000-0107-000000000002",
    "name": "ساندوتش سجق شرقي متبل بالصلصة والبصل",
    "description": "سجق بلدي بالخلطة الشرقية والصلصة المتبلة في عيش فينو طازج",
    "price": 35,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0004-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000004",
    "section_id": "30000000-0000-0000-0004-000000000001",
    "name": "كيلو مشكل حلويات شرقية فاخر",
    "description": "بسبوسة بالسمن البلدي، كنافة بالمكسرات والقشطة، جلاش أصابع",
    "price": 180,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0004-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000004",
    "section_id": "30000000-0000-0000-0004-000000000001",
    "name": "تورتة فور سيزون شوكولاتة وفواكه",
    "description": "تورتة هشة 4 أقسام نوتيلا وكراميل وفراولة ومانجو",
    "price": 260,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0004-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000004",
    "section_id": "30000000-0000-0000-0004-000000000002",
    "name": "عصير مانجو عويس فريش كبير",
    "description": "عصير مانجو طبيعي 100% بدون إضافات مثلج طازج",
    "price": 40,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0004-000000000004",
    "store_id": "20000000-0000-0000-0000-000000000004",
    "section_id": "30000000-0000-0000-0004-000000000002",
    "name": "بولة آيس كريم مستكة طبيعي بالمكسرات",
    "description": "آيس كريم مستكة تركي أصيل مع فستق حلبي محمص",
    "price": 30,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0005-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000005",
    "section_id": "30000000-0000-0000-0005-000000000001",
    "name": "اسبريسو دبل إيطالي لافازا",
    "description": "شوت قهوة اسبريسو مركز بن برازيلي كولومبي فاخر",
    "price": 35,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0005-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000005",
    "section_id": "30000000-0000-0000-0005-000000000002",
    "name": "آيسد لاتيه كراميل مثلج",
    "description": "حليب مثلج مع شوت اسبريسو وصوص كراميل ذهبي غني",
    "price": 50,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0005-000000000003",
    "store_id": "20000000-0000-0000-0000-000000000005",
    "section_id": "30000000-0000-0000-0005-000000000002",
    "name": "موخيتو بلو ليمون ونعناع منعش",
    "description": "سفن أب مع نكهة البلو والليمون الطازج وأوراق النعناع",
    "price": 45,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0108-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000108",
    "section_id": "30000000-0000-0000-0108-000000000001",
    "name": "كيلو مشكل كباب وكفتة وريش ضاني",
    "description": "تشكيلة مشويات ضاني بلدي مشوية على الفحم مع خبز وسلطات وطحينة",
    "price": 580,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0108-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000108",
    "section_id": "30000000-0000-0000-0108-000000000001",
    "name": "ربع كيلو طرب مشوي بالخلطة",
    "description": "طرب لحم مفروم بلدي ملفوف بالمنديل المشوي على الفحم",
    "price": 160,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0109-000000000001",
    "store_id": "20000000-0000-0000-0000-000000000109",
    "section_id": "30000000-0000-0000-0109-000000000001",
    "name": "برجر لحم رويال تريبل جبن صوص باربكيو",
    "description": "ثلاث طبقات لحم بقري صافي مع شيدر ومخلل وصوص مدخن وبطاطس",
    "price": 145,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80"
  },
  {
    "id": "40000000-0000-0000-0109-000000000002",
    "store_id": "20000000-0000-0000-0000-000000000109",
    "section_id": "30000000-0000-0000-0109-000000000002",
    "name": "وافل فواكه نوتيلا وآيس كريم لوتس",
    "description": "وافل مقرمش مغطى بصوص اللوتس والنوتيلا وقطع الموز والفراولة",
    "price": 80,
    "is_available": true,
    "image_url": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80"
  }
];
