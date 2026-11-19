-- Fashion Hub: seed the three main product categories.
-- Safe to run more than once because slug is unique.
insert into public.categories (name, slug)
values
  ('Men', 'men'),
  ('Women', 'women'),
  ('Kids', 'kids')
on conflict (slug) do update
set name = excluded.name;
