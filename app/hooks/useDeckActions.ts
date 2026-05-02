"use client";

import { useTransition } from "react";
import { toast } from "@heroui/react";
import { createDeck, updateDeck, deleteDeck } from "@/app/actions";

export function useDeckActions() {
  const [isPending, startTransition] = useTransition();

  function add(name: string, onSuccess?: () => void) {
    startTransition(async () => {
      try {
        await createDeck(name);
        toast.success("Đã tạo deck!");
        onSuccess?.();
      } catch (err) {
        toast.danger(err instanceof Error ? err.message : "Lỗi server");
      }
    });
  }

  function edit(id: number, name: string, onSuccess?: () => void) {
    startTransition(async () => {
      try {
        await updateDeck(id, name);
        toast.success("Đã cập nhật deck!");
        onSuccess?.();
      } catch (err) {
        toast.danger(err instanceof Error ? err.message : "Lỗi server");
      }
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      try {
        await deleteDeck(id);
        toast.success("Đã xoá deck!");
      } catch (err) {
        toast.danger(err instanceof Error ? err.message : "Lỗi server");
      }
    });
  }

  return { add, edit, remove, isPending };
}
