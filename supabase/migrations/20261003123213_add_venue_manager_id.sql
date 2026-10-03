/*
# Add manager_id column to venues

1. Modified Tables
- `venues`: adds `manager_id` (text, nullable) so a venue can be linked to the user who created it.
  Stored as a string identifier (localStorage profile name or auth user id) so it works with or without auth.

2. Security
- No policy changes needed — existing anon+authenticated CRUD policies already cover the new column.

3. Notes
- Column is nullable so existing venues are unaffected.
- When a new venue is created from the manager dashboard, the creator's profile identifier is written here.
- The manager dashboard filters venues by this column so managers only see and manage their own venues.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'venues' AND column_name = 'manager_id'
  ) THEN
    ALTER TABLE venues ADD COLUMN manager_id text;
  END IF;
END $$;
