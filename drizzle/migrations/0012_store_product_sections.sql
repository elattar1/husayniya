CREATE TABLE public.store_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 80),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (store_id, name)
);
GRANT SELECT ON public.store_sections TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_sections TO authenticated;
GRANT ALL ON public.store_sections TO service_role;
ALTER TABLE public.store_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "store sections read" ON public.store_sections FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = store_id
      AND (s.is_active OR s.owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ));
CREATE POLICY "store sections owner write" ON public.store_sections FOR ALL TO authenticated
  USING (public.is_store_owner(store_id) OR public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.is_store_owner(store_id) OR public.has_role(auth.uid(), 'admin'));

ALTER TABLE public.products
  ADD COLUMN section_id uuid REFERENCES public.store_sections(id) ON DELETE SET NULL;
CREATE INDEX products_section_id_idx ON public.products(section_id);
CREATE INDEX store_sections_store_order_idx ON public.store_sections(store_id, sort_order, name);

CREATE OR REPLACE FUNCTION public.product_section_validation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.section_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.store_sections
    WHERE id = NEW.section_id AND store_id = NEW.store_id
  ) THEN
    RAISE EXCEPTION 'القسم المختار لا يتبع هذا المتجر';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER products_section_validation
  BEFORE INSERT OR UPDATE OF store_id, section_id ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.product_section_validation();

INSERT INTO public.store_sections (store_id, name, sort_order)
SELECT s.id, suggested.name, suggested.sort_order
FROM public.stores s
CROSS JOIN (VALUES
  ('supermarkets', 'الألبان والبيض والأجبان', 10),
  ('supermarkets', 'الزيوت والأرز والمكرونة والبقوليات', 20),
  ('supermarkets', 'المعلبات والصلصات والتوابل', 30),
  ('supermarkets', 'المشروبات والشاي والقهوة', 40),
  ('supermarkets', 'المنظفات والمناديل', 50),
  ('supermarkets', 'الشيبسي والبسكويت والشوكولاتة', 60),
  ('restaurants', 'الوجبات الرئيسية', 10),
  ('restaurants', 'المشويات', 20),
  ('restaurants', 'الساندوتشات', 30),
  ('restaurants', 'المشروبات', 40),
  ('restaurants', 'الحلويات', 50)
) AS suggested(category, name, sort_order)
WHERE s.category = suggested.category
ON CONFLICT (store_id, name) DO NOTHING;

UPDATE public.products AS p
SET section_id = ps.id
FROM public.store_sections AS ps
WHERE ps.store_id = p.store_id
  AND p.section_id IS NULL
  AND p.catalog_key IS NOT NULL
  AND ps.name = CASE split_part(p.catalog_key, '-', 1)
    WHEN 'dairy' THEN 'الألبان والبيض والأجبان'
    WHEN 'pantry' THEN 'الزيوت والأرز والمكرونة والبقوليات'
    WHEN 'canned' THEN 'المعلبات والصلصات والتوابل'
    WHEN 'drinks' THEN 'المشروبات والشاي والقهوة'
    WHEN 'cleaning' THEN 'المنظفات والمناديل'
    WHEN 'snacks' THEN 'الشيبسي والبسكويت والشوكولاتة'
    ELSE ''
  END;

UPDATE public.products AS p
SET section_id = (
  SELECT ps.id FROM public.store_sections ps
  WHERE ps.store_id = p.store_id
    AND ps.name = CASE
      WHEN p.name ~ '(كفتة|مشوي|مشويات)' THEN 'المشويات'
      WHEN p.name ~ '(طاجن|وجبة|أرز|ارز)' THEN 'الوجبات الرئيسية'
      WHEN p.name ~ '(قهوة|عصير|مشروب|شاي)' THEN 'المشروبات'
      WHEN p.name ~ '(وافل|حلو|كيك)' THEN 'الحلويات'
      WHEN p.name ~ '(لبن|جبن|بيض|زبادي|زبدة|قشطة)' THEN 'الألبان والبيض والأجبان'
      WHEN p.name ~ '(أرز|ارز|زيت|سكر|مكرونة|عدس|فول|دقيق|سمن)' THEN 'الزيوت والأرز والمكرونة والبقوليات'
      WHEN p.name ~ '(صلصة|تونة|مايونيز|مرقة|كمون|فلفل|ملح)' THEN 'المعلبات والصلصات والتوابل'
      WHEN p.name ~ '(شاي|قهوة|بن|عصير|مياه)' THEN 'المشروبات والشاي والقهوة'
      WHEN p.name ~ '(مسحوق|منظف|كلور|مناديل)' THEN 'المنظفات والمناديل'
      WHEN p.name ~ '(شيبسي|بسكويت|شوكولاتة|ويفر|كيك)' THEN 'الشيبسي والبسكويت والشوكولاتة'
      ELSE ''
    END
  LIMIT 1
)
WHERE p.section_id IS NULL
  AND p.catalog_key IS NULL
  AND EXISTS (
    SELECT 1 FROM public.stores s
    WHERE s.id = p.store_id AND s.category IN ('supermarkets', 'restaurants')
  );