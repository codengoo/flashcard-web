"use client";

import { Tabs } from "@heroui/react";
import type { Term, Deck } from "@/lib/supabase";
import { TermsTab } from "./TermsTab";
import { DecksTab } from "./DecksTab";

interface Props {
  terms: Term[];
  decks: Deck[];
}

export function MainTabs({ terms, decks }: Props) {
  const latestDeck = decks[0] ?? null;

  return (
    <Tabs defaultSelectedKey="terms">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Quản lý flashcard">
          <Tabs.Tab id="terms">Terms</Tabs.Tab>
          <Tabs.Tab id="decks">Decks</Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="terms" className="pt-4">
        <TermsTab terms={terms} decks={decks} currentDeck={latestDeck} />
      </Tabs.Panel>
      <Tabs.Panel id="decks" className="pt-4">
        <DecksTab decks={decks} />
      </Tabs.Panel>
    </Tabs>
  );
}
