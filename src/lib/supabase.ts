import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Venue = {
  id: string;
  name: string;
  name_ka: string | null;
  name_ru: string | null;
  description: string | null;
  description_ka: string | null;
  description_ru: string | null;
  cuisine: string;
  vibe: string;
  district: string;
  address: string | null;
  lat: number;
  lng: number;
  features: string[];
  image_url: string | null;
  vibe_status: string;
  rating_food: number;
  rating_service: number;
  rating_music: number;
  rating_overall: number;
  total_ratings: number;
  phone: string | null;
  approved: boolean;
  sponsored: boolean;
  table_status: string;
  available_tables_count: number | null;
  created_at: string;
};

export type Review = {
  id: string;
  venue_id: string;
  user_name: string;
  rating_food: number;
  rating_service: number;
  rating_music: number;
  rating_overall: number;
  text: string;
  photo_url: string | null;
  created_at: string;
};

export type Ad = {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  venue_id: string | null;
  cta_text: string;
  active: boolean;
  created_at: string;
};

export type EventItem = {
  id: string;
  venue_id: string;
  title: string;
  description: string | null;
  event_date: string;
  created_at: string;
};

export type ChatMessage = {
  id: string;
  venue_id: string;
  user_name: string;
  message: string;
  created_at: string;
};

export type Visit = {
  id: string;
  venue_id: string;
  user_name: string;
  created_at: string;
};

export type MenuItem = {
  id: string;
  venue_id: string;
  category: string;
  name: string;
  name_ka: string | null;
  name_ru: string | null;
  description: string | null;
  description_ka: string | null;
  description_ru: string | null;
  price: number;
  created_at: string;
};
