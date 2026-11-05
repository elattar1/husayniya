CREATE TABLE public.customer_push_devices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 token text NOT NULL,
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id, token)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_push_devices TO authenticated;
GRANT ALL ON public.customer_push_devices TO service_role;
ALTER TABLE public.customer_push_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Customers manage own push devices" ON public.customer_push_devices FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());