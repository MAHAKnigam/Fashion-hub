-- Fashion Hub: initial commerce schema
-- All monetary values are stored as integer paise (INR).

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  legacy_id integer unique,
  name text not null,
  slug text not null unique,
  description text not null default '',
  price_paise bigint not null check (price_paise >= 0),
  image_url text,
  category_id uuid references public.categories(id) on delete set null,
  category text not null check (category in ('men', 'women', 'kids')),
  sub_category text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_active_idx on public.products(category, is_active);
create index if not exists products_created_at_idx on public.products(created_at desc);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed', 'refunded')),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  subtotal_paise bigint not null check (subtotal_paise >= 0),
  shipping_paise bigint not null default 0 check (shipping_paise >= 0),
  total_paise bigint not null check (total_paise = subtotal_paise + shipping_paise),
  shipping_address jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_created_idx on public.orders(user_id, created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_paise bigint not null check (unit_price_paise >= 0),
  quantity integer not null check (quantity > 0),
  line_total_paise bigint not null check (line_total_paise = unit_price_paise * quantity)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  provider text not null default 'razorpay' check (provider = 'razorpay'),
  gateway_order_id text unique,
  gateway_payment_id text unique,
  amount_paise bigint not null check (amount_paise >= 0),
  currency char(3) not null default 'INR' check (currency = 'INR'),
  status text not null default 'created' check (status in ('created', 'authorized', 'captured', 'failed', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create a profile for every newly registered Supabase Auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Role checks are performed against the database profile, never localStorage.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

create policy "Users can read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Users can update safe profile fields" on public.profiles
  for update to authenticated using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = 'customer');
-- Admin role changes must be performed by a trusted operator in the dashboard.

create policy "Categories are public read" on public.categories
  for select to anon, authenticated using (true);
create policy "Admins manage categories" on public.categories
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Active products are public read" on public.products
  for select to anon, authenticated using (is_active = true or (select public.is_admin()));
create policy "Admins manage products" on public.products
  for all to authenticated using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Users manage own addresses" on public.addresses
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users read own orders" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Admins read all orders" on public.orders
  for select to authenticated using ((select public.is_admin()));

create policy "Users read own order items" on public.order_items
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );
create policy "Admins read all order items" on public.order_items
  for select to authenticated using ((select public.is_admin()));

create policy "Users read own payments" on public.payments
  for select to authenticated using (
    exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid()))
  );
create policy "Admins read all payments" on public.payments
  for select to authenticated using ((select public.is_admin()));

-- Deliberately no client insert/update policies for orders, order_items, or payments.
-- Trusted Edge Functions use the service role to create and verify payments.
