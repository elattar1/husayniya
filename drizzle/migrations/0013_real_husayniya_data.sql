-- Migration: Real stores, sections, products and services for Markaz Al-Husayniya
-- Clean up old demo stores
DELETE FROM public.products WHERE store_id IN (SELECT id FROM public.stores WHERE name LIKE '%(تجريبي)%' OR id LIKE '11111111-%');
DELETE FROM public.store_sections WHERE store_id IN (SELECT id FROM public.stores WHERE name LIKE '%(تجريبي)%' OR id LIKE '11111111-%');
DELETE FROM public.stores WHERE name LIKE '%(تجريبي)%' OR id LIKE '11111111-%';

-- Insert / Upsert Real Stores

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  'restaurants',
  1,
  'مشويات الباز',
  'أشهر مشويات ولحوم بلدي وطواجن في الحسينية وجزيرة سعود',
  '01023456781',
  'شارع المركز الرئيسي - بجوار بنك مصر',
  NULL,
  0,
  15,
  10,
  4.8,
  124,
  true,
  true,
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0000-000000000001', 'مشويات اللحوم والدواجن', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0000-000000000001', 'طواجن الفرن والأرز', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0001-000000000003', '20000000-0000-0000-0000-000000000001', 'السلطات والمقبلات', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0001-000000000001',
  'وجبة نصف دجاجة مشوية على الفحم',
  'دجاجة متبلة مشوية على الفحم مع أرز بسمتي وسلطات وعيش',
  135,
  true,
  'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0001-000000000001',
  'ربع كيلو كفتة لحم بلدي مشوية',
  'كفتة لحم بلدي متبلة على السيخ مع طحينة وعيش بلدي',
  150,
  true,
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0001-000000000001',
  'وجبة ميكس جريل الباز الفاخرة',
  'كفتة مشوية + شيش طاووق + كباب مع أرز وسلطات',
  195,
  true,
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0001-000000000002',
  'طاجن لحم بلدي بالبصل والأورمة',
  'طاجن لحم طازج في الفرن مع البصل المكرمل والبهارات',
  185,
  true,
  'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000005',
  '20000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0001-000000000003',
  'مقبلات وسلطات مشكلة',
  'طحينة بيضاء، بابا غنوج، ثومية، مخلل بلدي، عيش طازج',
  35,
  true,
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000002',
  'restaurants',
  1,
  'مطعم وكافيه السندباد',
  'بيتزا إيطالي وفطائر شرقية وكريب وبرجر وجلسات عائلية مميزة',
  '01098765432',
  'شارع المركز - أمام المحكمة القديمة',
  NULL,
  0,
  15,
  10,
  4.7,
  98,
  true,
  true,
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579751626657-72bc17010498?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0002-000000000001', '20000000-0000-0000-0000-000000000002', 'البيتزا والفطائر', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0002-000000000002', '20000000-0000-0000-0000-000000000002', 'الكريب والسندوتشات', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0002-000000000003', '20000000-0000-0000-0000-000000000002', 'الحلويات والفطير الحلو', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0002-000000000001',
  'بيتزا سوبر سوبريم إيطالي وسط',
  'ميكس لحوم وجبن ومشروم وزيتون وفلفل ألوان وصوص طماطم',
  145,
  true,
  'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0002-000000000001',
  'بيتزا كرانشي دجاج رانش كوين',
  'قطع دجاج مقرمشة مع صوص الرانش الغني وجبنة موتزاريلا',
  140,
  true,
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0002-000000000002',
  'كريب كرانشي دجاج زنجر حار',
  'استربس حار مقرمش مع بطاطس وموتزاريلا وصوصات في كريب مقرمش',
  95,
  true,
  'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0002-000000000002',
  'ساندوتش برجر لحم دبل ميكس جبن',
  'قطعتين لحم بقري مشوي مع شيدر وصوص خاص وبطاطس محمرة',
  110,
  true,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000005',
  '20000000-0000-0000-0000-000000000002',
  '30000000-0000-0000-0002-000000000003',
  'فطيرة شوكولاتة نوتيلا وموز ومكسرات',
  'فطير شرقي مورق محشو شوكولاتة بندق وشرائح موز',
  85,
  true,
  'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000003',
  'restaurants',
  1,
  'كشري التحرير - الحسينية',
  'أفضل أطباق وطواجن الكشري المصري الأصيل بأعلى جودة وسرعة توصيل',
  '01112233445',
  'شارع المركز - بجوار موقف الشرق',
  NULL,
  0,
  10,
  10,
  4.6,
  85,
  true,
  true,
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0003-000000000001', '20000000-0000-0000-0000-000000000003', 'أطباق وعلب الكشري', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0003-000000000002', '20000000-0000-0000-0000-000000000003', 'طواجن المكرونة بالفرن', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0003-000000000003', '20000000-0000-0000-0000-000000000003', 'الحلويات والإضافات', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0003-000000000001',
  'علبة كشري ميكس التحرير سوبر',
  'أرز وعدس ومكرونة وتقلية مقرمشة وصلصة حارة ودقة وحمص',
  45,
  true,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0003-000000000001',
  'علبة كشri جامبو عائلي',
  'حجم عائلي مضاعف مع علب صلصة ودقة إضافية وتقلية',
  60,
  true,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0003-000000000002',
  'طاجن مكرونة باللحم المفروم بالفرن',
  'طاجن مكرونة بصلصة الطماطم المتبلة واللحم البلدي المفروم',
  65,
  true,
  'https://images.unsplash.com/photo-1621996346565-e3d5d6281081?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0003-000000000002',
  'طاجن مكرونة بالفراخ والموتزاريلا',
  'قطع دجاج متبلة مع مكرونة وجبنة موتزاريلا ذائبة بالفرن',
  75,
  true,
  'https://images.unsplash.com/photo-1621996346565-e3d5d6281081?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000005',
  '20000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0003-000000000003',
  'أرز باللبن فرن بالقشطة والمكسرات',
  'أرز بالحليب البلدي والقشطة محمر الوجه بالفرن مع مكسرات',
  25,
  true,
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000004',
  'restaurants',
  1,
  'حلويات وعصائر أولاد الشربيني',
  'أفخر الحلويات الشرقية والغربية والتورت والعصائر الطبيعية الطازجة',
  '01065432198',
  'شارع بورسعيد التجاري - الحسينية',
  NULL,
  0,
  15,
  10,
  4.9,
  140,
  true,
  true,
  'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0004-000000000001', '20000000-0000-0000-0000-000000000004', 'حلويات شرقية وتورت', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0004-000000000002', '20000000-0000-0000-0000-000000000004', 'عصائر فريش وكوكتيل', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0004-000000000003', '20000000-0000-0000-0000-000000000004', 'آيس كريم وجيلاتو', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0004-000000000001',
  'كيلو مشكل حلويات شرقية فاخر',
  'بسبوسة بالسمن البلدي، كنافة بالمكسرات والقشطة، جلاش أصابع',
  180,
  true,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0004-000000000001',
  'تورتة فور سيزون شوكولاتة وفواكه',
  'تورتة هشة 4 أقسام نوتيلا وكراميل وفراولة ومانجو',
  260,
  true,
  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0004-000000000002',
  'عصير مانجو عويس فريش كبير',
  'عصير مانجو طبيعي 100% بدون إضافات مثلج طازج',
  40,
  true,
  'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0004-000000000002',
  'كوكتيل فواكه طبيعي مع الآيس كريم',
  'قطع تفاح وموز وفراولة مع عصير مانجو وبولة آيس كريم فانيليا',
  50,
  true,
  'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000005',
  '20000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0004-000000000003',
  'بولة آيس كريم مستكة طبيعي بالمكسرات',
  'آيس كريم مستكة تركي أصيل مع فستق حلبي محمص',
  30,
  true,
  'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000005',
  'restaurants',
  2,
  'كافيه النخيل - منشأة أبو عمر',
  'جلسات راقية ومشروبات قهوة عالمية وموكتيلات مثلجة ووافل وحلويات',
  '01223344556',
  'مدخل منشأة أبو عمر الرئيسي - طريق الحسينية',
  NULL,
  0,
  15,
  10,
  4.5,
  67,
  true,
  true,
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0005-000000000001', '20000000-0000-0000-0000-000000000005', 'القهوة والمشروبات الساخنة', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0005-000000000002', '20000000-0000-0000-0000-000000000005', 'المشروبات الباردة والموكتيل', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0005-000000000003', '20000000-0000-0000-0000-000000000005', 'الوافل والحلو', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0005-000000000001',
  'اسبريسو دبل إيطالي لافازا',
  'شوت قهوة اسبريسو مركز بن برازيلي كولومبي فاخر',
  35,
  true,
  'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0005-000000000002',
  'آيسد لاتيه كراميل مثلج',
  'حليب مثلج مع شوت اسبريسو وصوص كراميل ذهبي غني',
  50,
  true,
  'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0005-000000000002',
  'موخيتو بلو ليمون ونعناع منعش',
  'سفن أب مع نكهة البلو والليمون الطازج وأوراق النعناع',
  45,
  true,
  'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000005',
  '30000000-0000-0000-0005-000000000003',
  'وافل كندر ونوتيلا مع الآيس كريم',
  'وافل بلجيكي مقرمش مغطى بشوكولاتة نوتيلا وكندر وآيس كريم',
  75,
  true,
  'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000006',
  'supermarkets',
  1,
  'سوبر ماركت الشيماء',
  'أكبر تشكيلة بقالة، ألبان، زيوت، معلبات ومنظفات منزلية بأسعار الجملة',
  '01011223344',
  'شارع المركز التجاري - الحسينية',
  NULL,
  0,
  10,
  10,
  4.7,
  110,
  true,
  true,
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0006-000000000001', '20000000-0000-0000-0000-000000000006', 'الألبان والأجبان', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0006-000000000002', '20000000-0000-0000-0000-000000000006', 'السلع الأساسية والزيوت', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0006-000000000003', '20000000-0000-0000-0000-000000000006', 'المنظفات والعناية المنزلية', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0006-000000000001',
  'جبن رومي قديم بطارخ ربع كيلو',
  'جبن رومي مصري بلدي معتق عالي الجودة',
  90,
  true,
  'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0006-000000000001',
  'حليب جهينة كامل الدسم 1 لتر',
  'حليب طبيعي معقم كامل الدسم غني بالكالسيوم',
  44,
  true,
  'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0006-000000000002',
  'زيت ذرة عافية نقي 800 مل',
  'زيت ذرة طبيعي خفيف وصحي للطبخ والقلي',
  95,
  true,
  'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0006-000000000002',
  'أرز مصري درجة أولى فاخر 1 كجم',
  'أرز أبيض حبة رفيعة منقى ومغسول وجاهز للطهي',
  36,
  true,
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000005',
  '20000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0006-000000000001',
  'طبق بيض أحمر مائدة طازج 30 بيضة',
  'بيض مزارع الشرقية أحمر طازج يوم بيوم',
  165,
  true,
  'https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000006',
  '20000000-0000-0000-0000-000000000006',
  '30000000-0000-0000-0006-000000000003',
  'مسحوق غسيل أريال أوتوماتيك 2.5 كجم',
  'مسحوق مركز للغسالات الأوتوماتيك مع داوني ونظافة فائقة',
  195,
  true,
  'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000007',
  'supermarkets',
  1,
  'الآن ماركت',
  'ماركت حديث متكامل، مجمدات غذائية، معلبات، سناكس ومشروبات باردة',
  '01033445566',
  'شارع المركز - بجوار بنك القاهرة',
  NULL,
  0,
  10,
  10,
  4.6,
  73,
  true,
  true,
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0007-000000000001', '20000000-0000-0000-0000-000000000007', 'المعلبات والمكرونة', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0007-000000000002', '20000000-0000-0000-0000-000000000007', 'المشروبات والقهوة', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000007',
  '30000000-0000-0000-0007-000000000001',
  'علبة تونة صن شاين قطع 185 جم',
  'تونة قطع في زيت نباتي نقي سهلة الفتح',
  65,
  true,
  'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000007',
  '30000000-0000-0000-0007-000000000001',
  'مكرونة الملكة أنواع مشكلة 400 جم',
  'مكرونة قمح صلب سريعة الطهي لا تتعجن',
  15,
  true,
  'https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000007',
  '30000000-0000-0000-0007-000000000002',
  'قهوة نسكافيه جولد كلاسيك برطمان 100 جم',
  'قهوة سريعة الذوبان بنكهة حبوب البن المحمصة الغنية',
  140,
  true,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000008',
  'supermarkets',
  1,
  'النجار ماركت',
  'كل احتياجات البيت التموينية والعطارة والبقوليات بأفضل الأسعار',
  '01055667788',
  'شارع المحكمة - الحسينية',
  NULL,
  0,
  12,
  10,
  4.5,
  52,
  true,
  true,
  'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0008-000000000001', '20000000-0000-0000-0000-000000000008', 'السلع التموينية والعطارة', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000008',
  '30000000-0000-0000-0008-000000000001',
  'سكر أبيض نقي معبأ 1 كجم',
  'سكر مكرر ناصع البياض سريع الذوبان',
  35,
  true,
  'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000008',
  '30000000-0000-0000-0008-000000000001',
  'شاي العروسة أسود فاخر 250 جم',
  'شاي أسود حبيبات عالي الجودة توليفة قوية',
  55,
  true,
  'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000009',
  'pharmacies',
  1,
  'صيدلية الحسينية الجديدة',
  'خدمة دواء ورعاية طبية على مدار 24 ساعة، استشارات صيدلية وتوصيل سريع',
  '01002702908',
  'شارع المركز التجاري - الحسينية',
  NULL,
  0,
  5,
  10,
  4.9,
  156,
  true,
  true,
  'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0009-000000000001', '20000000-0000-0000-0000-000000000009', 'أدوية ومسكنات وفيتامينات', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0009-000000000002', '20000000-0000-0000-0000-000000000009', 'رعاية الأم والطفل', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0009-000000000003', '20000000-0000-0000-0000-000000000009', 'أجهزة ومستلزمات طبية', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000009',
  '30000000-0000-0000-0009-000000000001',
  'بنادول إكسترا أحمر مسكن للصداع والحرارة',
  'شريط 12 قرص باراسيتامول مع كافيين لفاعلية أسرع',
  45,
  true,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000009',
  '30000000-0000-0000-0009-000000000001',
  'فيتامين سي فوار 1000 مجم عبوة 10 أقراص',
  'أقراص فوارة سريعة الامتصاص لتعزيز المناعة ومقاومة البرد',
  50,
  true,
  'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000009',
  '30000000-0000-0000-0009-000000000002',
  'حفاضات أطفال بامبرز كلوت مقاس 4',
  'عبوة توفير كلوت ناعم ومريح مانع للتسريب حتى 12 ساعة',
  230,
  true,
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000009',
  '30000000-0000-0000-0009-000000000002',
  'حليب أطفال هيرو بيبي نيوتراديفينس رقم 1',
  'تركيبة غذائية متوازنة لحديثي الولادة من عمر يوم حتى 6 شهور',
  185,
  true,
  'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000005',
  '20000000-0000-0000-0000-000000000009',
  '30000000-0000-0000-0009-000000000003',
  'جهاز ديجيتال أوتوماتيك لقياس ضغط الدم',
  'جهاز دقيق مع كف ذراع وشاشة LCD كبيرة وذاكرة قراءات سابقة',
  890,
  true,
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000010',
  'pharmacies',
  1,
  'صيدلية الفتح',
  'توفر كافة الأدوية المزمنة ومستلزمات الطوارئ والمستحضرات الطبية',
  '0552777528',
  'خلف موقف الأتوبيس - الحسينية',
  NULL,
  0,
  10,
  10,
  4.6,
  64,
  true,
  true,
  'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0010-000000000001', '20000000-0000-0000-0000-000000000010', 'أدوية ومسكنات عامة', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000010',
  '30000000-0000-0000-0010-000000000001',
  'كونجستال أقراص لنزلات البرد والاحتقان',
  'علاج فعال للرشح وسيلان الأنف والصداع والجيوب الأنفية',
  35,
  true,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000010',
  '30000000-0000-0000-0010-000000000001',
  'فولتارين جل إيمولجيل مسكن موضعي 50 جم',
  'جل مضاد للالتهابات ومسكن لآلام العضلات والمفاصل والظهر',
  65,
  true,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000011',
  'pharmacies',
  1,
  'صيدلية الشافعي الكبرى',
  'قسم متكامل للعناية بالبشرة والشعر ومستحضرات التجميل والأدوية المستوردة',
  '01011447788',
  'شارع بورسعيد - الحسينية',
  NULL,
  0,
  10,
  10,
  4.8,
  88,
  true,
  true,
  'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0011-000000000001', '20000000-0000-0000-0000-000000000011', 'العناية بالبشرة والتجميل', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000011',
  '30000000-0000-0000-0011-000000000001',
  'غسول سيرافي للبشرة العادية والجافة 236 مل',
  'منظف ومرطب بحمض الهيالورونيك والسيراميدات الأساسية',
  320,
  true,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000011',
  '30000000-0000-0000-0011-000000000001',
  'واقي شمس لاروش بوزيه أنثيليوس 50 مل',
  'حماية فائقة من أشعة الشمس بملمس خفيف غير دهني للبشرة',
  420,
  true,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000012',
  'doctors',
  1,
  'د. شهاب لبن - استشاري الباطنة والكلى والجهاز الهضمي',
  'استشاري أمراض الباطنة والكلى، تشخيص وعلاج أمراض الكبد والجهاز الهضمي والسكر والضغط',
  '01022334488',
  'شارع خليج الرمل - برج الأطباء - الدور الثاني',
  'باطنة وجهاز هضمي وكلى',
  180,
  0,
  10,
  4.9,
  178,
  true,
  true,
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0012-000000000001', '20000000-0000-0000-0000-000000000012', 'خدمات الحجز والكشف', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000012',
  '30000000-0000-0000-0012-000000000001',
  'حجز كشف باطنة وكلى وجهاز هضمي',
  'كشف إكلينيكي وفحص دقيق ومتابعة وظائف الكلى وضغط الدم',
  180,
  true,
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000012',
  '30000000-0000-0000-0012-000000000001',
  'فحص السونار التلفزيوني على البطن والحوض',
  'أشعة موجات فوق صوتية لفحص الكبد والكلى والمرارة والمثانة',
  120,
  true,
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000013',
  'doctors',
  1,
  'د. تامر الدسوقي - استشاري أمراض النساء والتوليد',
  'استشاري أمراض النساء والتوليد وجراحة المناظير وعلاج العقم وتأخر الإنجاب',
  '01088990011',
  'شارع المركز - برج الحكمة - الدور الثالث',
  'نساء وتوليد وتأخر إنجاب',
  200,
  0,
  10,
  4.8,
  135,
  true,
  true,
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0013-000000000001', '20000000-0000-0000-0000-000000000013', 'خدمات الكشف والمتابعة', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000013',
  '30000000-0000-0000-0013-000000000001',
  'كشف نساء وتوليد مع سونار 4D',
  'فحص شامل ومتابعة نمو الجنين بأحدث أجهزة السونار الملون رباعي الأبعاد',
  200,
  true,
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000013',
  '30000000-0000-0000-0013-000000000001',
  'استشارة ومتابعة دورية للحمل',
  'متابعة شهرية لتحاليل الدم والوزن والضغط وصحة الأم والجنين',
  80,
  true,
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000014',
  'doctors',
  1,
  'عيادة د. محمد عناني لطب وجراحة الأسنان',
  'علاج الجذور والعصب، تجميل وتبييض الأسنان، زراعة الأسنان، وتركيبات الزيركون',
  '01099001122',
  'شارع المركز - عمارة الصفا - الدور الأول',
  'طب وجراحة الأسنان',
  120,
  0,
  10,
  4.9,
  142,
  true,
  true,
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0014-000000000001', '20000000-0000-0000-0000-000000000014', 'خدمات طب وتجميل الأسنان', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000014',
  '30000000-0000-0000-0014-000000000001',
  'كشف أسنان واستشارة خطة علاج متكاملة',
  'فحص الفم والأسنان وتحديد مواعيد الجلسات والتركيبات',
  120,
  true,
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000014',
  '30000000-0000-0000-0014-000000000001',
  'جلسة تنظيف جير وتلميع أسنان بالموجات الصوتية',
  'إزالة الرواسب الجيرية وتلميع الأسنان للتخلص من البقع السطحية',
  250,
  true,
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000014',
  '30000000-0000-0000-0014-000000000001',
  'حشو ليزر كمبوزيت ضوئي تجميلي',
  'حشو تجميلي بنفس لون السن الطبيعي ومقاوم للتسوس',
  350,
  true,
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000015',
  'doctors',
  1,
  'د. منار سعيد رجب - أخصائية التغذية العلاجية',
  'أخصائية التغذية العلاجية، أنظمة إنقاص وتثبيت الوزن، تغذية مرضى السكر ونحت القوام',
  '01033669922',
  'شارع المركز - برج الأمل',
  'تغذية علاجية ونحت القوام',
  140,
  0,
  10,
  4.7,
  91,
  true,
  true,
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0015-000000000001', '20000000-0000-0000-0000-000000000015', 'خدمات الكشف والتغذية', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000015',
  '30000000-0000-0000-0015-000000000001',
  'كشف تغذية + تحليل دهون InBody وبرنامج مخصص',
  'قياس دقيق لنسبة الدهون والعضلات والماء ووضع دايت صحي متوازن',
  140,
  true,
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000016',
  'maintenance',
  1,
  'الأسطى أحمد لصيانة وتأسيس السباكة',
  'كافة أعمال السباكة المنزلية، تصليح التسريبات، تأسيس شبكات المياه، وتركيب الفلاتر والسخانات',
  '01044556677',
  'الحسينية وجميع القرى والمراكز التابعة',
  'سباكة وأدوات صحية',
  0,
  0,
  10,
  4.8,
  89,
  true,
  true,
  'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0016-000000000001', '20000000-0000-0000-0000-000000000016', 'خدمات السباكة المنزلية', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000016',
  '30000000-0000-0000-0016-000000000001',
  'معاينة وفحص أعطال وتسريبات السباكة',
  'كشف أماكن التسريب وتحديد القطع التالفة والإصلاحات المطلوبة',
  100,
  true,
  'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000016',
  '30000000-0000-0000-0016-000000000001',
  'تركيب وصيانة خلاطات مياه وأحواض',
  'تركيب خلاط مطبخ أو حمام جديد، تصليح المحابس، واختبار ضغط المياه',
  150,
  true,
  'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000016',
  '30000000-0000-0000-0016-000000000001',
  'صيانة سخان مياه غاز أو كهرباء',
  'تغيير الهيتر، فحص صمام الأمان وتفريغ الرواسب لرفع كفاءة التسخين',
  200,
  true,
  'https://images.unsplash.com/photo-1542013936693-884638332954?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000017',
  'maintenance',
  1,
  'كهربائي منازل - الأسطى محمود علي',
  'صيانة أعطال الكهرباء المنزلية، تأسيس الشقق، تركيب الإضاءة الحديثة والليد واللوحات',
  '01088991133',
  'شارع بورسعيد - الحسينية',
  'تأسيس وصيانة كهرباء',
  0,
  0,
  10,
  4.7,
  67,
  true,
  true,
  'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0017-000000000001', '20000000-0000-0000-0000-000000000017', 'أعمال الكهرباء المنزلية', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000017',
  '30000000-0000-0000-0017-000000000001',
  'فحص شورت وتصليح قواطع الكهرباء',
  'إصلاح الماس الكهربائي وتغيير القواطع الأوتوماتيكية التالفة باللوحة',
  120,
  true,
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000017',
  '30000000-0000-0000-0017-000000000001',
  'تركيب نجف وإضاءة ليد بروفايل',
  'تثبيت وتركيب النجف والأباليك وشريط ليد بروفايل بالسقف الجبس',
  150,
  true,
  'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000018',
  'maintenance',
  1,
  'الورشة الفنية للنجارة - الأسطى إبراهيم',
  'صيانة الموبيليا، فك وتركيب غرف النوم والأثاث، وتصليح الأبواب والشبابيك والكوالين',
  '01066778899',
  'شارع المحطة - الحسينية',
  'نجارة وموبيليا',
  0,
  0,
  10,
  4.6,
  45,
  true,
  true,
  'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0018-000000000001', '20000000-0000-0000-0000-000000000018', 'خدمات النجارة والموبيليا', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000018',
  '30000000-0000-0000-0018-000000000001',
  'صيانة وتصليح باب أو شباك وتغيير كالون',
  'ضبط حركة الأبواب وتغيير المفصلات والمقابض والكوالين التالفة',
  120,
  true,
  'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000018',
  '30000000-0000-0000-0018-000000000001',
  'فك وتركيب غرفة نوم خشب كاملة',
  'فك دولاب وسرير وتسريحة ونقلها وتركيبها باحترافية وأمان',
  400,
  true,
  'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab32f?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000019',
  'maintenance',
  3,
  'المركز الحديث لصيانة التكييفات والأجهزة',
  'شحن وصيانة التكييفات المنزلية، صيانة الغسالات الأوتوماتيك والثلاجات مع ضمان على قطع الغيار',
  '01011229988',
  'طريق سماكين الشرق الرئيسي - الحسينية',
  'صيانة تبريد وتكييف وأجهزة كهربائية',
  0,
  0,
  10,
  4.8,
  79,
  true,
  true,
  'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1631545624777-628d689620ca?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0019-000000000001', '20000000-0000-0000-0000-000000000019', 'صيانة التكييف والأجهزة', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000019',
  '30000000-0000-0000-0019-000000000001',
  'شحن فريون تكييف 1.5 حصان وتنظيف الفلاتر',
  'شحن فريون هندي أصلي r22/r410 وتنظيف دورة الهواء والفلاتر',
  450,
  true,
  'https://images.unsplash.com/photo-1631545624777-628d689620ca?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000019',
  '30000000-0000-0000-0019-000000000001',
  'صيانة غسالة أوتوماتيك وتغيير الطلمبة أو السير',
  'فحص كارتة الغسالة وماتور العصر وتصليح أعطال الصرف',
  250,
  true,
  'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000020',
  'gifts',
  1,
  'محل البرنسيسة للأزياء الحريمي',
  'أرقى فساتين السهرة والعبايات الخروج الخليجي والدريسات الكاجوال التركي',
  '01022446688',
  'شارع المركز التجاري - الحسينية',
  NULL,
  0,
  15,
  10,
  4.8,
  104,
  true,
  true,
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0020-000000000001', '20000000-0000-0000-0000-000000000020', 'فساتين وسواريهات', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0020-000000000002', '20000000-0000-0000-0000-000000000020', 'عبايات خروج ودريسات', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000020',
  '30000000-0000-0000-0020-000000000001',
  'فستان سواريه ستان أنيق للمناسبات',
  'قصة عصرية خامة ستان حرير لامعة وتطريز راقي للمناسبات والأفراح',
  750,
  true,
  'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000020',
  '30000000-0000-0000-0020-000000000002',
  'عباية خروج كريب سعودي مطرزة بالخرز الأسود',
  'خامة كريب ملكي ناعمة مريحة فضفاضة تطريز يدوي فاخر',
  620,
  true,
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000020',
  '30000000-0000-0000-0020-000000000002',
  'طرحة شيفون كويتي ناعمة مقاس كبير',
  'طرحة خفيفة ثابتة غير قابلة للانزلاق ألوان صيفية مبهجة',
  85,
  true,
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000021',
  'gifts',
  1,
  'محل الدفة للملابس الرجالي',
  'جلاليب خليجي ومصري فاخرة، قمصان وبناطيل كلاسيك، وأثواب راقية',
  '01033557799',
  'شارع المحكمة - الحسينية',
  NULL,
  0,
  15,
  10,
  4.7,
  68,
  true,
  true,
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0021-000000000001', '20000000-0000-0000-0000-000000000021', 'أزياء رجالي وجلاليب', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000021',
  '30000000-0000-0000-0021-000000000001',
  'جلباب رجالي فاخر ماركة الدفة خامة صيفي',
  'قماش ياباني بارد ومريح بتطريز أنيق على الياقة والأكمام',
  450,
  true,
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000021',
  '30000000-0000-0000-0021-000000000001',
  'قميص كلاسيك رجالي قطن مصري 100%',
  'قصة سليم فت كلاسيكية مناسبة للعمل والمناسبات الرسمية',
  280,
  true,
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000021',
  '30000000-0000-0000-0021-000000000001',
  'بنطلون جينز كاجوال شبابي مستورد',
  'جينز قطن مطاط مريح متين يتحمل الغسيل اليومي',
  320,
  true,
  'https://images.unsplash.com/photo-1542272604-780c968565fe?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000022',
  'gifts',
  1,
  'زهور وهدايا لافندر',
  'تنسيق بوكيهات الورد الطبيعي، بوكسات الهدايا، شيكولاتة المناسبات والساعات الفاخرة',
  '01077881122',
  'ميدان الحسينية الرئيسي',
  NULL,
  0,
  15,
  10,
  4.9,
  82,
  true,
  true,
  'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0022-000000000001', '20000000-0000-0000-0000-000000000022', 'بوكيهات ورد طبيعي', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0022-000000000002', '20000000-0000-0000-0000-000000000022', 'بوكسات هدايا وشوكولاتة', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000022',
  '30000000-0000-0000-0022-000000000001',
  'بوكيه ورد جوري أحمر طبيعي مع تغليف أسود',
  'تنسيق 20 وردة جوري هولندي فاخرة مع جبسوفيليا وتغليف حريري أنيق',
  380,
  true,
  'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000022',
  '30000000-0000-0000-0022-000000000002',
  'بوكس هدايا شيكولاتة فيريرو روشيه مع عطر رجالي',
  'صندوق أنيق محشو بالشوكولاتة الفاخرة وزجاجة عطر ثابتة مع كارت إهداء',
  550,
  true,
  'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000022',
  '30000000-0000-0000-0022-000000000002',
  'طقم ساعة يد جلد طبيعي مع محفظة إهداء',
  'ساعة يد ضد الماء بتصميم كلاسيكي ومحفظة جلد أسود بعلبة قطيفة',
  420,
  true,
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000023',
  'home',
  1,
  'شركة النقاء للخدمات المنزلية ومكافحة الحشرات',
  'إبادة ومكافحة جميع أنواع الحشرات والقوارض، غسيل السجاد والأنتريهات بالبخار الجاف وتعقيم المنازل',
  '01099112233',
  'الحسينية ومحافظة الشرقية بالكامل',
  'إبادة حشرات ونظافة منازل',
  0,
  0,
  10,
  4.8,
  94,
  true,
  true,
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0023-000000000001', '20000000-0000-0000-0000-000000000023', 'خدمات المكافحة والتعقيم', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0023-000000000002', '20000000-0000-0000-0000-000000000023', 'غسيل المفروشات بالبخار', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000023',
  '30000000-0000-0000-0023-000000000001',
  'جلسة رش ومكافحة حشرات وقوارض شاملة بضمان',
  'مبيدات آمنة مصرحة من وزارة الصحة بدون رائحة وبدون مغادرة المنزل مع ضمان 6 شهور',
  400,
  true,
  'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000023',
  '30000000-0000-0000-0023-000000000002',
  'غسيل وتعقيم طقم أنتريه أو صالون بالبخار الجاف',
  'تنظيف عميق وإزالة أصعب البقع والدهون والروائح الكريهة مع التعطير',
  350,
  true,
  'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000023',
  '30000000-0000-0000-0023-000000000001',
  'نظافة وغسيل وتعقيم خزان مياه علوي للمنزل',
  'تفريغ وتنظيف الرواسب والكلور وتعقيم جدران الخزان لضمان مياه نقية',
  300,
  true,
  'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000024',
  'home',
  1,
  'سند لخدمات نقل العفش وتغليف الأثاث',
  'أحدث أوناش رفع الأثاث الهيدروليكية، سيارات مغلقة حديثة، تغليف كامل وفريق عمالة مدرب',
  '01055443322',
  'الحسينية، فاقوس، ومراكز الشرقية',
  'نقل عفش وونش هيدروليكي',
  0,
  0,
  10,
  4.9,
  112,
  true,
  true,
  'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category,
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  specialty = EXCLUDED.specialty,
  booking_fee = EXCLUDED.booking_fee,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = EXCLUDED.is_active,
  is_open = EXCLUDED.is_open,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0024-000000000001', '20000000-0000-0000-0000-000000000024', 'خدمات النقل والرفع والتغليف', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000024',
  '30000000-0000-0000-0024-000000000001',
  'ونش هيدروليكي لرفع وتنزيل الأثاث للأدوار العليا',
  'ونش ألماني حديث يصل حتى الدور الثاني عشر للحفاظ على الأثاث من التجريح',
  700,
  true,
  'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000024',
  '30000000-0000-0000-0024-000000000001',
  'تغليف كامل لمحتويات الشقة بفقاعات وبابلز وكرتون',
  'تغليف الصيني والزجاج والتحف والشاشات والأجهزة الكهربائية بأعلى معايير الأمان',
  500,
  true,
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000024',
  '30000000-0000-0000-0024-000000000001',
  'سيارة نقل مغلقة حديثة مخصصة لنقل الأثاث',
  'سيارة صندوق مغلق مجهز من الداخل لتربيط الأثاث ومنع الحركة أثناء الطريق',
  600,
  true,
  'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;
