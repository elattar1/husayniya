create table public.drivers (
  user_id uuid primary key,
  full_name text not null,
  phone text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.drivers to authenticated;
grant all on public.drivers to service_role;
alter table public.drivers enable row level security;

alter table public.orders add column driver_id uuid, add column picked_up_at timestamptz, add column delivered_at timestamptz;

create or replace function public.is_driver(_uid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.drivers where user_id = _uid and is_active)
$$;

create policy "drivers read" on public.drivers for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin')
    or exists (select 1 from public.orders o where o.driver_id = drivers.user_id and (o.customer_id = auth.uid() or public.is_store_owner(o.store_id))));

create policy "orders driver read" on public.orders for select to authenticated
  using (public.is_driver(auth.uid()) and (driver_id = auth.uid() or (driver_id is null and status in ('accepted','preparing'))));
create policy "order items driver read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and public.is_driver(auth.uid())
    and (o.driver_id = auth.uid() or (o.driver_id is null and o.status in ('accepted','preparing')))));

create or replace function public.orders_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare s text := new.status;
begin
  if public.has_role(auth.uid(),'admin') or auth.uid() is null then return new; end if;
  if current_setting('app.driver_action', true) = '1' then return new; end if;
  if public.is_store_owner(old.store_id) then
    if s not in ('pending','accepted','preparing','on_the_way','delivered','cancelled') then raise exception 'حالة غير صالحة'; end if;
    new := old; new.status := s;
    if s = 'delivered' then new.payment_status := 'paid_cash'; new.delivered_at := now(); end if;
    return new;
  end if;
  if old.customer_id = auth.uid() and s = 'cancelled' and old.status = 'pending' then
    new := old; new.status := 'cancelled'; return new;
  end if;
  raise exception 'غير مسموح';
end $$;

create or replace function public.driver_claim_order(_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_driver(auth.uid()) then raise exception 'غير مسموح'; end if;
  if exists (select 1 from public.orders where driver_id = auth.uid() and status = 'on_the_way') then
    raise exception 'أنهِ توصيل طلبك الحالي أولاً';
  end if;
  perform set_config('app.driver_action','1',true);
  update public.orders set driver_id = auth.uid(), status = 'on_the_way', picked_up_at = now()
    where id = _order_id and driver_id is null and status in ('accepted','preparing');
  if not found then raise exception 'الطلب لم يعد متاحاً'; end if;
  perform set_config('app.driver_action','',true);
end $$;

create or replace function public.driver_complete_order(_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_driver(auth.uid()) then raise exception 'غير مسموح'; end if;
  perform set_config('app.driver_action','1',true);
  update public.orders set status = 'delivered', payment_status = 'paid_cash', delivered_at = now()
    where id = _order_id and driver_id = auth.uid() and status = 'on_the_way';
  if not found then raise exception 'لا يمكن إنهاء هذا الطلب'; end if;
  perform set_config('app.driver_action','',true);
end $$;

create or replace function public.admin_save_driver(_email text, _full_name text, _phone text, _active boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare v uuid;
begin
  if not public.has_role(auth.uid(),'admin') then raise exception 'غير مسموح'; end if;
  select id into v from auth.users where lower(email) = lower(trim(_email));
  if v is null then raise exception 'لا يوجد حساب بهذا البريد، اطلب من الكابتن إنشاء حساب أولاً'; end if;
  insert into public.drivers (user_id, full_name, phone, is_active) values (v, _full_name, _phone, _active)
  on conflict (user_id) do update set full_name = excluded.full_name, phone = excluded.phone, is_active = excluded.is_active;
  return v;
end $$;

revoke execute on function public.driver_claim_order(uuid) from public, anon;
revoke execute on function public.driver_complete_order(uuid) from public, anon;
revoke execute on function public.admin_save_driver(text,text,text,boolean) from public, anon;
grant execute on function public.driver_claim_order(uuid) to authenticated;
grant execute on function public.driver_complete_order(uuid) to authenticated;
grant execute on function public.admin_save_driver(text,text,text,boolean) to authenticated;