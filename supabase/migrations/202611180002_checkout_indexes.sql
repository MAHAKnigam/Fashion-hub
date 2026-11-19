-- Fashion Hub: foreign-key and default-address indexes
-- Safe to apply after the initial schema migration.

create index if not exists products_category_id_idx
  on public.products(category_id);

create index if not exists addresses_user_id_idx
  on public.addresses(user_id);

create index if not exists order_items_order_id_idx
  on public.order_items(order_id);

create index if not exists order_items_product_id_idx
  on public.order_items(product_id);

-- A customer may save many addresses, but only one can be marked default.
-- Multiple non-default addresses remain allowed.
create unique index if not exists addresses_one_default_per_user_idx
  on public.addresses(user_id)
  where is_default = true;

-- Keep PostgREST/API privileges explicit; RLS remains the row-level boundary.
revoke all on table public.profiles, public.categories, public.products,
  public.addresses, public.orders, public.order_items, public.payments
  from anon, authenticated;

grant select on table public.categories, public.products to anon, authenticated;
grant select, insert, update, delete on table public.categories, public.products to authenticated;
grant select on table public.profiles, public.orders, public.order_items, public.payments to authenticated;
grant select, insert, update, delete on table public.addresses to authenticated;
grant update on table public.profiles to authenticated;

-- Security-definer helpers should only be callable by the roles that need them.
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
