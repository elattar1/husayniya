
-- ROLES & PROFILES
create type public.app_role as enum ('admin','provider','customer');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "own roles or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile read" on public.profiles for select to authenticated
  using (id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own profile update" on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated
  with check (id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''), new.raw_user_meta_data->>'phone');
  insert into public.user_roles (user_id, role) values (new.id, 'customer');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- First signed-in user may claim admin only if no admin exists yet
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return false; end if;
  if exists (select 1 from public.user_roles where role = 'admin') then return false; end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin') on conflict do nothing;
  return true;
end $$;
revoke execute on function public.claim_first_admin() from anon;

-- CATALOG
create table public.categories (
  slug text primary key,
  name text not null,
  kind text not null default 'shop', -- shop | doctor | service
  sort int not null default 0
);
grant select on public.categories to anon, authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "categories public" on public.categories for select using (true);

create table public.areas (
  id serial primary key,
  name text not null
);
grant select on public.areas to anon, authenticated;
grant all on public.areas to service_role;
alter table public.areas enable row level security;
create policy "areas public" on public.areas for select using (true);

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,
  category text not null references public.categories(slug),
  area_id int references public.areas(id),
  name text not null,
  description text not null default '',
  phone text,
  address text not null default '',
  specialty text,
  booking_fee numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  commission_rate numeric(5,2) not null default 10,
  rating numeric(3,2) not null default 0,
  reviews_count int not null default 0,
  is_active boolean not null default false,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.stores to anon;
grant select, insert, update on public.stores to authenticated;
grant all on public.stores to service_role;
alter table public.stores enable row level security;
create policy "stores read" on public.stores for select
  using (is_active or owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "stores insert own" on public.stores for insert to authenticated
  with check (owner_id = auth.uid());
create policy "stores update" on public.stores for update to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.stores_guard()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if public.has_role(auth.uid(),'admin') or auth.uid() is null then return new; end if;
  if tg_op = 'INSERT' then
    new.is_active := false; new.commission_rate := 10; new.rating := 0; new.reviews_count := 0;
  else
    new.is_active := old.is_active; new.commission_rate := old.commission_rate;
    new.rating := old.rating; new.reviews_count := old.reviews_count; new.owner_id := old.owner_id;
  end if;
  return new;
end $$;
create trigger stores_guard before insert or update on public.stores
  for each row execute function public.stores_guard();

create or replace function public.is_store_owner(_store_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.stores where id = _store_id and owner_id = auth.uid())
$$;

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "products read" on public.products for select using (true);
create policy "products owner write" on public.products for all to authenticated
  using (public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'))
  with check (public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'));

-- ORDERS
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id),
  customer_id uuid not null,
  status text not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  commission_amount numeric(10,2) not null default 0,
  address text not null,
  area_id int references public.areas(id),
  phone text not null,
  notes text,
  payment_method text not null default 'cash',
  payment_status text not null default 'unpaid',
  payment_ref text,
  created_at timestamptz not null default now()
);
grant select, update on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;
create policy "orders read" on public.orders for select to authenticated
  using (customer_id = auth.uid() or public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'));
create policy "orders update" on public.orders for update to authenticated
  using (customer_id = auth.uid() or public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'));

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid,
  name text not null,
  price numeric(10,2) not null,
  qty int not null
);
grant select on public.order_items to authenticated;
grant all on public.order_items to service_role;
alter table public.order_items enable row level security;
create policy "order items read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and
    (o.customer_id = auth.uid() or public.is_store_owner(o.store_id) or public.has_role(auth.uid(),'admin'))));

