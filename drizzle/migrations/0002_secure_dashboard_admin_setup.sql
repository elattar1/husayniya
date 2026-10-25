CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(759321);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin') ON CONFLICT DO NOTHING;
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated, service_role;
CREATE OR REPLACE FUNCTION public.dashboard_store_validation()
RETURNS trigger LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  IF NEW.commission_rate < 0 OR NEW.commission_rate > 100 THEN RAISE EXCEPTION 'نسبة العمولة يجب أن تكون بين صفر ومائة'; END IF;
  IF NEW.delivery_fee < 0 OR NEW.booking_fee < 0 THEN RAISE EXCEPTION 'الرسوم لا يمكن أن تكون سالبة'; END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER dashboard_store_validation_trigger BEFORE INSERT OR UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.dashboard_store_validation();