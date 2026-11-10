-- 1. Create order_messages table
CREATE TABLE IF NOT EXISTS public.order_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  sender_id text NOT NULL,
  sender_role text NOT NULL CHECK (sender_role IN ('customer', 'store', 'driver', 'admin')),
  sender_name text NOT NULL,
  message text NOT NULL,
  stage text DEFAULT 'store',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.order_messages TO authenticated, anon;
GRANT ALL ON public.order_messages TO service_role;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_messages_read" ON public.order_messages;
CREATE POLICY "order_messages_read" ON public.order_messages
  FOR SELECT TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "order_messages_insert" ON public.order_messages;
CREATE POLICY "order_messages_insert" ON public.order_messages
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- 2. Update orders_guard() trigger to allow participants to update chat notes without tampering status or financials
CREATE OR REPLACE FUNCTION public.orders_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE s text := new.status;
BEGIN
  IF public.has_role(auth.uid(),'admin') OR auth.uid() IS NULL THEN RETURN new; END IF;
  IF current_setting('app.driver_action', true) = '1' THEN RETURN new; END IF;
  
  -- Allow participants to update order notes (for live chat sync) without changing status
  IF s = old.status AND (
    old.customer_id = auth.uid() OR
    old.driver_id = auth.uid() OR
    public.is_store_owner(old.store_id)
  ) THEN
    old.notes := new.notes;
    RETURN old;
  END IF;

  IF public.is_store_owner(old.store_id) THEN
    IF NOT ((old.status = 'pending' AND s IN ('accepted','cancelled'))
         OR (old.status = 'accepted' AND s IN ('preparing','cancelled'))) THEN
      RAISE EXCEPTION 'التوصيل وتسليم الطلب يتمان من خلال الدليفري فقط';
    END IF;
    new := old; new.status := s; RETURN new;
  END IF;

  IF old.customer_id = auth.uid() AND s = 'cancelled' AND old.status = 'pending' THEN
    new := old; new.status := 'cancelled'; RETURN new;
  END IF;

  RAISE EXCEPTION 'غير مسموح';
END $$;

-- 3. Security Definer RPC function to send order chat message and sync to notes safely
CREATE OR REPLACE FUNCTION public.send_order_chat(
  _order_id uuid,
  _sender_id text,
  _sender_name text,
  _sender_role text,
  _message text,
  _stage text DEFAULT 'store'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_notes text;
  v_new_msg jsonb;
  v_messages jsonb;
  v_clean_notes text;
  v_msg_id uuid := gen_random_uuid();
BEGIN
  SELECT id, status, notes, customer_id, driver_id, store_id
  INTO v_order
  FROM public.orders
  WHERE id = _order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'الطلب غير موجود';
  END IF;

  v_new_msg := jsonb_build_object(
    'id', v_msg_id::text,
    'order_id', _order_id::text,
    'sender_id', _sender_id,
    'sender_role', _sender_role,
    'sender_name', _sender_name,
    'message', _message,
    'stage', COALESCE(_stage, 'store'),
    'created_at', now()::text
  );

  -- Insert into order_messages table
  BEGIN
    INSERT INTO public.order_messages (id, order_id, sender_id, sender_role, sender_name, message, stage)
    VALUES (
      v_msg_id,
      _order_id,
      _sender_id,
      _sender_role,
      _sender_name,
      _message,
      COALESCE(_stage, 'store')
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Synchronize into orders.notes with <!-- CHAT_V1: [...] -->
  v_notes := COALESCE(v_order.notes, '');
  IF v_notes ~ '<!-- CHAT_V1: ([\s\S]*?) -->' THEN
    BEGIN
      v_messages := (substring(v_notes from '<!-- CHAT_V1: ([\s\S]*?) -->'))::jsonb || jsonb_build_array(v_new_msg);
      v_clean_notes := regexp_replace(v_notes, '<!-- CHAT_V1: [\s\S]*? -->', '');
      v_clean_notes := trim(v_clean_notes);
      IF length(v_clean_notes) > 0 THEN
        UPDATE public.orders SET notes = v_clean_notes || E'\n<!-- CHAT_V1: ' || v_messages::text || ' -->' WHERE id = _order_id;
      ELSE
        UPDATE public.orders SET notes = '<!-- CHAT_V1: ' || v_messages::text || ' -->' WHERE id = _order_id;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      UPDATE public.orders SET notes = v_notes || E'\n<!-- CHAT_V1: ' || jsonb_build_array(v_new_msg)::text || ' -->' WHERE id = _order_id;
    END;
  ELSE
    IF length(trim(v_notes)) > 0 THEN
      UPDATE public.orders SET notes = trim(v_notes) || E'\n<!-- CHAT_V1: ' || jsonb_build_array(v_new_msg)::text || ' -->' WHERE id = _order_id;
    ELSE
      UPDATE public.orders SET notes = '<!-- CHAT_V1: ' || jsonb_build_array(v_new_msg)::text || ' -->' WHERE id = _order_id;
    END IF;
  END IF;

  RETURN v_new_msg;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_order_chat(uuid, text, text, text, text, text) TO authenticated, anon;
