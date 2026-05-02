import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Deck = {
  id: number;
  name: string;
  created_at: string;
};

export type Term = {
  id: number;
  term: string;
  definition: string;
  example: string | null;
  created_at: string;
  deck_id: number | null;
  deck?: Deck | null;
};

/** @deprecated use Term */
export type Flashcard = Term;
