"use server";

import { revalidatePath } from "next/cache";
import { insertTerm, patchTerm, removeTerm } from "@/lib/services/terms";
import { insertDeck, patchDeck, removeDeck } from "@/lib/services/decks";

// Terms CRUD

export async function createTerm(data: {
  term: string;
  definition: string;
  example: string | null;
  deck_id: number | null;
}) {
  if (!data.term?.trim() || !data.definition?.trim())
    throw new Error("Term và Definition là bắt buộc");
  await insertTerm({
    term: data.term.trim(),
    definition: data.definition.trim(),
    example: data.example?.trim() || null,
    deck_id: data.deck_id,
  });
  revalidatePath("/");
}

export async function updateTerm(
  id: number,
  data: { term: string; definition: string; example: string | null; deck_id: number | null }
) {
  if (!data.term?.trim() || !data.definition?.trim())
    throw new Error("Term và Definition là bắt buộc");
  await patchTerm(id, {
    term: data.term.trim(),
    definition: data.definition.trim(),
    example: data.example?.trim() || null,
    deck_id: data.deck_id,
  });
  revalidatePath("/");
}

export async function deleteTerm(id: number) {
  await removeTerm(id);
  revalidatePath("/");
}

// Decks CRUD

export async function createDeck(name: string) {
  if (!name?.trim()) throw new Error("Tên deck là bắt buộc");
  await insertDeck(name.trim());
  revalidatePath("/");
}

export async function updateDeck(id: number, name: string) {
  if (!name?.trim()) throw new Error("Tên deck là bắt buộc");
  await patchDeck(id, name.trim());
  revalidatePath("/");
}

export async function deleteDeck(id: number) {
  await removeDeck(id);
  revalidatePath("/");
}
