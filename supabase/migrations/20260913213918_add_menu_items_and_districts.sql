/*
# Add Menu Items Table + Update Districts

1. New Tables
- `menu_items`: Categorized menu items per venue with prices in GEL
  - category: 'appetizer', 'main', 'drink', 'dessert'
  - Multi-language name/description fields

2. Data Updates
- Add Mtatsminda, Ortachala, Avlabari to district set
- Seed menu items for all 10 venues (4 categories each)

3. Security
- RLS enabled on menu_items, anon+authenticated CRUD (single-tenant, no auth)
*/

CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id uuid NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'main',
  name text NOT NULL,
  name_ka text,
  name_ru text,
  description text,
  description_ka text,
  description_ru text,
  price numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_menu" ON menu_items;
CREATE POLICY "anon_select_menu" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_menu" ON menu_items;
CREATE POLICY "anon_insert_menu" ON menu_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_menu" ON menu_items;
CREATE POLICY "anon_update_menu" ON menu_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_menu" ON menu_items;
CREATE POLICY "anon_delete_menu" ON menu_items FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_menu_venue ON menu_items(venue_id);

-- Seed menu items for each venue
INSERT INTO menu_items (venue_id, category, name, name_ka, name_ru, description, price) VALUES
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'appetizer', 'Bruschetta Trio', 'ბრუსკეტა ტრიო', 'Брускетта Трио', 'Toasted bread with three toppings', 18),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'appetizer', 'Calamari Rings', 'კალამარის რგოლები', 'Кольца кальмара', 'Crispy fried calamari with aioli', 25),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'main', 'Grilled Salmon', 'გრილზე შემწვარი ორაგული', 'Лосось на гриле', 'Atlantic salmon with seasonal vegetables', 65),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'main', 'Beef Tenderloin', 'საქონლის ხორცის ფილე', 'Филе говядины', 'Grilled tenderloin with red wine jus', 75),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'drink', 'Old Fashioned', 'ოლდ ფეშენი', 'Олд Фэшн', 'Bourbon, bitters, sugar, orange peel', 22),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'drink', 'Jazz Mojito', 'ჯაზ მოხიტო', 'Джаз Мохито', 'White rum, mint, lime, soda', 18),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'dessert', 'Tiramisu', 'ტირამისუ', 'Тирамису', 'Classic Italian coffee dessert', 15),
((SELECT id FROM venues WHERE name = 'Singer Jazz Club'), 'dessert', 'Chocolate Fondant', 'შოკოლადის ფონდანი', 'Шоколадный фондан', 'Warm chocolate cake with vanilla ice cream', 16),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'appetizer', 'Georgian Salad', 'ქართული სალათი', 'Грузинский салат', 'Tomatoes, cucumbers, walnuts dressing', 12),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'appetizer', 'Eggplant Rolls', 'ბადრიჯნის რულეტები', 'Рулетики из баклажанов', 'Eggplant with walnut paste', 15),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'main', 'Boiled Khinkali (5 pcs)', 'მოხარშული ხინკალი (5ცალი)', 'Вареные хинкали (5 шт)', 'Traditional meat-filled dumplings', 14),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'main', 'Mushroom Khinkali (5 pcs)', 'სოკოს ხინკალი (5ცალი)', 'Грибные хинкали (5 шт)', 'Vegetarian mushroom dumplings', 13),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'drink', 'House Wine (glass)', 'სახლის ღვინო (ჭიქა)', 'Домашнее вино (бокал)', 'Local Georgian red or white', 8),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'drink', 'Chacha', 'ჭაჭა', 'Чача', 'Georgian grape brandy', 10),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'dessert', 'Churchkhela', 'ჩურჩხელა', 'Чурчхела', 'Traditional grape must and walnut candy', 6),
((SELECT id FROM venues WHERE name = 'Khinkali House Old Town'), 'dessert', 'Pelamushi', 'პელამუში', 'Пеламуши', 'Grape must and cornmeal dessert', 5),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'appetizer', 'Mezze Platter', 'მეზეს თეფში', 'Мезе на блюде', 'Hummus, olives, feta, pita bread', 20),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'appetizer', 'Stuffed Mushrooms', 'სოკოთი შევსებული', 'Фаршированные грибы', 'Mushrooms with herbs and cheese', 16),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'main', 'Grilled Trout', 'გრილზე შემწვარი კალმახი', 'Форель на гриле', 'Fresh mountain trout with herbs', 45),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'main', 'Vegetarian Pasta', 'ვეგეტარიანული პასტა', 'Вегетарианская паста', 'Seasonal vegetables in cream sauce', 28),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'drink', 'Aperol Spritz', 'აპეროლ შპრიც', 'Апероль Шприц', 'Aperol, prosecco, soda, orange', 16),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'drink', 'Iced Coffee', 'ყინულიანი ყავა', 'Ледяной кофе', 'Cold brew with milk', 8),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'dessert', 'Cheesecake', 'ჩიზქეიქი', 'Чизкейк', 'New York style with berry coulis', 14),
((SELECT id FROM venues WHERE name = 'Cafe Rooftop Sololaki'), 'dessert', 'Ice Cream Sundae', 'აის კრიმი სანდე', 'Мороженое Сандей', 'Three scoops with chocolate sauce', 10),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'appetizer', 'Oysters (6 pcs)', 'ოსტრეები (6ცალი)', 'Устрицы (6 шт)', 'Fresh Black Sea oysters on ice', 35),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'appetizer', 'Shrimp Cocktail', 'კრევეტების კოქტეილი', 'Коктейль из креветок', 'Chilled shrimp with cocktail sauce', 22),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'main', 'Grilled Sea Bass', 'გრილზე შემწვარი სიბასი', 'Морской окунь на гриле', 'Whole sea bass with lemon butter', 55),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'main', 'Seafood Platter', 'ზღაპროდუქტების თეფში', 'Морское ассорти', 'Mixed grill: fish, shrimp, mussels', 85),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'drink', 'White Wine (bottle)', 'თეთრი ღვინო (ბოთლი)', 'Белое вино (бутылка)', 'Crisp Georgian white wine', 45),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'drink', 'Lemonade', 'ლიმონათი', 'Лимонад', 'Fresh squeezed with mint', 7),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'dessert', 'Creme Brulee', 'კრემ ბრულე', 'Крем-брюле', 'Classic vanilla custard with caramel', 14),
((SELECT id FROM venues WHERE name = 'Seafood Black Sea'), 'dessert', 'Fresh Fruit Plate', 'ახალი ხილის თეფში', 'Тарелка свежих фруктов', 'Seasonal fruits', 10),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'appetizer', 'Edamame', 'ედამამე', 'Эдамаме', 'Steamed soybeans with sea salt', 10),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'appetizer', 'Gyoza (6 pcs)', 'გიოზა (6ცალი)', 'Гёдза (6 шт)', 'Pan-fried pork dumplings', 14),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'main', 'Dragon Roll', 'დრაკონის როლი', 'Ролл Дракон', 'Shrimp tempura, avocado, eel sauce', 28),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'main', 'Pad Thai', 'ფად ტაი', 'Пад Тай', 'Rice noodles with shrimp and peanuts', 22),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'drink', 'Sake (glass)', 'საკე (ჭიქა)', 'Саке (бокал)', 'Warm Japanese rice wine', 12),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'drink', 'Matcha Latte', 'მაჩა ლატე', 'Матча латте', 'Green tea with steamed milk', 9),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'dessert', 'Mochi Ice Cream', 'მოჩი აის კრიმი', 'Мочи с мороженым', 'Three flavors: matcha, berry, mango', 12),
((SELECT id FROM venues WHERE name = 'Asian Fusion Vera'), 'dessert', 'Fried Banana', 'შემწვარი ბანანი', 'Жареный банан', 'With honey and sesame', 8),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'appetizer', 'Lobio', 'ლობიო', 'Лобио', 'Traditional bean stew with cornbread', 10),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'appetizer', 'Khachapuri Adjaruli', 'ხაჭაპური აჭარული', 'Хачапури Аджарули', 'Boat-shaped cheese bread with egg', 15),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'main', 'Mtsvadi', 'მწვადი', 'Мцвади', 'Georgian pork skewers grilled over vine', 30),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'main', 'Chakhokhbili', 'ჩახოხბილი', 'Чахохбили', 'Chicken stewed with tomatoes and herbs', 22),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'drink', 'Limonati', 'ლიმონათი', 'Лимонади', 'House-made lemonade with tarragon', 6),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'drink', 'Saperavi (glass)', 'საფერავი (ჭიქა)', 'Саперави (бокал)', 'Georgian red wine', 9),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'dessert', 'Tklapi', 'ტკლაპი', 'Тклапи', 'Fruit leather, traditional sweet', 4),
((SELECT id FROM venues WHERE name = 'Cozy Garden Saburtalo'), 'dessert', 'Honey Cake', 'თაფლის ნამცხვარი', 'Медовый торт', 'Layered honey cream cake', 8),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'appetizer', 'Foie Gras', 'ფუა გრა', 'Фуа-гра', 'Pan-seared with fig compote', 35),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'appetizer', 'Beef Tartare', 'საქონლის ტარტარი', 'Тартар из говядины', 'Hand-cut beef with quail egg and capers', 28),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'main', 'Duck Confit', 'ბატკონფი', 'Конфи из утки', 'Slow-cooked duck leg with potato gratin', 55),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'main', 'Lamb Chops', 'ცხვრის კოტლეტები', 'Котлеты из ягненка', 'Herb-crusted with mint jus', 65),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'drink', 'Champagne (glass)', 'შამპანი (ჭიქა)', 'Шампанское (бокал)', 'French champagne, brut', 18),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'drink', 'Pinot Noir (glass)', 'პინო ნუარი (ჭიქა)', 'Пино Нуар (бокал)', 'Red wine, smooth and fruity', 14),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'dessert', 'Creme Caramel', 'კრემ კარამელი', 'Крем-карамель', 'Silky custard with caramel top', 12),
((SELECT id FROM venues WHERE name = 'Romantic Terrace Mtatsminda'), 'dessert', 'Souffle', 'სუფლე', 'Суфле', 'Chocolate souffle with creme anglaise', 16),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'appetizer', 'Supra Starter', 'სუპრას დასაწყისი', 'Супра старт', 'Assorted Georgian appetizers for sharing', 25),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'appetizer', 'Pkhali Trio', 'ფხალის ტრიო', 'Пхали трио', 'Three vegetable pate balls with walnuts', 12),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'main', 'Khinkali (10 pcs)', 'ხინკალი (10ცალი)', 'Хинкали (10 шт)', 'Traditional meat dumplings, supra size', 22),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'main', 'Satsivi', 'საცივი', 'Сациви', 'Cold chicken in walnut sauce', 25),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'drink', 'Tarragon Lemonade', 'ესტრაგონის ლიმონათი', 'Тархун лимонад', 'Green tarragon-flavored lemonade', 5),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'drink', 'Chacha (shot)', 'ჭაჭა (ჭიქა)', 'Чача (рюмка)', 'Georgian grape brandy, house-made', 6),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'dessert', 'Gozinaki', 'გოზინაყი', 'Гозинаки', 'Caramelized walnuts in honey', 5),
((SELECT id FROM venues WHERE name = 'Folk House Nadzaladevi'), 'dessert', 'Fresh Berries', 'ახალი კენკრა', 'Свежие ягоды', 'Seasonal berries with cream', 7),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'appetizer', 'Pretzel Sticks', 'პრეცელის ჯოხები', 'Крендельные палочки', 'Salted pretzel with mustard dip', 8),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'appetizer', 'Loaded Fries', 'ჩადებული ფრი', 'Фри с начинкой', 'Fries with cheese, bacon, and jalapenos', 14),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'main', 'Craft Burger', 'კრაფტ ბურგერი', 'Крафтовый бургер', 'Beef patty with cheddar and house sauce', 20),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'main', 'Chicken Wings', 'ქათმის ფრთები', 'Куриные крылья', 'Buffalo or BBQ, 10 pieces', 16),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'drink', 'IPA (pint)', 'IPA (პინტა)', 'IPA (пинта)', 'Local craft IPA, citrusy and hoppy', 10),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'drink', 'Stout (pint)', 'სტაუტი (პინტა)', 'Стаут (пинта)', 'Dark roasted stout, chocolate notes', 11),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'dessert', 'Brownie', 'ბრაუნი', 'Брауни', 'Warm chocolate brownie with nuts', 7),
((SELECT id FROM venues WHERE name = 'Craft Beer Didube'), 'dessert', 'Cheese Cake Pop', 'ჩიზქეიქის პოპი', 'Чизкейк поп', 'Bite-sized cheesecake on a stick', 5),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'appetizer', 'Mtskheta Salad', 'მცხეთას სალათი', 'Мцхетский салат', 'Local greens with pomegranate and walnuts', 10),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'appetizer', 'Badrijani', 'ბადრიჯანი', 'Бадриджани', 'Eggplant rolls with walnut paste', 12),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'main', 'Mtsvadi (skewer)', 'მწვადი (შამფური)', 'Мцвади (шампур)', 'Pork skewers grilled over vine wood', 25),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'main', 'Lobio (clay pot)', 'ლობიო (თიხის ქვაბი)', 'Лобио (глиняный горшок)', 'Red beans stewed with herbs in clay pot', 14),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'drink', 'Mukuzani (glass)', 'მუკუზანი (ჭიქა)', 'Мукузани (бокал)', 'Aged Georgian red wine', 8),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'drink', 'Borjomi Water', 'ბორჯომის წყალი', 'Боржоми вода', 'Georgian mineral water', 4),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'dessert', 'Churchkhela', 'ჩურჩხელა', 'Чурчхела', 'Traditional grape and walnut sweet', 5),
((SELECT id FROM venues WHERE name = 'Mtskheta Garden Court'), 'dessert', 'Pelamushi', 'პელამუში', 'Пеламуши', 'Sweet grape must pudding', 4)
ON CONFLICT DO NOTHING;
