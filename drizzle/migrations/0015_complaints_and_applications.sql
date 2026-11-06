CREATE TABLE IF NOT EXISTS public.complaints_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  customer_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'complaint' CHECK (type IN ('complaint', 'suggestion', 'inquiry')),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'closed')),
  admin_reply text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.complaints_suggestions TO authenticated;
GRANT UPDATE ON public.complaints_suggestions TO authenticated;
GRANT ALL ON public.complaints_suggestions TO service_role;
ALTER TABLE public.complaints_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "complaints read" ON public.complaints_suggestions
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "complaints insert own" ON public.complaints_suggestions
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "complaints admin update" ON public.complaints_suggestions
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Driver applications
CREATE TABLE IF NOT EXISTS public.driver_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  vehicle_type text NOT NULL,
  national_id text,
  area_id integer REFERENCES public.areas(id),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.driver_applications TO authenticated;
GRANT ALL ON public.driver_applications TO service_role;
ALTER TABLE public.driver_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "driver apps read" ON public.driver_applications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "driver apps insert own" ON public.driver_applications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "driver apps admin update" ON public.driver_applications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Merchant applications
CREATE TABLE IF NOT EXISTS public.merchant_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  store_name text NOT NULL,
  category text NOT NULL REFERENCES public.categories(slug),
  area_id integer REFERENCES public.areas(id),
  phone text NOT NULL,
  address text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.merchant_applications TO authenticated;
GRANT ALL ON public.merchant_applications TO service_role;
ALTER TABLE public.merchant_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "merchant apps read" ON public.merchant_applications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "merchant apps insert own" ON public.merchant_applications
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "merchant apps admin update" ON public.merchant_applications
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
