-- Migration: Comprehensive Al-Husayniya Restaurants and Full Admin Permissions
-- Ensure Admin Role and Auto-Assignment Trigger for bodydaana2016@gmail.com

-- Function to grant admin role and store ownership
CREATE OR REPLACE FUNCTION public.grant_admin_and_assign_stores()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Look for user with admin email
  SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = 'bodydaana2016@gmail.com' LIMIT 1;
  IF v_admin_id IS NULL THEN
    SELECT id INTO v_admin_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  END IF;

  IF v_admin_id IS NOT NULL THEN
    -- Grant admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    -- Assign ownership of all stores to admin
    UPDATE public.stores
    SET owner_id = v_admin_id;
  END IF;
END;
$$;

-- Trigger to grant admin automatically whenever the user registers or logs in
CREATE OR REPLACE FUNCTION public.auto_promote_admin_on_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'bodydaana2016@gmail.com' OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;

    UPDATE public.stores
    SET owner_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_promote_admin ON auth.users;
CREATE TRIGGER trigger_auto_promote_admin
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_promote_admin_on_user();

-- Execute immediately for existing users if any
SELECT public.grant_admin_and_assign_stores();

-- Insert / Upsert All 14 Real Restaurants in Al-Husayniya

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  'restaurants',
  1,
  'مشويات الباز',
  'أشهر مشويات ولحوم بلدي وطواجن في الحسينية وجزيرة سعود',
  '01023456781',
  'شارع المركز الرئيسي - بجوار بنك مصر - الحسينية',
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
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0001-000000000001', '20000000-0000-0000-0000-000000000001', 'مشويات اللحوم والدواجن', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0001-000000000002', '20000000-0000-0000-0000-000000000001', 'طواجن الفرن والأرز المعمر', 2)
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
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
  'شارع المركز - أمام المحكمة القديمة - الحسينية',
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
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0002-000000000001', '20000000-0000-0000-0000-000000000002', 'البيتزا الإيطالي', 1)
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
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
  'شارع المركز - بجوار موقف الشرق - الحسينية',
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
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
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
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000003',
  '30000000-0000-0000-0003-000000000001',
  'علبة كشري جامبو عائلي',
  'حجم عائلي مضاعف مع علب صلصة ودقة إضافية وتقلية',
  60,
  true,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000101',
  'restaurants',
  1,
  'كشري الزعيم والحسيني',
  'كشري مصري مميز مع إضافات كبدة إسكندراني وسجق وطواجن موتزاريلا',
  '01061234567',
  'شارع بورسعيد - أمام مدرسة الثانوية بنين - الحسينية',
  NULL,
  0,
  10,
  10,
  4.7,
  76,
  true,
  true,
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0101-000000000001', '20000000-0000-0000-0000-000000000101', 'أطباق الكشري المميز', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0101-000000000002', '20000000-0000-0000-0000-000000000101', 'طواجن الزعيم', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000101',
  '30000000-0000-0000-0101-000000000001',
  'طبق كشري الزعيم بالكبدة الإسكندراني',
  'كشري التحرير مع طبقة كبدة إسكندراني متبلة بالفلفل الحار والثوم',
  65,
  true,
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000101',
  '30000000-0000-0000-0101-000000000001',
  'علبة كشري فوكس سوبر بالصلصة والتقلية',
  'خلطة كشري غنية بالصلصة الخاصة وحمص الشام والتقلية المقرمشة',
  40,
  true,
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000101',
  '30000000-0000-0000-0101-000000000002',
  'طاجن سجق بلدي بالموتزاريلا في الفرن',
  'مكرونة قلم بقطع السجق الشرقي المتبل وجبنة موتزاريلا محمرة',
  80,
  true,
  'https://images.unsplash.com/photo-1621996346565-e3d5d6281081?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000102',
  'restaurants',
  1,
  'شاورما الريم السورية',
  'أشهى ساندوتشات ووجبات الشاورما السوري دجاج ولحم وفتة شاورما بالثومية',
  '01099881122',
  'شارع المركز التجاري - بجوار مسجد النور - الحسينية',
  NULL,
  0,
  15,
  10,
  4.8,
  110,
  true,
  true,
  'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0102-000000000001', '20000000-0000-0000-0000-000000000102', 'ساندوتشات شاورما صاج', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0102-000000000002', '20000000-0000-0000-0000-000000000102', 'وجبات وفتة الشاورما', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000102',
  '30000000-0000-0000-0102-000000000001',
  'ساندوتش شاورما دجاج صاج سوري كبير',
  'شاورما دجاج متبلة في خبز صاج محمص مع ثومية ومخلل خيار',
  65,
  true,
  'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000102',
  '30000000-0000-0000-0102-000000000001',
  'ساندوتش شاورما لحم صاج سوري بالبقدونس والطحينة',
  'شاورما لحم عجل شرائح مع صوص طحينة وبصل وبقدونس وسماق',
  80,
  true,
  'https://images.unsplash.com/photo-1633321702518-7feccafb94d5?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000102',
  '30000000-0000-0000-0102-000000000002',
  'وجبة شاورما عربي دجاج مع البطاطس والثومية',
  'ساندوتش شاورما مقطع رول مع بطاطس فارم فريتس وثومية ومخلل',
  100,
  true,
  'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000102',
  '30000000-0000-0000-0102-000000000002',
  'فتة شاورما ميكس دجاج ولحم مع الخبز المحمص',
  'أرز بسمتي أصفر مبهر مع شاورما دجاج ولحم وخبز شامي مقرمش وصوص ثومية',
  125,
  true,
  'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000103',
  'restaurants',
  1,
  'بازوكا فرايد تشيكن وبرجر',
  'أقوى وجبات دجاج مقلي كرسبي مقرمش وساندوتشات برجر عملاقة وكول سلو',
  '01019283746',
  'شارع المركز التجاري - تقاطع شارع بورسعيد - الحسينية',
  NULL,
  0,
  15,
  10,
  4.7,
  138,
  true,
  true,
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0103-000000000001', '20000000-0000-0000-0000-000000000103', 'وجبات الدجاج المقرمش', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0103-000000000002', '20000000-0000-0000-0000-000000000103', 'برجر تشيكن ولحم', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000103',
  '30000000-0000-0000-0103-000000000001',
  'وجبة 3 قطع دجاج مقلي كرسبي مع البطاطس والخبز',
  '3 قطع بروستد كرسبي مقرمشة مع بطاطس وصوص كول سلو وخبز كايزر',
  130,
  true,
  'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000103',
  '30000000-0000-0000-0103-000000000001',
  'وجبة 5 قطع استربس دجاج حار مقرمش',
  'أصابع دجاج مقرمشة مع صوص الرانش وصوص الباربكيو وبطاطس',
  120,
  true,
  'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000103',
  '30000000-0000-0000-0103-000000000002',
  'ساندوتش بازوكا تشيكن تاور عملاق',
  'قطعة صدور دجاج كرسبي مع أصابع جبن موتزاريلا وشيدر وصوص مايونيز حار',
  115,
  true,
  'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000104',
  'restaurants',
  1,
  'مطعم الشبراوي - الحسينية',
  'الفول المدمس بالسمن والزيت الحار، فلافل سخنة محشية، باذنجان وبطاطس وساندوتشات شعبية',
  '01033441155',
  'شارع المركز - بجوار بنك مصر - الحسينية',
  NULL,
  0,
  10,
  10,
  4.8,
  160,
  true,
  true,
  'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0104-000000000001', '20000000-0000-0000-0000-000000000104', 'أطباق وعلب الفول والفلافل', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0104-000000000002', '20000000-0000-0000-0000-000000000104', 'الساندوتشات الشعبية والبطاطس', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000104',
  '30000000-0000-0000-0104-000000000001',
  'علبة فول مدمس بالسمن البلدي والليمون',
  'فول بلدي مهروس متبل بالكمون والطحينة والسمن البلدي الطازج',
  25,
  true,
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000104',
  '30000000-0000-0000-0104-000000000001',
  'طلب فلافل محشية عين كبرى (4 أقراص)',
  'طعمية مقرمشة محشوة بخلطة البصل والشطة والسمسم المحمص',
  20,
  true,
  'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000104',
  '30000000-0000-0000-0104-000000000002',
  'ساندوتش بطاطس بانيه مايونيز وكاتشب',
  'بطاطس مقلية مقرمشة في خبز شامي مع مخلل وصوصات',
  15,
  true,
  'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000104',
  '30000000-0000-0000-0104-000000000001',
  'علبة مسقعة بالباذنجان والفلفل الحار',
  'مسقعة بلدي بصلصة الطماطم المسبكة والخل والثوم',
  25,
  true,
  'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000105',
  'restaurants',
  1,
  'فطاطري عم شلتت',
  'فطير مشلتت فلاحي بالسمن البلدي الفاخر، فطائر حادقة بميكس الجبن والسجق، وفطائر حلوة بالسكر واللبن',
  '01077665544',
  'شارع المحكمة - أمام مدرسة التجارة - الحسينية',
  NULL,
  0,
  15,
  10,
  4.9,
  88,
  true,
  true,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0105-000000000001', '20000000-0000-0000-0000-000000000105', 'الفطير المشلتت الفلاحي', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0105-000000000002', '20000000-0000-0000-0000-000000000105', 'الفطير الشرقي الحادق', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0105-000000000003', '20000000-0000-0000-0000-000000000105', 'الفطير الحلو والحلو الشرقي', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000105',
  '30000000-0000-0000-0105-000000000001',
  'فطيرة مشلتت فلاحي سمن بلدي وسط',
  'فطير مورق بالسمن البلدي الصافي خفيف ومقرمش من الأطراف',
  85,
  true,
  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000105',
  '30000000-0000-0000-0105-000000000002',
  'فطيرة شرقي سجق بلدي وميكس جبن رومي وموتزاريلا',
  'فطيرة حادقة محشوة سجق إسكندراني متبل وزيتون وفلفل وموتزاريلا',
  120,
  true,
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000105',
  '30000000-0000-0000-0105-000000000003',
  'فطيرة كاسترد سكر ولبن وقشطة بلدي',
  'فطيرة محشوة كاسترد ومسقية حليب محلى وسكر بودرة وقشطة',
  70,
  true,
  'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000106',
  'restaurants',
  1,
  'أسماك ومأكولات بحرية الحسينية',
  'أطازج الأسماك البوري والبلطي والجمبري والسبيط، شوي بالردة، زيت وليمون، وطواجن إسكندراني',
  '01088776655',
  'شارع المحطة - بالقرب من ميدان المحطة - الحسينية',
  NULL,
  0,
  15,
  10,
  4.8,
  102,
  true,
  true,
  'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0106-000000000001', '20000000-0000-0000-0000-000000000106', 'الأسماك المشوية والمقلية', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0106-000000000002', '20000000-0000-0000-0000-000000000106', 'الجمبري والمأكولات البحرية', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000106',
  '30000000-0000-0000-0106-000000000001',
  'كيلو سمك بلدي مشوي بالردة مع الأرز والسلطة',
  'سمك بلدي طازج مشوي بالردة متبل بالثوم والليمون والكمون والشطة',
  130,
  true,
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000106',
  '30000000-0000-0000-0106-000000000001',
  'كيلو سمك بوري سنجاري بزيت وليمون بالفرن',
  'سمك بوري مفتوح سنجاري مع خلطة طماطم وبصل وكرفس وليمون في الفرن',
  210,
  true,
  'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000106',
  '30000000-0000-0000-0106-000000000002',
  'طاجن جمبري إسكندراني بصلصة الطماطم والفلفل',
  'جمبري وسط في الفرن بصلصة الطماطم والثوم مع توابل السي فود',
  230,
  true,
  'https://images.unsplash.com/photo-1559742811-822873691df8?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000106',
  '30000000-0000-0000-0106-000000000002',
  'شوربة سي فود مخلية بالكريمة',
  'شوربة غنية بقطع الجمبري والكاليماري والسمك الفيليه والكريمة اللباني',
  85,
  true,
  'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000107',
  'restaurants',
  1,
  'مطعم نعمة للمأكولات السريعة والحواوشي',
  'حواوشي بلدي على الفحم، ساندوتشات كبدة إسكندراني وسجق متبل وطحينة ومخلل',
  '01055449988',
  'شارع المركز - بجوار صيدلية الحسينية - الحسينية',
  NULL,
  0,
  10,
  10,
  4.7,
  80,
  true,
  true,
  'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0107-000000000001', '20000000-0000-0000-0000-000000000107', 'الحواوشي البلدي', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0107-000000000002', '20000000-0000-0000-0000-000000000107', 'ساندوتشات الكبدة والسجق', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000107',
  '30000000-0000-0000-0107-000000000001',
  'رغيف حواوشي لحم بلدي على الفحم مخصوص',
  'لحم بقري بلدي متبل بالبهارات الشرقية في خبز بلدي مقرمش على الشواية',
  50,
  true,
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000107',
  '30000000-0000-0000-0107-000000000001',
  'رغيف حواوشي لحم بالموتزاريلا والبسطرمة',
  'حواوشي بلدي غني بالجبنة الموتزاريلا الذائبة وقطع البسطرمة',
  70,
  true,
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000003',
  '20000000-0000-0000-0000-000000000107',
  '30000000-0000-0000-0107-000000000002',
  'ساندوتش كبدة إسكندراني بالفلفل الحار والليمون',
  'كبدة بلدي طازجة مقلية بالفلفل الأخضر الحار والخل والثوم في عيش فينو',
  30,
  true,
  'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000107',
  '30000000-0000-0000-0107-000000000002',
  'ساندوتش سجق شرقي متبل بالصلصة والبصل',
  'سجق بلدي بالخلطة الشرقية والصلصة المتبلة في عيش فينو طازج',
  35,
  true,
  'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
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
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0004-000000000001', '20000000-0000-0000-0000-000000000004', 'حلويات شرقية وتورت', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0004-000000000002', '20000000-0000-0000-0000-000000000004', 'عصائر فريش وكوكتيل', 2)
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000004',
  '20000000-0000-0000-0000-000000000004',
  '30000000-0000-0000-0004-000000000002',
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
  is_available = true,
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
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0005-000000000001', '20000000-0000-0000-0000-000000000005', 'القهوة والمشروبات الساخنة', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0005-000000000002', '20000000-0000-0000-0000-000000000005', 'المشروبات الباردة والموكتيل', 2)
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
  is_available = true,
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
  is_available = true,
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
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000108',
  'restaurants',
  3,
  'مشويات وكبابجي الأمانة',
  'كباب ضاني بلدي، ريش مشوية على الفحم، طرب، وكفتة متبلة مع الأرز البسمتي والسلطات',
  '01044332211',
  'طريق سماكين الشرق الرئيسي - الحسينية',
  NULL,
  0,
  18,
  10,
  4.8,
  73,
  true,
  true,
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0108-000000000001', '20000000-0000-0000-0000-000000000108', 'كباب ومشويات ضاني', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000108',
  '30000000-0000-0000-0108-000000000001',
  'كيلو مشكل كباب وكفتة وريش ضاني',
  'تشكيلة مشويات ضاني بلدي مشوية على الفحم مع خبز وسلطات وطحينة',
  580,
  true,
  'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000108',
  '30000000-0000-0000-0108-000000000001',
  'ربع كيلو طرب مشوي بالخلطة',
  'طرب لحم مفروم بلدي ملفوف بالمنديل المشوي على الفحم',
  160,
  true,
  'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, commission_rate, rating, reviews_count, is_active, is_open, logo_url, banner_url)
