-- Atomic inventory reservations for concurrent checkout attempts.
-- Stock is deducted when checkout begins and restored when payment fails or a
-- reservation expires. A captured payment commits the reservation permanently.

alter table public.orders
  add column if not exists inventory_issue boolean not null default false;

create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  status text not null default 'reserved'
    check (status in ('reserved', 'committed', 'released', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, product_id)
);

create index if not exists stock_reservations_expiry_idx
  on public.stock_reservations(status, expires_at);

alter table public.stock_reservations enable row level security;
revoke all on table public.stock_reservations from anon, authenticated;
grant all on table public.stock_reservations to service_role;

-- Release stale reservations whenever a new checkout starts. The function is
-- also safe to call repeatedly; only rows still in "reserved" are restored.
create or replace function public.expire_stock_reservations()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation record;
  v_count integer := 0;
begin
  for v_reservation in
    select sr.id, sr.product_id, sr.quantity
    from public.stock_reservations sr
    join public.orders o on o.id = sr.order_id
    left join public.payments p on p.order_id = sr.order_id
    where sr.status = 'reserved'
      and sr.expires_at <= now()
      and o.status in ('pending_payment', 'payment_failed')
      and coalesce(p.status, 'created') in ('created', 'authorized', 'failed')
    order by sr.product_id
    for update of sr skip locked
  loop
    update public.products
      set stock_quantity = stock_quantity + v_reservation.quantity,
          updated_at = now()
      where id = v_reservation.product_id;

    update public.stock_reservations
      set status = 'expired', updated_at = now()
      where id = v_reservation.id and status = 'reserved';
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- Atomically reserve every requested product or roll back the entire function.
create or replace function public.reserve_order_stock(
  p_order_id uuid,
  p_items jsonb,
  p_expires_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item record;
  v_updated integer;
begin
  if p_expires_at <= now() or p_expires_at > now() + interval '1 hour' then
    raise exception 'Invalid stock reservation expiry';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one stock item is required';
  end if;

  perform public.expire_stock_reservations();

  for v_item in
    select product_id, sum(quantity)::integer as quantity
    from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer)
    group by product_id
    order by product_id
  loop
    if v_item.product_id is null or v_item.quantity is null or v_item.quantity < 1 then
      raise exception 'Invalid stock reservation item';
    end if;

    update public.products
      set stock_quantity = stock_quantity - v_item.quantity,
          updated_at = now()
      where id = v_item.product_id
        and is_active = true
        and stock_quantity >= v_item.quantity;
    get diagnostics v_updated = row_count;

    if v_updated <> 1 then
      raise exception 'Insufficient stock for product %', v_item.product_id;
    end if;

    insert into public.stock_reservations(order_id, product_id, quantity, expires_at)
    values (p_order_id, v_item.product_id, v_item.quantity, p_expires_at);
  end loop;
end;
$$;

-- Return stock for failed/cancelled checkout attempts. Committed stock is never
-- restored by this routine.
create or replace function public.release_order_stock(p_order_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation record;
  v_count integer := 0;
begin
  for v_reservation in
    select id, product_id, quantity
    from public.stock_reservations
    where order_id = p_order_id and status = 'reserved'
    order by product_id
    for update
  loop
    update public.products
      set stock_quantity = stock_quantity + v_reservation.quantity,
          updated_at = now()
      where id = v_reservation.product_id;

    update public.stock_reservations
      set status = 'released', updated_at = now()
      where id = v_reservation.id and status = 'reserved';
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- Commit a reservation after gateway capture. If a late capture arrives after
-- expiry/release, try to reserve the units again. Return false if stock is no
-- longer available so the order can be flagged for manual fulfilment review.
create or replace function public.confirm_order_stock(p_order_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation record;
  v_stock integer;
begin
  perform 1
    from public.stock_reservations
    where order_id = p_order_id
    order by product_id
    for update;

  if not exists (
    select 1 from public.stock_reservations where order_id = p_order_id
  ) then
    return false;
  end if;

  for v_reservation in
    select product_id, quantity
    from public.stock_reservations
    where order_id = p_order_id and status in ('expired', 'released')
    order by product_id
  loop
    select stock_quantity into v_stock
      from public.products
      where id = v_reservation.product_id
      for update;
    if not found or v_stock < v_reservation.quantity then
      return false;
    end if;
  end loop;

  for v_reservation in
    select product_id, quantity
    from public.stock_reservations
    where order_id = p_order_id and status in ('expired', 'released')
    order by product_id
  loop
    update public.products
      set stock_quantity = stock_quantity - v_reservation.quantity,
          updated_at = now()
      where id = v_reservation.product_id;
  end loop;

  update public.stock_reservations
    set status = 'committed', updated_at = now()
    where order_id = p_order_id
      and status in ('reserved', 'expired', 'released');
  return true;
end;
$$;

revoke all on function public.expire_stock_reservations() from public, anon, authenticated;
revoke all on function public.reserve_order_stock(uuid, jsonb, timestamptz) from public, anon, authenticated;
revoke all on function public.release_order_stock(uuid) from public, anon, authenticated;
revoke all on function public.confirm_order_stock(uuid) from public, anon, authenticated;
grant execute on function public.expire_stock_reservations() to service_role;
grant execute on function public.reserve_order_stock(uuid, jsonb, timestamptz) to service_role;
grant execute on function public.release_order_stock(uuid) to service_role;
grant execute on function public.confirm_order_stock(uuid) to service_role;
