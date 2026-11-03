ALTER TABLE public.stores ADD COLUMN IF NOT EXISTS logo_url text, ADD COLUMN IF NOT EXISTS banner_url text;
CREATE OR REPLACE FUNCTION public.products_validation() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.price < 0 THEN RAISE EXCEPTION 'السعر غير صالح'; END IF;
  IF NEW.stock_qty IS NOT NULL AND NEW.stock_qty < 0 THEN RAISE EXCEPTION 'الكمية غير صالحة'; END IF;
  IF NEW.image_url IS NOT NULL AND NEW.image_url !~ '^/catalog/[a-z]+\.jpg$' AND NEW.image_url !~ '^https://' THEN RAISE EXCEPTION 'صورة غير صالحة'; END IF;
  RETURN NEW;
END $$;
CREATE POLICY "store media own read" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'store-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "store media own insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'store-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "store media own update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'store-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "store media own delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'store-media' AND (storage.foldername(name))[1] = auth.uid()::text);