VALUES (
  '20000000-0000-0000-0000-000000000109',
  'restaurants',
  1,
  'رويال لاونج كافيه ومطعم',
  'كافيه عصري ومطعم يقدم وجبات كريب وبرجر وحلويات وافل وجميع أنواع المشروبات الباردة والساخنة',
  '01099118833',
  'ميدان الحسينية الرئيسي - برج النخبة - الدور الثاني',
  NULL,
  0,
  15,
  10,
  4.7,
  92,
  true,
  true,
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  category = 'restaurants',
  area_id = EXCLUDED.area_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address,
  delivery_fee = EXCLUDED.delivery_fee,
  rating = EXCLUDED.rating,
  reviews_count = EXCLUDED.reviews_count,
  is_active = true,
  is_open = true,
  logo_url = EXCLUDED.logo_url,
  banner_url = EXCLUDED.banner_url;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0109-000000000001', '20000000-0000-0000-0000-000000000109', 'ساندوتشات وكريب لاونج', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.store_sections (id, store_id, name, sort_order)
VALUES ('30000000-0000-0000-0109-000000000002', '20000000-0000-0000-0000-000000000109', 'المشروبات والوافل', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000001',
  '20000000-0000-0000-0000-000000000109',
  '30000000-0000-0000-0109-000000000001',
  'برجر لحم رويال تريبل جبن صوص باربكيو',
  'ثلاث طبقات لحم بقري صافي مع شيدر ومخلل وصوص مدخن وبطاطس',
  145,
  true,
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

INSERT INTO public.products (id, store_id, section_id, name, description, price, is_available, image_url)
VALUES (
  '20000000-0000-0000-0000-00000000002',
  '20000000-0000-0000-0000-000000000109',
  '30000000-0000-0000-0109-000000000002',
  'وافل فواكه نوتيلا وآيس كريم لوتس',
  'وافل مقرمش مغطى بصوص اللوتس والنوتيلا وقطع الموز والفراولة',
  80,
  true,
  'https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600&auto=format&fit=crop&q=80'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = true,
  image_url = EXCLUDED.image_url,
  section_id = EXCLUDED.section_id;

-- Final update to ensure admin ownership
SELECT public.grant_admin_and_assign_stores();
