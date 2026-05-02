"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

// Terms CRUD

export async function createTerm(formData: FormData) {
  const term = formData.get("term") as string;
  const definition = formData.get("definition") as string;
  const example = formData.get("example") as string;
  const deckId = formData.get("deck_id") as string;
  if (!term?.trim() || !definition?.trim()) throw new Error("Term va Definition la bat buoc");
  const { error } = await supabase.from("terms").insert({
    term: term.trim(),
    definition: definition.trim(),
    example: example?.trim() || null,
    deck_id: deckId ? Number(deckId) : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateTerm(id: number, data: { term: string; definition: string; example: string | null; deck_id: number | null }) {
  if (!data.term?.trim() || !data.definition?.trim()) throw new Error("Term va Definition la bat buoc");
  const { error } = await supabase.from("terms").update({
    term: data.term.trim(),
    definition: data.definition.trim(),
    example: data.example?.trim() || null,
    deck_id: data.deck_id,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteTerm(id: number) {
  const { error } = await supabase.from("terms").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

// Decks CRUD

export async function createDeck(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) throw new Error("Ten deck la bat buoc");
  const { error } = await supabase.from("decks").insert({ name: name.trim() });
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function updateDeck(id: number, name: string) {
  if (!name?.trim()) throw new Error("Ten deck la bat buoc");
  const { error } = await supabase.from("decks").update({ name: name.trim() }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}

export async function deleteDeck(id: number) {
  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/");
}
