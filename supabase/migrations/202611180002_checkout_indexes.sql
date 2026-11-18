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
