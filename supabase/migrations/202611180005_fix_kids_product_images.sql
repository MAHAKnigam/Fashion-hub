-- Fix the two starter products whose image URLs were not loading.
-- Run this migration in the Supabase SQL Editor.

UPDATE public.products
SET image_url = 'https://www.hellyhansen.com/media/catalog/product/4/1/41774_698-1-onbody1.jpg'
WHERE legacy_id = 41
  AND name = 'Kids Winter Jacket';

UPDATE public.products
SET image_url = 'https://rukminim2.flixcart.com/image/612/612/xif0q/kids-apparel-combo/v/l/c/3-4-years-combo-3-t-hf11-alphabet-mars-infiniti-original-imagq59dhfeds3xj.jpeg?q=70'
WHERE legacy_id = 31
  AND name = 'Boys T-Shirt Set';
