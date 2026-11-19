-- Fashion Hub: import the 41 starter products with INR retail prices.
-- Prices below are stored in paise (e.g. 59900 = ₹599.00).
-- Safe to rerun: legacy_id is unique and existing starter products are updated.

insert into public.products
  (legacy_id, name, slug, description, price_paise, image_url, category_id, category, sub_category, stock_quantity, is_active)
select
  v.legacy_id,
  v.name,
  lower(regexp_replace(v.name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || v.legacy_id,
  v.description,
  v.price_paise,
  v.image_url,
  c.id,
  v.category,
  v.sub_category,
  10,
  true
from (values
  (1, 'Casual Button-Down Shirt', 'Comfortable cotton shirt perfect for everyday wear.', 59900, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400', 'men', 'Shirts'),
  (2, 'Premium Cotton T-Shirt', 'Soft and comfortable crew neck t-shirt in multiple colors.', 49900, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', 'men', 'Shirts'),
  (3, 'Classic Polo Shirt', 'Elegant polo shirt for casual and semi-formal occasions.', 69900, 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400', 'men', 'Shirts'),
  (4, 'Slim Fit Denim Jeans', 'Modern slim fit jeans with premium denim quality.', 129900, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400', 'men', 'Pants'),
  (5, 'Formal Dress Pants', 'Professional dress pants with perfect tailoring.', 99900, 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400', 'men', 'Pants'),
  (6, 'Athletic Running Shorts', 'Lightweight shorts perfect for workouts.', 49900, 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400', 'men', 'Pants'),
  (7, 'Classic Navy Blazer', 'Elegant blazer suitable for business occasions.', 249900, 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400', 'men', 'Jackets'),
  (8, 'Leather Biker Jacket', 'Stylish genuine leather jacket for a bold look.', 299900, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400', 'men', 'Jackets'),
  (9, 'Wool Blend Sweater', 'Warm and cozy sweater perfect for winter.', 119900, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400', 'men', 'Jackets'),
  (10, 'Casual Hoodie', 'Comfortable pullover hoodie for everyday comfort.', 99900, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400', 'men', 'Jackets'),
  (11, 'Leather Dress Shoes', 'Classic leather shoes for formal occasions.', 179900, 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400', 'men', 'Shoes'),
  (12, 'Athletic Sneakers', 'Comfortable sneakers for everyday wear.', 149900, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'men', 'Shoes'),
  (13, 'Leather Belt', 'Genuine leather belt with classic buckle.', 49900, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'men', 'Accessories'),
  (14, 'Classic Watch', 'Elegant timepiece for every occasion.', 199900, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 'men', 'Accessories'),
  (15, 'Sunglasses', 'Stylish sunglasses for sun protection.', 39900, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400', 'men', 'Accessories'),
  (16, 'Floral Summer Dress', 'Light and breezy dress with beautiful floral print.', 99900, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400', 'women', 'Dresses'),
  (17, 'Elegant Evening Gown', 'Stunning floor-length gown for special occasions.', 249900, 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400', 'women', 'Dresses'),
  (18, 'Cocktail Party Dress', 'Perfect dress for parties and formal events.', 149900, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400', 'women', 'Dresses'),
  (19, 'Silk Blouse', 'Elegant silk blouse suitable for office wear.', 89900, 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400', 'women', 'Tops'),
  (20, 'Casual T-Shirt', 'Comfortable cotton t-shirt for everyday wear.', 49900, 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400', 'women', 'Tops'),
  (21, 'Crop Top', 'Trendy crop top for casual outings.', 39900, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400', 'women', 'Tops'),
  (22, 'High-Waist Jeans', 'Trendy high-waist jeans with perfect fit.', 119900, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400', 'women', 'Pants'),
  (23, 'Leggings', 'Comfortable and stretchy leggings.', 49900, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400', 'women', 'Pants'),
  (24, 'Palazzo Pants', 'Flowy palazzo pants for elegant looks.', 89900, 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400', 'women', 'Pants'),
  (25, 'Leather Heels', 'Elegant leather heels for formal occasions.', 149900, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'women', 'Shoes'),
  (26, 'Ballet Flats', 'Comfortable flats for everyday wear.', 99900, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'women', 'Shoes'),
  (27, 'Ankle Boots', 'Stylish boots for fall and winter.', 169900, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400', 'women', 'Shoes'),
  (28, 'Designer Handbag', 'Premium leather handbag with stylish design.', 199900, 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400', 'women', 'Accessories'),
  (29, 'Statement Necklace', 'Beautiful necklace to complete any outfit.', 39900, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400', 'women', 'Accessories'),
  (30, 'Scarf', 'Elegant scarf for all seasons.', 29900, 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400', 'women', 'Accessories'),
  (31, 'Boys T-Shirt Set', 'Pack of 3 comfortable cotton t-shirts.', 39900, 'https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=400', 'kids', 'Boys'),
  (32, 'Boys Denim Jeans', 'Durable denim jeans for active kids.', 69900, 'https://images.unsplash.com/photo-1519234939596-022d7d3a2986?w=400', 'kids', 'Boys'),
  (33, 'Boys Polo Shirt', 'Classic polo shirt in soft cotton.', 49900, 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400', 'kids', 'Boys'),
  (34, 'Boys Shorts Pack', 'Pack of 2 casual shorts for summer.', 59900, 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400', 'kids', 'Boys'),
  (35, 'Girls Floral Dress', 'Cute and colorful dress with floral pattern.', 79900, 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400', 'kids', 'Girls'),
  (36, 'Girls Leggings', 'Comfortable and stretchy leggings.', 39900, 'https://images.unsplash.com/photo-1519234939596-022d7d3a2f2?w=400', 'kids', 'Girls'),
  (37, 'Girls Skirt Set', 'Adorable skirt with matching bow set.', 69900, 'https://images.unsplash.com/photo-1519257624325-496c9e4c4c5a?w=400', 'kids', 'Girls'),
  (38, 'Kids Sneakers', 'Comfortable sneakers for active kids.', 99900, 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400', 'kids', 'Shoes'),
  (39, 'Kids Sandals', 'Comfortable sandals for summer.', 49900, 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400', 'kids', 'Shoes'),
  (40, 'Kids Cap', 'Cute cap for sun protection.', 29900, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400', 'kids', 'Accessories'),
  (41, 'Kids Winter Jacket', 'Warm and waterproof jacket.', 129900, 'https://images.unsplash.com/photo-1519234939596-022d7d3a2f21?w=400', 'kids', 'Accessories')
) as v(legacy_id, name, description, price_paise, image_url, category, sub_category)
join public.categories c on c.slug = v.category
on conflict (legacy_id) do update set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price_paise = excluded.price_paise,
  image_url = excluded.image_url,
  category_id = excluded.category_id,
  category = excluded.category,
  sub_category = excluded.sub_category,
  is_active = true;
