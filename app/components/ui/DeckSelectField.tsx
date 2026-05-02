"use client";

import { useField } from "formik";
import {
  Autocomplete,
  Label,
  SearchField,
  ListBox,
  useFilter,
} from "@heroui/react";
import type { Key } from "@heroui/react";
import type { Deck } from "@/lib/supabase";

const CREATE_DECK_KEY = "__create_deck__";

interface DeckSelectFieldProps {
  name: string;
  label: string;
  decks: Deck[];
  placeholder?: string;
  onCreateDeck?: () => void;
}

export function DeckSelectField({
  name,
  label,
  decks,
  placeholder = "Chọn deck...",
  onCreateDeck,
}: DeckSelectFieldProps) {
  const [field, meta, helpers] = useField<number | null>(name);
  const { contains } = useFilter({ sensitivity: "base" });
  const isInvalid = meta.touched && !!meta.error;

  function handleChange(v: Key | Key[] | null) {
    if (v === CREATE_DECK_KEY) {
      onCreateDeck?.();
      return;
    }
    helpers.setValue(v !== null && v !== undefined && v !== "" ? Number(v) : null);
  }

  return (
    <Autocomplete
      selectionMode="single"
      variant="secondary"
      value={field.value !== null && field.value !== undefined ? String(field.value) : null}
      onChange={handleChange}
      onBlur={() => helpers.setTouched(true)}
      isInvalid={isInvalid}
      fullWidth
    >
      <Label>{label}</Label>
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
            <ListBox.Item id="" textValue="Không có deck">
              <Label className="text-default-400 italic">Không có deck</Label>
              <ListBox.ItemIndicator />
            </ListBox.Item>
            {decks.map((d) => (
              <ListBox.Item key={d.id} id={String(d.id)} textValue={d.name}>
                <Label>{d.name}</Label>
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
            {onCreateDeck && (
              <ListBox.Item id={CREATE_DECK_KEY} textValue="+ Tạo Deck mới">
                <Label className="text-primary font-medium">+ Tạo Deck mới</Label>
              </ListBox.Item>
            )}
          </ListBox>
        </Autocomplete.Filter>
      </Autocomplete.Popover>
    </Autocomplete>
  );
}
