export type Role = 'client' | 'manager' | 'admin';
export type ViewMode = 'list' | 'map';
export type VibeStatus = 'green' | 'yellow' | 'red';
export type TableStatus = 'available' | 'limited' | 'full';
export type SearchPill = 'all' | 'free' | 'top' | 'live';

export const DISTRICTS = [
  'Old Tbilisi',
  'Mtatsminda',
  'Sololaki',
  'Vera',
  'Vake',
  'Saburtalo',
  'Ortachala',
  'Nadzaladevi',
  'Chugureti',
  'Avlabari',
  'Didube',
  'Mtskheta',
] as const;

export const DISTRICT_KEYS: Record<string, string> = {
  'Old Tbilisi': 'oldTbilisi',
  'Mtatsminda': 'mtatsminda',
  'Sololaki': 'sololaki',
  'Vera': 'vera',
  'Vake': 'vake',
  'Saburtalo': 'saburtalo',
  'Ortachala': 'ortachala',
  'Nadzaladevi': 'nadzaladevi',
  'Chugureti': 'chugureti',
  'Avlabari': 'avlabari',
  'Didube': 'didube',
  'Mtskheta': 'mtskheta',
};

export function getDistrictName(district: string, lang: 'en' | 'ka' | 'ru', t: (l: 'en' | 'ka' | 'ru', k: string) => string): string {
  const key = DISTRICT_KEYS[district];
  if (!key) return district;
  return t(lang, key);
}

export const CUISINES = [
  'All',
  'Georgian Traditional',
  'European',
  'Asian',
  'Khinkali House',
  'Seafood',
] as const;

export const VIBES = [
  'All',
  'Romantic',
  'High Energy',
  'Cozy',
  'Family Friendly',
] as const;

export const DISTANCES = [
  'Any distance',
  'Within 1 km',
  'Within 3 km',
  'Within 5 km',
] as const;

export const FEATURES = [
  'All',
  'Outdoor Seating',
  'LiveMusic',
  'Folk',
  'Jazz',
] as const;

export const PROFANITY_WORDS = [
  'damn', 'shit', 'fuck', 'ass', 'bitch', 'crap', 'hell',
  'дерьно', 'блин', 'черт',
];

export function filterProfanity(text: string): string {
  let result = text;
  for (const word of PROFANITY_WORDS) {
    const regex = new RegExp(word, 'gi');
    result = result.replace(regex, '*'.repeat(word.length));
  }
  return result;
}

export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const TBILISI_CENTER = { lat: 41.6928, lng: 44.8015 };
