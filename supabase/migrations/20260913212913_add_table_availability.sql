/*
# Add Live Table Availability System

1. Modified Tables
- `venues`: Added `table_status` text column (values: 'available', 'limited', 'full') with default 'available'
- `venues`: Added `available_tables_count` integer column (nullable) for optional table count display

2. Data Update
- Set initial table_status values for existing seed venues (mix of available/limited/full)

3. Security
- No RLS changes needed — existing policies already cover the new columns
*/

ALTER TABLE venues ADD COLUMN IF NOT EXISTS table_status text NOT NULL DEFAULT 'available';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS available_tables_count integer;

UPDATE venues SET table_status = 'available', available_tables_count = 12 WHERE name = 'Singer Jazz Club';
UPDATE venues SET table_status = 'limited', available_tables_count = 3 WHERE name = 'Khinkali House Old Town';
UPDATE venues SET table_status = 'available', available_tables_count = 8 WHERE name = 'Cafe Rooftop Sololaki';
UPDATE venues SET table_status = 'full', available_tables_count = 0 WHERE name = 'Seafood Black Sea';
UPDATE venues SET table_status = 'available', available_tables_count = 15 WHERE name = 'Asian Fusion Vera';
UPDATE venues SET table_status = 'limited', available_tables_count = 4 WHERE name = 'Cozy Garden Saburtalo';
UPDATE venues SET table_status = 'available', available_tables_count = 10 WHERE name = 'Romantic Terrace Mtatsminda';
UPDATE venues SET table_status = 'full', available_tables_count = 0 WHERE name = 'Folk House Nadzaladevi';
UPDATE venues SET table_status = 'available', available_tables_count = 20 WHERE name = 'Craft Beer Didube';
UPDATE venues SET table_status = 'limited', available_tables_count = 5 WHERE name = 'Mtskheta Garden Court';
