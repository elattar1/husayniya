DROP INDEX IF EXISTS public.products_store_catalog_key;
ALTER TABLE public.products ADD CONSTRAINT products_store_catalog_key UNIQUE (store_id, catalog_key);