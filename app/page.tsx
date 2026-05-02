import { fetchTerms } from "@/lib/services/terms";
import { fetchDecks } from "@/lib/services/decks";
import { MainTabs } from "@/app/components/MainTabs";

export default async function Home() {
  const [terms, decks] = await Promise.all([fetchTerms(), fetchDecks()]);

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
