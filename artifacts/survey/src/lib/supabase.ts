import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl) {
  throw new Error("VITE_SUPABASE_URL is not set");
}
if (!supabaseAnonKey) {
  throw new Error("VITE_SUPABASE_ANON_KEY is not set");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SurveyResponse {
  id: string;
  created_at: string;
  favorite_food: string;
  cuisine_type: string;
  eating_frequency: string;
  enjoyed_foods: string[];
  other_food: string | null;
}

export interface SurveyFormData {
  favorite_food: string;
  cuisine_type: string;
  eating_frequency: string;
  enjoyed_foods: string[];
  other_food: string;
}
