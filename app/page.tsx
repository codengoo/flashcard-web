import { supabase, type Term, type Deck } from "@/lib/supabase";
import { MainTabs } from "@/app/components/MainTabs";

async function getTerms(): Promise<Term[]> {
  const { data, error } = await supabase
    .from("terms")
    .select("*, deck:decks(id, name, created_at)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error (terms):", error.message);
    return [];
  }
  return data ?? [];
}

async function getDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error (decks):", error.message);
    return [];
  }
  return data ?? [];
}

export default async function Home() {
  const [terms, decks] = await Promise.all([getTerms(), getDecks()]);

  return (
    <main className="min-h-screen bg-default-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flashcard Input</h1>
          <p className="text-default-500 mt-1">Quản lý term và deck của bạn</p>
        </div>
        <MainTabs terms={terms} decks={decks} />
      </div>
    </main>
  );
}
