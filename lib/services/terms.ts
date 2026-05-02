import { supabase } from "@/lib/supabase";
import type { Term } from "@/lib/supabase";

export async function fetchTerms(): Promise<Term[]> {
  const { data, error } = await supabase
    .from("terms")
    .select("*, deck:decks(id, name, created_at)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function insertTerm(data: {
  term: string;
  definition: string;
  example: string | null;
  deck_id: number | null;
}) {
  const { error } = await supabase.from("terms").insert(data);
  if (error) throw new Error(error.message);
}

export async function patchTerm(
  id: number,
  data: { term: string; definition: string; example: string | null; deck_id: number | null }
) {
  const { error } = await supabase.from("terms").update(data).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function removeTerm(id: number) {
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
