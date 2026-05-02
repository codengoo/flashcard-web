"use client";

import { Tabs } from "@heroui/react";
import { TbCards, TbStack2 } from "react-icons/tb";
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
    <Tabs defaultSelectedKey="terms" variant="primary" className="w-full">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Quản lý flashcard" className="w-full">
          <Tabs.Tab id="terms" className="flex items-center gap-2 px-5 py-3">
            <TbCards size={18} />
            Terms
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="decks" className="flex items-center gap-2 px-5 py-3">
            <TbStack2 size={18} />
            Decks
            <Tabs.Indicator />
          </Tabs.Tab>
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
