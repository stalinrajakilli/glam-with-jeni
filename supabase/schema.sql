-- GlamWithJeni database schema for Supabase (Postgres).
-- Run in the Supabase SQL editor, or save as a migration with the Supabase CLI.
--
-- Security model: one app, two roles. Every signed-in phone number gets a row in
-- `profiles` with role 'customer'; Jeni's number is promoted to 'admin' once:
--   update public.profiles set role = 'admin' where phone = '+919999999999';
-- Row-level security below is what actually protects admin actions — hiding
-- screens in the app is only for convenience.
-- Money is stored in paise (integer) to avoid rounding errors.

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  whatsapp_opt_in boolean not null default true,
  created_at timestamptz not null default now()
);

-- Create a profile automatically when someone signs in with their phone for the first time.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, phone) values (new.id, new.phone);
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.my_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------- catalogue
create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes int not null check (duration_minutes > 0),
  price_paise int not null check (price_paise >= 0),
  active boolean not null default true
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  shape text,
  price_paise int not null check (price_paise >= 0),
  image_path text,                -- in the public `product-images` bucket
  stock int not null default 0,
  active boolean not null default true
);

-- ---------------------------------------------------------------- offers
create table public.offers (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text not null default '',
  discount_type text not null check (discount_type in ('pct', 'flat')),
  discount_value int not null check (discount_value > 0),
  code text not null unique,
  valid_till date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint pct_max check (discount_type <> 'pct' or discount_value <= 90)
);

-- ---------------------------------------------------------------- bookings & orders
-- Customers never insert these directly: the verify-payment Edge Function (service role)
-- inserts them after checking the Razorpay signature, and recomputes amounts server-side.
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id),
  service_id uuid not null references public.services (id),
  starts_at timestamptz not null,
  notes text,
  offer_id uuid references public.offers (id) on delete set null,
  amount_paise int not null,
  status text not null default 'confirmed' check (status in ('confirmed', 'completed', 'cancelled')),
  razorpay_payment_id text,
  reminder_sent_at timestamptz,
  created_at timestamptz not null default now()
);
-- One artist: no two active bookings at the same start time.
create unique index bookings_one_per_slot on public.bookings (starts_at) where status <> 'cancelled';

create table public.orders (
  id bigint generated always as identity (start with 1045) primary key,
  customer_id uuid not null references public.profiles (id),
  address text not null,
  subtotal_paise int not null,
  discount_paise int not null default 0,
  total_paise int not null,
  offer_id uuid references public.offers (id) on delete set null,
  status text not null default 'paid' check (status in ('paid', 'shipped', 'delivered', 'cancelled')),
  razorpay_payment_id text,
  created_at timestamptz not null default now()
);

create table public.order_items (
  order_id bigint not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  qty int not null check (qty > 0),
  unit_price_paise int not null,
  primary key (order_id, product_id)
);

-- ---------------------------------------------------------------- chat & feedback
-- One thread per customer, keyed by customer_id. Photos live in the private
-- `chat-photos` bucket under <customer_id>/<uuid>.jpg.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id),
  body text,
  image_path text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  constraint has_content check (coalesce(length(body), 0) > 0 or image_path is not null)
);
create index messages_thread on public.messages (customer_id, created_at);

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  booking_id uuid references public.bookings (id) on delete set null,
  stars int not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table public.broadcasts (
  id uuid primary key default gen_random_uuid(),
  audience text not null,
  body text not null,
  image_path text,               -- in the private `broadcast-images` bucket
  template_name text not null,
  recipients int not null default 0,
  sent int not null default 0,
  failed int not null default 0,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- row-level security
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.products enable row level security;
alter table public.offers enable row level security;
alter table public.bookings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.messages enable row level security;
alter table public.feedback enable row level security;
alter table public.broadcasts enable row level security;

-- Admin can do everything on every table.
create policy admin_all on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.services for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.offers for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.bookings for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.orders for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.order_items for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.messages for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.feedback for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.broadcasts for all using (public.is_admin()) with check (public.is_admin());

-- Customers: their own profile (and they cannot change their role).
create policy own_profile_read on public.profiles for select using (id = auth.uid());
create policy own_profile_update on public.profiles for update using (id = auth.uid())
  with check (id = auth.uid() and role = public.my_role());

-- Customers: read the active catalogue and only live, unexpired offers.
create policy catalogue_read on public.services for select to authenticated using (active);
create policy catalogue_read on public.products for select to authenticated using (active);
create policy live_offers_read on public.offers for select to authenticated
  using (active and (valid_till is null or valid_till >= current_date));

-- Customers: read their own bookings and orders (inserted by Edge Functions only).
create policy own_bookings on public.bookings for select using (customer_id = auth.uid());
create policy own_orders on public.orders for select using (customer_id = auth.uid());
create policy own_order_items on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.customer_id = auth.uid()));

-- Customers: their own chat thread.
create policy own_thread_read on public.messages for select using (customer_id = auth.uid());
create policy own_thread_write on public.messages for insert
  with check (customer_id = auth.uid() and sender_id = auth.uid());

-- Customers: leave and read their own feedback.
create policy own_feedback_read on public.feedback for select using (customer_id = auth.uid());
create policy own_feedback_write on public.feedback for insert with check (customer_id = auth.uid());

-- Live chat updates.
alter publication supabase_realtime add table public.messages;

-- ---------------------------------------------------------------- storage
insert into storage.buckets (id, name, public) values
  ('chat-photos', 'chat-photos', false),
  ('broadcast-images', 'broadcast-images', false),
  ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- chat-photos: files under <customer_id>/... belong to that customer's thread.
create policy chat_photos_customer_read on storage.objects for select
  using (bucket_id = 'chat-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy chat_photos_customer_write on storage.objects for insert
  with check (bucket_id = 'chat-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy chat_photos_admin on storage.objects for all
  using (bucket_id in ('chat-photos', 'broadcast-images', 'product-images') and public.is_admin())
  with check (bucket_id in ('chat-photos', 'broadcast-images', 'product-images') and public.is_admin());
