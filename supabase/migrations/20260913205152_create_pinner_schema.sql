/*
# Pinner (VibeCheck) Database Schema

1. New Tables
- `venues`: Venue listings with cuisine, vibe, district, location, features, ratings, vibe status
- `reviews`: User ratings on 10-point scale (food, service, music) + text feedback
- `ads`: Startup splash ads and carousel banner ads
- `events`: Venue events
- `chat_messages`: Live venue chat messages
- `visits`: User check-in records

2. Security
- RLS enabled on all tables
- Single-tenant (no auth): all tables allow anon + authenticated CRUD
- Data is intentionally public/shared across all app roles

3. Seed Data
- 10 venues across Tbilisi districts with realistic Georgian restaurant data
- 2 startup ads, 3 carousel ads
- Sample reviews, events, chat messages
*/

-- VENUES
CREATE TABLE IF NOT EXISTS venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ka text,
  name_ru text,
  description text,
  description_ka text,
  description_ru text,
  cuisine text NOT NULL DEFAULT 'Georgian Traditional',
  vibe text NOT NULL DEFAULT 'Cozy',
  district text NOT NULL DEFAULT 'Old Tbilisi',
  address text,
  lat double precision NOT NULL DEFAULT 41.6928,
  lng double precision NOT NULL DEFAULT 44.8015,
  features text[] DEFAULT '{}',
  image_url text,
  vibe_status text NOT NULL DEFAULT 'green',
  rating_food numeric DEFAULT 0,
  rating_service numeric DEFAULT 0,
  rating_music numeric DEFAULT 0,
  rating_overall numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  phone text,
  approved boolean DEFAULT true,
  sponsored boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_venues" ON venues;
CREATE POLICY "anon_select_venues" ON venues FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_venues" ON venues;
CREATE POLICY "anon_insert_venues" ON venues FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_venues" ON venues;
CREATE POLICY "anon_update_venues" ON venues FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_venues" ON venues;
CREATE POLICY "anon_delete_venues" ON venues FOR DELETE
  TO anon, authenticated USING (true);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT 'Guest',
  rating_food numeric NOT NULL DEFAULT 5,
  rating_service numeric NOT NULL DEFAULT 5,
  rating_music numeric NOT NULL DEFAULT 5,
  rating_overall numeric NOT NULL DEFAULT 5,
  text text DEFAULT '',
  photo_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE
  TO anon, authenticated USING (true);

-- ADS
CREATE TABLE IF NOT EXISTS ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'carousel',
  title text NOT NULL,
  subtitle text,
  image_url text,
  venue_id uuid REFERENCES venues(id) ON DELETE SET NULL,
  cta_text text DEFAULT 'Learn More',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_ads" ON ads;
CREATE POLICY "anon_select_ads" ON ads FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ads" ON ads;
CREATE POLICY "anon_insert_ads" ON ads FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_ads" ON ads;
CREATE POLICY "anon_update_ads" ON ads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ads" ON ads;
CREATE POLICY "anon_delete_ads" ON ads FOR DELETE
  TO anon, authenticated USING (true);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  event_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_events" ON events;
CREATE POLICY "anon_select_events" ON events FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_events" ON events;
CREATE POLICY "anon_insert_events" ON events FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_events" ON events;
CREATE POLICY "anon_update_events" ON events FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_events" ON events;
CREATE POLICY "anon_delete_events" ON events FOR DELETE
  TO anon, authenticated USING (true);

-- CHAT MESSAGES
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT 'Guest',
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat" ON chat_messages;
CREATE POLICY "anon_select_chat" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chat" ON chat_messages;
CREATE POLICY "anon_insert_chat" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chat" ON chat_messages;
CREATE POLICY "anon_delete_chat" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

-- VISITS
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT 'Guest',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_visits" ON visits;
CREATE POLICY "anon_select_visits" ON visits FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_visits" ON visits;
CREATE POLICY "anon_insert_visits" ON visits FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_visits" ON visits;
CREATE POLICY "anon_delete_visits" ON visits FOR DELETE
  TO anon, authenticated USING (true);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_venues_district ON venues(district);