create or replace function public.place_order(_store_id uuid, _items jsonb, _address text, _phone text, _notes text, _area_id int)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_store public.stores; v_sub numeric := 0; v_id uuid; it jsonb; p public.products; q int;
begin
  if auth.uid() is null then raise exception 'يجب تسجيل الدخول'; end if;
  if coalesce(trim(_address),'') = '' or coalesce(trim(_phone),'') = '' then raise exception 'العنوان ورقم الهاتف مطلوبان'; end if;
  select * into v_store from public.stores where id = _store_id and is_active;
  if not found then raise exception 'المحل غير متاح'; end if;
  if jsonb_array_length(_items) = 0 then raise exception 'السلة فارغة'; end if;
  for it in select * from jsonb_array_elements(_items) loop
    select * into p from public.products where id = (it->>'product_id')::uuid and store_id = _store_id and is_available;
    if not found then raise exception 'منتج غير متاح'; end if;
    q := greatest(1, least(99, (it->>'qty')::int));
    v_sub := v_sub + p.price * q;
  end loop;
  insert into public.orders (store_id, customer_id, subtotal, delivery_fee, total, commission_amount, address, area_id, phone, notes)
  values (_store_id, auth.uid(), v_sub, v_store.delivery_fee, v_sub + v_store.delivery_fee,
          round(v_sub * v_store.commission_rate / 100, 2), _address, _area_id, _phone, _notes)
  returning id into v_id;
  for it in select * from jsonb_array_elements(_items) loop
    select * into p from public.products where id = (it->>'product_id')::uuid;
    q := greatest(1, least(99, (it->>'qty')::int));
    insert into public.order_items (order_id, product_id, name, price, qty) values (v_id, p.id, p.name, p.price, q);
  end loop;
  return v_id;
end $$;
revoke execute on function public.place_order(uuid, jsonb, text, text, text, int) from anon;

create or replace function public.orders_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare s text := new.status;
begin
  if public.has_role(auth.uid(),'admin') or auth.uid() is null then return new; end if;
  if public.is_store_owner(old.store_id) then
    if s not in ('pending','accepted','preparing','on_the_way','delivered','cancelled') then raise exception 'حالة غير صالحة'; end if;
    new := old; new.status := s;
    if s = 'delivered' then new.payment_status := 'paid_cash'; end if;
    return new;
  end if;
  if old.customer_id = auth.uid() and s = 'cancelled' and old.status = 'pending' then
    new := old; new.status := 'cancelled'; return new;
  end if;
  raise exception 'غير مسموح';
end $$;
create trigger orders_guard before update on public.orders for each row execute function public.orders_guard();

-- BOOKINGS (doctors)
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id),
  customer_id uuid not null,
  booking_date date not null,
  booking_time text not null,
  patient_name text not null,
  phone text not null,
  notes text,
  status text not null default 'pending',
  fee numeric(10,2) not null default 0,
  commission_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.bookings to authenticated;
