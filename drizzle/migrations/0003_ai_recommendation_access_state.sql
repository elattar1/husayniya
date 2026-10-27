CREATE TABLE public.ai_recommendation_access_state (id text PRIMARY KEY, status integer NOT NULL DEFAULT 403, message text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.ai_recommendation_access_state TO service_role;
REVOKE ALL ON public.ai_recommendation_access_state FROM anon, authenticated;
ALTER TABLE public.ai_recommendation_access_state ENABLE ROW LEVEL SECURITY;