CREATE INDEX IF NOT EXISTS idx_venues_cuisine ON venues(cuisine);
CREATE INDEX IF NOT EXISTS idx_reviews_venue ON reviews(venue_id);
CREATE INDEX IF NOT EXISTS idx_chat_venue ON chat_messages(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_visits_venue ON visits(venue_id);
CREATE INDEX IF NOT EXISTS idx_ads_active ON ads(active);

-- SEED VENUES
INSERT INTO venues (name, name_ka, name_ru, description, description_ka, description_ru, cuisine, vibe, district, address, lat, lng, features, image_url, vibe_status, rating_food, rating_service, rating_music, rating_overall, total_ratings, phone, approved, sponsored) VALUES
('Singer Jazz Club', 'სინგერ ჯაზ კლუბი', 'Сингер Джаз Клуб', 'Intimate jazz club with live performances every weekend. Craft cocktails and a sophisticated amber-lit atmosphere.', 'ინტიმური ჯაზ კლუბი ცოცხალი შესრულებებით ყოველ შაბათ-კვირას. სახელოსნო კოქტეილები და დახვეწილი ამბერის განათების ატმოსფერო.', 'Интимный джаз-клуб с живыми выступлениями каждые выходные. Авторские коктейли и изысканная атмосфера янтарного освещения.', 'European', 'High Energy', 'Old Tbilisi', '12 Shardeni St', 41.6892, 44.8098, ARRAY['LiveMusic', 'Jazz'], 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg', 'green', 9.2, 8.8, 9.5, 9.2, 47, '+995 322 12 34 56', true, true),
('Khinkali House Old Town', 'ხინკალი ჰაუს ძველი ქალაქი', 'Хинкальный Дом Старый Город', 'Traditional khinkali house serving the best boiled khinkali in Tbilisi. Family recipes passed down for generations.', 'ტრადიციული ხინკალის სახლი, რომელიც თბილისში საუკეთესო მოხარშულ ხინკალს აწვდინებს. ოჯახის რეცეპტები თაობეთა გასწვრივ.', 'Традиционный дом хинкали, подающий лучшие вареные хинкали в Тбилиси. Семейные рецепты передаются из поколения в поколение.', 'Khinkali House', 'Cozy', 'Old Tbilisi', '8 Betlemi St', 41.6915, 44.8062, ARRAY['Family Friendly'], 'https://images.pexels.com/photos/6759535/pexels-photo-6759535.jpeg', 'green', 9.5, 8.5, 7.0, 8.7, 89, '+995 322 23 45 67', true, false),
('Cafe Rooftop Sololaki', 'კაფე რუფთოპ სოლოლაკი', 'Кафе Руфтоп Сололаки', 'Rooftop cafe with panoramic views of Tbilisi. Perfect for sunset dining with outdoor seating and gentle folk music.', 'სახურავის კაფე თბილისის პანორამული ხედებით. იდეალურია მზის ჩასვლის დინერისთვის ღია სივრცეში და ნაზი ხალხური მუსიკით.', 'Кафе на крыше с панорамными видами Тбилиси. Идеально для ужина на закате с открытым воздухом и нежной народной музыкой.', 'Georgian Traditional', 'Romantic', 'Sololaki', '24 Leselidze St', 41.6885, 44.8055, ARRAY['Outdoor Seating', 'Folk'], 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg', 'green', 8.8, 9.0, 8.2, 8.7, 34, '+995 322 34 56 78', true, true),
('Seafood Black Sea', 'ზღაპროდუქტი შავი ზღვა', 'Морепродукты Черное Море', 'Fresh Black Sea seafood brought daily. Grilled fish, mussels, and oysters in a modern European setting.', 'შავი ზღვის ახალი ზღაპროდუქტი ყოველდღიურად. გრილზე შემწვარი თევზი, მიდიები და ოსტრები თანამედროვე ევროპულ გარემოში.', 'Свежие морепродукты Черного моря, доставляемые ежедневно. Жареная рыба, мидии и устрицы в современной европейской обстановке.', 'Seafood', 'High Energy', 'Vake', '15 Chavchavadze Ave', 41.7128, 44.7465, ARRAY['LiveMusic'], 'https://images.pexels.com/photos/2633245/pexels-photo-2633245.jpeg', 'yellow', 8.5, 7.8, 7.5, 8.0, 23, '+995 322 45 67 89', true, false),
('Asian Fusion Vera', 'აზიური ფიუჟნ ვერა', 'Азиатский Фьюжн Вера', 'Modern Asian fusion restaurant in the heart of Vera. Sushi, dumplings, and craft cocktails in a sleek setting.', 'თანამედროვე აზიური ფიუჟნ რესტორანი ვერას გულში. სუში, პელმენები და სახელოსნო კოქტეილები ელეგანტურ გარემოში.', 'Современный ресторан азиатского фьюжн в сердце Вера. Суши, пельмени и авторские коктейли в элегантной обстановке.', 'Asian', 'High Energy', 'Vera', '9 Peristsitsvaleba St', 41.7025, 44.7820, ARRAY['Outdoor Seating'], 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg', 'green', 8.9, 8.5, 8.0, 8.5, 56, '+995 322 56 78 90', true, false),
('Cozy Garden Saburtalo', 'მყუდრო ბაღი საბურთალო', 'Уютный Сад Сабуртало', 'Hidden garden restaurant with outdoor seating under grapevines. Family-friendly Georgian home cooking.', 'დამალული ბაღის რესტორანი ვაზის ლიანების ქვეშ ღია სივრცით. ოჯახური ქართული სამზარეულო.', 'Скрытый сад-ресторан с открытым воздухом под виноградными лозами. Домашняя грузинская кухня для всей семьи.', 'Georgian Traditional', 'Family Friendly', 'Saburtalo', '30 Paliashvili St', 41.7180, 44.7680, ARRAY['Outdoor Seating', 'Family Friendly', 'Folk'], 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg', 'green', 9.0, 8.7, 7.5, 8.6, 41, '+995 322 67 89 01', true, false),
('Romantic Terrace Mtatsminda', 'რომანტიკული ტერასა მთაწმინდა', 'Романтическая Терраса Мтацминда', 'Fine dining terrace on Mtatsminda hill with breathtaking city views. Candlelit tables and live jazz on weekends.', 'ფინაური დინერის ტერასა მთაწმინდის ბორცვზე ქალაქის სასაკვირველო ხედებით. სანთლებით განათებული მაგიდები და ცოცხალი ჯაზი შაბათ-კვირას.', 'Терраса для изысканного ужина на холме Мтацминда с захватывающими видами города. Свечи на столах и живой джаз по выходным.', 'European', 'Romantic', 'Mtatsminda', '5 Mtatsminda Park Rd', 41.6890, 44.7930, ARRAY['Outdoor Seating', 'Jazz', 'LiveMusic'], 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg', 'green', 9.3, 9.1, 8.8, 9.1, 38, '+995 322 78 90 12', true, true),
('Folk House Nadzaladevi', 'ფოლკ ჰაუს ნაძალადევი', 'Фолк Хаус Надзаладеви', 'Authentic Georgian folk music venue with traditional dancing and feast-style dining. A true supra experience.', 'აუთენტური ქართული ხალხური მუსიკის ვენუე ტრადიციული ცეკვებით და სუპრას სტილის დინერით. ნამდვილი სუპრას გამოცდილება.', 'Аутентичный грузинский фолк-вэнью с традиционными танцами и застольем. Настоящий опыт супры.', 'Georgian Traditional', 'High Energy', 'Nadzaladevi', '18 Tsereteli Ave', 41.7100, 44.7900, ARRAY['Folk', 'Family Friendly'], 'https://images.pexels.com/photos/5339021/pexels-photo-5339021.jpeg', 'yellow', 8.7, 8.0, 9.2, 8.6, 29, '+995 322 89 01 23', true, false),
('Craft Beer Didube', 'კრაფტ ლუდი დიდუბე', 'Крафтовое Пиво Дидубе', 'Craft beer garden with outdoor seating, live music on Fridays, and hearty pub food. Popular with locals.', 'კრაფტ ლუდის ბაღი ღია სივრცით, ცოცხალი მუსიკით პარასკევობით და გემრიელი პაბის საჭმელით. პოპულარული ადგილობრივებში.', 'Сад крафтового пива с открытым воздухом, живой музыкой по пятницам и сытной пабной едой. Популярно среди местных.', 'European', 'High Energy', 'Didube', '22 Akaki Tsereteli St', 41.7220, 44.7750, ARRAY['Outdoor Seating', 'LiveMusic'], 'https://images.pexels.com/photos/1267700/pexels-photo-1267700.jpeg', 'green', 8.0, 8.2, 8.5, 8.2, 31, '+995 322 90 12 34', true, false),
('Mtskheta Garden Court', 'მცხეთა ბაღის ეზო', 'Мцхетский Садовый Двор', 'Historic courtyard restaurant in Georgia''s old capital. Traditional cuisine under ancient grapevines.', 'ისტორიული ეზოს რესტორანი საქართველოს ძველ დედაქალაქში. ტრადიციული სამზარეულო უძველესი ვაზის ლიანების ქვეშ.', 'Исторический ресторан во дворе в старой столице Грузии. Традиционная кухня под древними виноградными лозами.', 'Georgian Traditional', 'Cozy', 'Mtskheta', '5 Armazis Khevi, Mtskheta', 41.8437, 44.8087, ARRAY['Outdoor Seating', 'Folk', 'Family Friendly'], 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg', 'green', 9.1, 8.8, 8.0, 8.7, 45, '+995 322 01 23 45', true, false)
ON CONFLICT DO NOTHING;

-- SEED ADS
INSERT INTO ads (type, title, subtitle, image_url, venue_id, cta_text, active) VALUES
('startup', 'Special Weekend Offer: 20% Off Drinks at Singer Jazz Club!', 'Live jazz every Friday & Saturday night', 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg', (SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'Get Directions', true),
('carousel', 'Rooftop Sunset Dining at Cafe Rooftop Sololaki', 'Panoramic views + folk music', 'https://images.pexels.com/photos/261327/pexels-photo-261327.jpeg', (SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'View Venue', true),
('carousel', 'Authentic Supra Experience at Folk House Nadzaladevi', 'Traditional Georgian feast & dancing', 'https://images.pexels.com/photos/5339021/pexels-photo-5339021.jpeg', (SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'Book Table', true),
('carousel', 'Fresh Black Sea Seafood Daily', 'Grilled fish, mussels & oysters', 'https://images.pexels.com/photos/2633245/pexels-photo-2633245.jpeg', (SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'View Menu', true)
ON CONFLICT DO NOTHING;

-- SEED REVIEWS
INSERT INTO reviews (venue_id, user_name, rating_food, rating_service, rating_music, rating_overall, text) VALUES
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'Nino K.', 9.5, 9.0, 9.8, 9.4, 'Incredible jazz trio on Saturday. The old fashioneds are perfect. Will be back every weekend.'),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'David M.', 8.8, 8.5, 9.2, 8.8, 'Great atmosphere but got a bit crowded after 10pm. Music was phenomenal though.'),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'Ana T.', 9.8, 8.0, 7.0, 8.9, 'Best khinkali in Tbilisi, hands down. The mushroom ones are incredible. Service was a bit slow.'),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'Giorgi B.', 9.5, 9.0, 7.5, 8.8, 'Family recipe you can taste. Come hungry, leave happy.'),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'Mariam L.', 8.5, 9.5, 8.0, 8.7, 'The sunset view is unreal. Book a table by the edge. Folk music was a lovely touch.'),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'Sofia R.', 9.5, 9.5, 9.0, 9.3, 'Perfect anniversary dinner. The city lights at night are breathtaking. Live jazz made it magical.'),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'Levan D.', 9.2, 8.5, 7.5, 8.6, 'Hidden gem! The garden is beautiful in summer. Home cooking like grandma used to make.'),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'Keti A.', 8.5, 8.0, 9.5, 8.7, 'The supra experience is a must! Dancing, singing, amazing food. Come with a group.')
ON CONFLICT DO NOTHING;

-- SEED EVENTS
INSERT INTO events (venue_id, title, description, event_date) VALUES
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'Live Jazz Trio Night', 'Three-piece jazz ensemble performing classics and originals', CURRENT_DATE + 2),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'Soul & Blues Friday', 'Guest vocalist with house band', CURRENT_DATE + 5),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'Traditional Supra Night', 'Full Georgian feast with folk dancing and polyphonic singing', CURRENT_DATE + 1),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'Sunset Acoustic Set', 'Local musician performing folk covers as the sun sets', CURRENT_DATE + 3),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'Friday Live Band', 'Local rock band with craft beer specials', CURRENT_DATE + 4)
ON CONFLICT DO NOTHING;

-- SEED CHAT MESSAGES
INSERT INTO chat_messages (venue_id, user_name, message) VALUES
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'Nino', 'Is there a live band tonight?'),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'Manager', 'Yes! Jazz trio starts at 9pm. See you there!'),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'David', 'How crowded does it get after 10?'),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'Ana', 'Do they have vegetarian khinkali?'),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'Levan', 'Yes, mushroom and potato ones are amazing!'),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'Mariam', 'Best sunset view in Tbilisi!'),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'Keti', 'Coming with 8 people tonight, do we need reservations?')
ON CONFLICT DO NOTHING;
