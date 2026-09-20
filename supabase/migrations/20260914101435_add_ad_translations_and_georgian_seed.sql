/*
# Add multi-language columns to ads table + Georgian-default seed data

1. Modified Tables
- `ads`: Added `title_ka`, `title_ru`, `subtitle_ka`, `subtitle_ru`, `cta_ka`, `cta_ru` text columns (nullable)
  so ad content can be displayed in Georgian, English, or Russian based on the user's selected language.

2. Data Updates
- Updated existing ad rows with Georgian, English, and Russian translations for title, subtitle, and CTA text.
- Georgian is the default language (stored in the original `title`/`subtitle`/`cta_text` columns).

3. Security
- No RLS policy changes — existing anon/authenticated CRUD policies remain in place.

4. Notes
- The original `title`, `subtitle`, and `cta_text` columns now store the Georgian text as the default.
- `title_ka`/`subtitle_ka`/`cta_ka` store the Georgian copy (same as default for consistency).
- `title_ru`/`subtitle_ru`/`cta_ru` store the Russian copy.
- The frontend `Ad` type and rendering components will use these new columns based on the active language.
*/

-- Add translation columns to ads table
ALTER TABLE ads ADD COLUMN IF NOT EXISTS title_ka text;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS title_ru text;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS subtitle_ka text;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS subtitle_ru text;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS cta_ka text;
ALTER TABLE ads ADD COLUMN IF NOT EXISTS cta_ru text;

-- Update existing ads with Georgian default + EN + RU translations
-- Ad 1: Startup ad for Singer Jazz Club
UPDATE ads SET
  title = 'სპეციალური შაბათ-კვირის შემოთავაზება: სასმელებზე 20% ფასდაკლება სინგერ ჯაზ კლუბში!',
  title_ka = 'სპეციალური შაბათ-კვირის შემოთავაზება: სასმელებზე 20% ფასდაკლება სინგერ ჯაზ კლუბში!',
  title_ru = 'Специальное предложение на выходные: 20% скидка на напитки в Сингер Джаз Клуб!',
  subtitle = 'ცოცხალი ჯაზი ყოველ პარასკევსა და შაბათს',
  subtitle_ka = 'ცოცხალი ჯაზი ყოველ პარასკევსა და შაბათს',
  subtitle_ru = 'Живой джаз каждую пятницу и субботу',
  cta_text = 'მიმართულების მიღება',
  cta_ka = 'მიმართულების მიღება',
  cta_ru = 'Проложить маршрут'
WHERE type = 'startup' AND title LIKE '%Singer Jazz Club%';

-- Ad 2: Carousel - Rooftop Sololaki
UPDATE ads SET
  title = 'რუფტოპ სანსეტ დაინინგი კაფე რუფთოპ სოლოლაკში',
  title_ka = 'რუფტოპ სანსეტ დაინინგი კაფე რუფთოპ სოლოლაკში',
  title_ru = 'Ужин на закате на крыше Кафе Руфтоп Сололаки',
  subtitle = 'პანორამული ხედები + ფოლკლორული მუსიკა',
  subtitle_ka = 'პანორამული ხედები + ფოლკლორული მუსიკა',
  subtitle_ru = 'Панорамные виды + народная музыка',
  cta_text = 'ვენუს ნახვა',
  cta_ka = 'ვენუს ნახვა',
  cta_ru = 'Посмотреть заведение'
WHERE type = 'carousel' AND title LIKE '%Rooftop%Sololaki%';

-- Ad 3: Carousel - Folk House Nadzaladevi
UPDATE ads SET
  title = 'აუთენტური ქართული სუფრა ფოლკ ჰაუს ნაძალადევში',
  title_ka = 'აუთენტური ქართული სუფრა ფოლკ ჰაუს ნაძალადევში',
  title_ru = 'Аутентичное грузинское застолье в Фолк Хаус Надзаладеви',
  subtitle = 'ტრადიციული ქართული სუფრა და ცეკვები',
  subtitle_ka = 'ტრადიციული ქართული სუფრა და ცეკვები',
  subtitle_ru = 'Традиционный грузинский пир и танцы',
  cta_text = 'მაგიდის ჯავშნა',
  cta_ka = 'მაგიდის ჯავშნა',
  cta_ru = 'Забронировать стол'
WHERE type = 'carousel' AND title LIKE '%Folk House%Nadzaladevi%';

-- Ad 4: Carousel - Seafood Black Sea
UPDATE ads SET
  title = 'ახალი შავი ზღვის ზღაპროდუქტი ყოველდღიურად',
  title_ka = 'ახალი შავი ზღვის ზღაპროდუქტი ყოველდღიურად',
  title_ru = 'Свежие морепродукты Черного моря ежедневно',
  subtitle = 'გრილზე შემწვარი თევზი, მიდიები და ოსტრები',
  subtitle_ka = 'გრილზე შემწვარი თევზი, მიდიები და ოსტრები',
  subtitle_ru = 'Жареная рыба, мидии и устрицы на гриле',
  cta_text = 'მენიუს ნახვა',
  cta_ka = 'მენიუს ნახვა',
  cta_ru = 'Посмотреть меню'
WHERE type = 'carousel' AND title LIKE '%Seafood%Black Sea%';

-- Also update venue addresses to Georgian defaults
UPDATE venues SET address = 'შარდენის ქ. 12' WHERE name = 'Singer Jazz Club';
UPDATE venues SET address = 'ბეთლემის ქ. 8' WHERE name = 'Khinkali House Old Town';
UPDATE venues SET address = 'ლესელიძის ქ. 24' WHERE name = 'Cafe Rooftop Sololaki';
UPDATE venues SET address = 'ჭავჭავაძის გამრ. 15' WHERE name = 'Seafood Black Sea';
UPDATE venues SET address = 'პერისცისვალებას ქ. 9' WHERE name = 'Asian Fusion Vera';
UPDATE venues SET address = 'პალიაშვილის ქ. 30' WHERE name = 'Cozy Garden Saburtalo';
UPDATE venues SET address = 'მთაწმინდის პარკის გზა 5' WHERE name = 'Romantic Terrace Mtatsminda';
UPDATE venues SET address = 'წერეთლის გამრ. 18' WHERE name = 'Folk House Nadzaladevi';
UPDATE venues SET address = 'აკაკი წერეთლის ქ. 22' WHERE name = 'Craft Beer Didube';
UPDATE venues SET address = 'არმაზის ხევი 5, მცხეთა' WHERE name = 'Mtskheta Garden Court';
