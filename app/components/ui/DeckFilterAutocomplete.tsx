"use client";

import {
  Autocomplete,
  Label,
  SearchField,
  ListBox,
  useFilter,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import type { Deck } from "@/lib/supabase";

interface DeckFilterAutocompleteProps {
  decks: Deck[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function DeckFilterAutocomplete({
  decks,
  value,
  onChange,
}: DeckFilterAutocompleteProps) {
  const { contains } = useFilter({ sensitivity: "base" });

  return (
    <Autocomplete
      selectionMode="multiple"
      variant="secondary"
      value={value}
      onChange={(v: Key | Key[] | null) => {
        const ids = Array.isArray(v) ? (v as Key[]).map(String) : [];
        onChange(ids);
      }}
      fullWidth
    >
      <Label>Lọc theo deck</Label>
      <Autocomplete.Trigger>
        <Autocomplete.Value />
        <Autocomplete.ClearButton />
        <Autocomplete.Indicator />
      </Autocomplete.Trigger>
      <Autocomplete.Popover>
        <Autocomplete.Filter filter={contains}>
          <SearchField>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Tìm deck..." />
            </SearchField.Group>
          </SearchField>
          <ListBox>
            {decks.map((d) => (
              <ListBox.Item key={d.id} id={String(d.id)} textValue={d.name}>
                <Label>{d.name}</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