grant all on public.bookings to service_role;
alter table public.bookings enable row level security;
create policy "bookings read" on public.bookings for select to authenticated
  using (customer_id = auth.uid() or public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'));
create policy "bookings insert" on public.bookings for insert to authenticated
  with check (customer_id = auth.uid());
create policy "bookings update" on public.bookings for update to authenticated
  using (customer_id = auth.uid() or public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'));

create or replace function public.bookings_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare s text := new.status; v public.stores;
begin
  if tg_op = 'INSERT' then
    select * into v from public.stores where id = new.store_id and is_active;
    if not found then raise exception 'الطبيب غير متاح'; end if;
    if new.booking_date < current_date then raise exception 'لا يمكن الحجز في تاريخ سابق'; end if;
    new.status := 'pending'; new.fee := v.booking_fee;
    new.commission_amount := round(v.booking_fee * v.commission_rate / 100, 2);
    return new;
  end if;
  if public.has_role(auth.uid(),'admin') or auth.uid() is null then return new; end if;
  if public.is_store_owner(old.store_id) then
    if s not in ('pending','confirmed','completed','cancelled') then raise exception 'حالة غير صالحة'; end if;
    new := old; new.status := s; return new;
  end if;
  if old.customer_id = auth.uid() and s = 'cancelled' and old.status in ('pending','confirmed') then
    new := old; new.status := 'cancelled'; return new;
  end if;
  raise exception 'غير مسموح';
end $$;
create trigger bookings_guard before insert or update on public.bookings for each row execute function public.bookings_guard();

-- SERVICE REQUESTS (home services with photos)
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id),
  customer_id uuid not null,
  description text not null,
  address text not null,
  area_id int references public.areas(id),
  phone text not null,
  preferred_date date,
  image_paths text[] not null default '{}',
  status text not null default 'pending',
  quoted_price numeric(10,2),
  commission_amount numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.service_requests to authenticated;
grant all on public.service_requests to service_role;
alter table public.service_requests enable row level security;
create policy "sr read" on public.service_requests for select to authenticated
  using (customer_id = auth.uid() or public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'));
create policy "sr insert" on public.service_requests for insert to authenticated
  with check (customer_id = auth.uid());
create policy "sr update" on public.service_requests for update to authenticated
  using (customer_id = auth.uid() or public.is_store_owner(store_id) or public.has_role(auth.uid(),'admin'));

create or replace function public.sr_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare s text := new.status; qp numeric := new.quoted_price; rate numeric;
begin
  if tg_op = 'INSERT' then
    if not exists (select 1 from public.stores where id = new.store_id and is_active) then raise exception 'مقدم الخدمة غير متاح'; end if;
    new.status := 'pending'; new.quoted_price := null; new.commission_amount := 0; return new;
  end if;
  if not (public.has_role(auth.uid(),'admin') or auth.uid() is null) then
    if public.is_store_owner(old.store_id) then
      if s not in ('pending','accepted','in_progress','completed','cancelled') then raise exception 'حالة غير صالحة'; end if;
      new := old; new.status := s; new.quoted_price := qp;
    elsif old.customer_id = auth.uid() and s = 'cancelled' and old.status in ('pending','accepted') then
      new := old; new.status := 'cancelled';
    else
      raise exception 'غير مسموح';
    end if;
  end if;
  select commission_rate into rate from public.stores where id = new.store_id;
  new.commission_amount := case when new.status = 'completed' then round(coalesce(new.quoted_price,0) * rate / 100, 2) else 0 end;
  return new;
end $$;
create trigger sr_guard before insert or update on public.service_requests for each row execute function public.sr_guard();

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  body text not null default '',
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notif own read" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notif own update" on public.notifications for update to authenticated using (user_id = auth.uid());
create policy "notif own delete" on public.notifications for delete to authenticated using (user_id = auth.uid());

create or replace function public.status_label(_s text) returns text language sql immutable as $$
  select case _s when 'pending' then 'قيد الانتظار' when 'accepted' then 'تم القبول' when 'preparing' then 'جاري التجهيز'
    when 'on_the_way' then 'في الطريق' when 'delivered' then 'تم التوصيل' when 'cancelled' then 'ملغي'
    when 'confirmed' then 'مؤكد' when 'completed' then 'مكتمل' when 'in_progress' then 'جاري التنفيذ' else _s end
$$;

create or replace function public.notify_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_owner uuid; v_name text; kind text;
begin
  select owner_id, name into v_owner, v_name from public.stores where id = new.store_id;
  kind := case tg_table_name when 'orders' then 'طلب' when 'bookings' then 'حجز' else 'طلب خدمة' end;
  if tg_op = 'INSERT' then
    if v_owner is not null then
      insert into public.notifications (user_id, title, body, link)
      values (v_owner, kind || ' جديد', 'لديك ' || kind || ' جديد في ' || v_name, '/provider');
    end if;
  elsif new.status is distinct from old.status then
    insert into public.notifications (user_id, title, body, link)
    values (new.customer_id, 'تحديث ' || kind, kind || 'ك من ' || v_name || ' أصبح: ' || public.status_label(new.status), '/orders');
    if v_owner is not null and auth.uid() = new.customer_id then
      insert into public.notifications (user_id, title, body, link)
      values (v_owner, 'إلغاء ' || kind, 'قام العميل بإلغاء ' || kind || ' في ' || v_name, '/provider');
    end if;
  end if;
  return new;
end $$;
create trigger orders_notify after insert or update on public.orders for each row execute function public.notify_change();
create trigger bookings_notify after insert or update on public.bookings for each row execute function public.notify_change();
create trigger sr_notify after insert or update on public.service_requests for each row execute function public.notify_change();

-- REVIEWS
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null,
  author_name text not null default 'عميل',
  rating int not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "reviews public" on public.reviews for select using (true);
create policy "reviews insert own" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "reviews update own" on public.reviews for update to authenticated using (user_id = auth.uid());
create policy "reviews delete own or admin" on public.reviews for delete to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.refresh_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare sid uuid := coalesce(new.store_id, old.store_id);
begin
  update public.stores set
    rating = coalesce((select round(avg(rating)::numeric, 2) from public.reviews where store_id = sid), 0),
    reviews_count = (select count(*) from public.reviews where store_id = sid)
  where id = sid;
  return null;
end $$;
create trigger reviews_rating after insert or update or delete on public.reviews for each row execute function public.refresh_rating();

-- SEED
insert into public.categories (slug, name, kind, sort) values
 ('restaurants','المطاعم والكافيهات','shop',1),
 ('supermarkets','السوبر ماركت','shop',2),
 ('pharmacies','الصيدليات','shop',3),
 ('doctors','حجز الأطباء','doctor',4),
 ('maintenance','سباكة ونجارة وكهرباء وصيانة','service',5),
 ('gifts','الملابس والهدايا','shop',6),
 ('home','الخدمات المنزلية','service',7);

insert into public.areas (name) values
 ('الحسينية - وسط البلد'),('منشأة أبو عمر'),('سماكين الشرق'),('الحلمية'),('بني هلال'),('الصالحية الجديدة');

insert into public.stores (id, category, area_id, name, description, phone, address, specialty, booking_fee, delivery_fee, rating, reviews_count, is_active) values
 ('11111111-0000-0000-0000-000000000001','restaurants',1,'مطعم أبو حسين للمشويات (تجريبي)','مشويات وكفتة وطواجن على الفحم','01000000001','شارع الجمهورية',null,0,15,4.6,0,true),
 ('11111111-0000-0000-0000-000000000002','restaurants',2,'كافيه النخيل (تجريبي)','مشروبات ساخنة وباردة وحلويات','01000000002','ميدان منشأة أبو عمر',null,0,10,4.3,0,true),
 ('11111111-0000-0000-0000-000000000003','supermarkets',1,'سوبر ماركت الأمانة (تجريبي)','بقالة ومنظفات وخضار','01000000003','شارع المحطة',null,0,10,4.5,0,true),
 ('11111111-0000-0000-0000-000000000004','supermarkets',3,'هايبر الشرقية (تجريبي)','كل احتياجات البيت بأسعار الجملة','01000000004','طريق سماكين',null,0,20,4.1,0,true),
 ('11111111-0000-0000-0000-000000000005','pharmacies',1,'صيدلية د. منى (تجريبي)','أدوية ومستلزمات طبية وتجميل - 24 ساعة','01000000005','بجوار مستشفى الحسينية',null,0,5,4.8,0,true),
 ('11111111-0000-0000-0000-000000000006','pharmacies',4,'صيدلية الشفاء (تجريبي)','أدوية وأجهزة قياس','01000000006','شارع الحلمية الرئيسي',null,0,10,4.4,0,true),
 ('11111111-0000-0000-0000-000000000007','doctors',1,'د. أحمد السيد - أطفال (تجريبي)','استشاري طب الأطفال وحديثي الولادة','01000000007','عيادة برج النور - الدور الثاني','أطفال',150,0,4.9,0,true),
 ('11111111-0000-0000-0000-000000000008','doctors',1,'د. سارة محمود - أسنان (تجريبي)','حشو وتقويم وتجميل أسنان','01000000008','شارع الجمهورية','أسنان',200,0,4.7,0,true),
 ('11111111-0000-0000-0000-000000000009','doctors',5,'د. خالد عبد الله - باطنة (تجريبي)','باطنة وسكر وضغط','01000000009','بني هلال - أمام المسجد الكبير','باطنة',120,0,4.5,0,true),
 ('11111111-0000-0000-0000-000000000010','maintenance',1,'الأسطى محمود للسباكة (تجريبي)','تركيب وصيانة سباكة وسخانات','01000000010','الحسينية','سباكة',0,0,4.6,0,true),
 ('11111111-0000-0000-0000-000000000011','maintenance',2,'ورشة الحاج سعيد للنجارة (تجريبي)','نجارة موبيليا ومطابخ وأبواب','01000000011','منشأة أبو عمر','نجارة',0,0,4.4,0,true),
 ('11111111-0000-0000-0000-000000000012','maintenance',1,'كهربائي محمد علي (تجريبي)','تأسيس وصيانة كهرباء منازل','01000000012','الحسينية','كهرباء',0,0,4.7,0,true),
 ('11111111-0000-0000-0000-000000000013','gifts',1,'بوتيك ليالي (تجريبي)','ملابس حريمي وأطفال','01000000013','شارع السوق',null,0,15,4.2,0,true),
 ('11111111-0000-0000-0000-000000000014','gifts',1,'هدايا الورد (تجريبي)','بوكيهات وهدايا مناسبات','01000000014','ميدان الحسينية',null,0,15,4.6,0,true),
 ('11111111-0000-0000-0000-000000000015','home',1,'نظافة بلس (تجريبي)','تنظيف شقق وسجاد ومكافحة حشرات','01000000015','الحسينية','تنظيف',0,0,4.3,0,true);

insert into public.products (store_id, name, description, price) values
 ('11111111-0000-0000-0000-000000000001','نص كيلو كفتة','مع عيش وسلطات وطحينة',140),
 ('11111111-0000-0000-0000-000000000001','ربع فرخة مشوية','مع أرز وسلطة',95),
 ('11111111-0000-0000-0000-000000000001','طاجن بامية باللحمة','',110),
 ('11111111-0000-0000-0000-000000000002','قهوة تركي','',30),
 ('11111111-0000-0000-0000-000000000002','عصير مانجو فريش','',45),
 ('11111111-0000-0000-0000-000000000002','وافل نوتيلا','',70),
 ('11111111-0000-0000-0000-000000000003','أرز مصري 1 كيلو','',38),
 ('11111111-0000-0000-0000-000000000003','زيت عباد الشمس 1 لتر','',85),
 ('11111111-0000-0000-0000-000000000003','سكر 1 كيلو','',36),
 ('11111111-0000-0000-0000-000000000003','لبن كامل الدسم 1 لتر','',42),
 ('11111111-0000-0000-0000-000000000004','كرتونة بيض 30','',165),
 ('11111111-0000-0000-0000-000000000004','مسحوق غسيل 2.5 كيلو','',190),
 ('11111111-0000-0000-0000-000000000005','بانادول إكسترا','شريط 12 قرص',45),
 ('11111111-0000-0000-0000-000000000005','جهاز قياس ضغط ديجيتال','',850),
 ('11111111-0000-0000-0000-000000000005','كمامات طبية (50 قطعة)','',60),
 ('11111111-0000-0000-0000-000000000006','فيتامين سي 1000','',95),
 ('11111111-0000-0000-0000-000000000006','شريط قياس سكر (50)','',320),
 ('11111111-0000-0000-0000-000000000013','عباية سوداء','مقاسات متعددة',650),
 ('11111111-0000-0000-0000-000000000013','طقم أطفال قطن','',280),
 ('11111111-0000-0000-0000-000000000014','بوكيه ورد طبيعي','',350),
 ('11111111-0000-0000-0000-000000000014','صندوق هدايا شوكولاتة','',420);
