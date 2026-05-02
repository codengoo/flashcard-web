import { supabase } from "@/lib/supabase";
import type { Deck } from "@/lib/supabase";

export async function fetchDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function insertDeck(name: string) {
  const { error } = await supabase.from("decks").insert({ name });
  if (error) throw new Error(error.message);
}

export async function patchDeck(id: number, name: string) {
  const { error } = await supabase.from("decks").update({ name }).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeDeck(id: number) {
  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
