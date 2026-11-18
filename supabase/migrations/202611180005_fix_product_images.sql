-- Fashion Hub: correct images for products identified in the catalogue review.
-- Safe to rerun: updates by stable legacy_id, without changing product details.

update public.products
set image_url = 'https://includ.com/cdn/shop/files/37589f1e-cf18-4d17-9ec7-b5147ea4e075.webp?v=1778228060&width=800'
where legacy_id = 37
  and name = 'Girls Skirt Set';

update public.products
set image_url = 'https://resources.mandmdirect.com/Images/_default/c/r/3/cr31355_1_cloudzoom.jpg'
where legacy_id = 31
  and name = 'Boys T-Shirt Set';

update public.products
set image_url = 'https://www.childrensalon.com/media/catalog/product/m/o/monnalisa-girls-white-cotton-ruffle-dress-with-pink-floral-print-625205-5a42978269fff30fbf08acc5b7954dc0.jpg'
where legacy_id = 35
  and name = 'Girls Floral Dress';

update public.products
set image_url = 'https://ornamentum.it/cdn/shop/files/ORNAMENTUMFOULARDFOLIUM_2_1200x1200.png?v=1771936922'
where legacy_id = 30
  and name = 'Scarf';
