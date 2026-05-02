"use client";

import { useTransition } from "react";
import { toast } from "@heroui/react";
import { createTerm, updateTerm, deleteTerm } from "@/app/actions";

interface TermValues {
  term: string;
  definition: string;
  example: string;
  deck_id: number | null;
}

export function useTermActions() {
  const [isPending, startTransition] = useTransition();

  function add(values: TermValues, onSuccess?: () => void) {
    startTransition(async () => {
      try {
        await createTerm({ ...values, example: values.example || null });
        toast.success("Đã thêm term!");
        onSuccess?.();
      } catch (err) {
        toast.danger(err instanceof Error ? err.message : "Lỗi server");
      }
    });
  }

  function edit(id: number, values: TermValues, onSuccess?: () => void) {
    startTransition(async () => {
      try {
        await updateTerm(id, { ...values, example: values.example || null });
        toast.success("Đã cập nhật term!");
        onSuccess?.();
      } catch (err) {
        toast.danger(err instanceof Error ? err.message : "Lỗi server");
      }
    });
  }

  function remove(id: number) {
    startTransition(async () => {
      try {
        await deleteTerm(id);
        toast.success("Đã xoá term!");
      } catch (err) {
        toast.danger(err instanceof Error ? err.message : "Lỗi server");
      }
    });
  }

  return { add, edit, remove, isPending };
}
