create or replace function public.orders_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare s text := new.status;
begin
  if public.has_role(auth.uid(),'admin') or auth.uid() is null then return new; end if;
  if current_setting('app.driver_action', true) = '1' then return new; end if;
  if public.is_store_owner(old.store_id) then
    if s = old.status then new := old; return new; end if;
    if not ((old.status = 'pending' and s in ('accepted','cancelled'))
         or (old.status = 'accepted' and s in ('preparing','cancelled'))) then
      raise exception 'التوصيل وتسليم الطلب يتمان من خلال الدليفري فقط';
    end if;
    new := old; new.status := s; return new;
  end if;
  if old.customer_id = auth.uid() and s = 'cancelled' and old.status = 'pending' then
    new := old; new.status := 'cancelled'; return new;
  end if;
  raise exception 'غير مسموح';
end $$;

create or replace function public.driver_claim_order(_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.drivers where user_id = auth.uid() and is_active) then raise exception 'غير مسموح'; end if;
  if exists (select 1 from public.orders where driver_id = auth.uid() and status = 'on_the_way') then
    raise exception 'أنهِ توصيل طلبك الحالي أولاً';
  end if;
  perform set_config('app.driver_action','1',true);
  update public.orders set driver_id = auth.uid(), status = 'on_the_way', picked_up_at = now()
    where id = _order_id and driver_id is null and status = 'preparing';
  if not found then raise exception 'الطلب لم يعد متاحاً'; end if;
  perform set_config('app.driver_action','',true);
end $$;