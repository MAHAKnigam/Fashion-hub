-- Correct missing and mismatched starter product images.
-- Safe to rerun: only image_url is changed for the listed legacy product IDs.

update public.products as p
set image_url = v.image_url
from (values
  (17, 'https://fulmo-img-server.com/modely/5434da3d30cc48078c18c27cf36dc993.jpg'),
  (28, 'https://poelle.com/cdn/shop/articles/featured-luxury-leather-handbags-materials-craftsmanship-and-how-to-evaluate-quality.png?v=1775128436&width=2048'),
  (31, 'https://resources.mandmdirect.com/Images/_default/c/r/3/cr30975_1_cloudzoom.jpg'),
  (32, 'https://znbeyond.com/cdn/shop/files/2_7405e75b-7e98-4dea-918e-da7b536a0778.jpg?v=1759131307&width=600'),
  (36, 'https://www.mightly.com/cdn/shop/files/3LG001-BR_1_0bf2172c-40f5-4359-aa0f-b7b5d52da12c.jpg?v=1755661379&width=4200'),
  (41, 'https://kuoma.fi/cdn/shop/products/9-642-04-peruskuva-Hugo_T_Sin___Punainen_1024x1024.jpg?v=1666003435')
) as v(legacy_id, image_url)
where p.legacy_id = v.legacy_id;

-- Verify the six corrected records.
select legacy_id, name, image_url
from public.products
where legacy_id in (17, 28, 31, 32, 36, 41)
order by legacy_id;
