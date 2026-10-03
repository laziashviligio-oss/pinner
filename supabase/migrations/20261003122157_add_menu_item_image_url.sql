/*
# Add image_url column to menu_items

1. Modified Tables
- `menu_items`: adds `image_url` (text, nullable) so managers can attach a photo to each menu item.

2. Security
- No policy changes needed — existing anon+authenticated CRUD policies already cover the new column.

3. Notes
- Column is nullable so existing menu items without images are unaffected.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'menu_items' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE menu_items ADD COLUMN image_url text;
  END IF;
END $$;
