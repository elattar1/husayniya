ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_qty integer;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS catalog_key text;
CREATE UNIQUE INDEX IF NOT EXISTS products_store_catalog_key ON public.products(store_id, catalog_key) WHERE catalog_key IS NOT NULL;
CREATE OR REPLACE FUNCTION public.products_validation() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.price < 0 THEN RAISE EXCEPTION 'السعر غير صالح'; END IF;
  IF NEW.stock_qty IS NOT NULL AND NEW.stock_qty < 0 THEN RAISE EXCEPTION 'الكمية غير صالحة'; END IF;
  IF NEW.image_url IS NOT NULL AND NEW.image_url !~ '^/catalog/[a-z]+\.jpg$' THEN RAISE EXCEPTION 'صورة غير صالحة'; END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS products_validation ON public.products;
CREATE TRIGGER products_validation BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.products_validation();