"use client";

import { useState, useTransition } from "react";
import {
  Table,
  Button,
  Card,
  CardHeader,
  CardContent,
  Modal,
  TextField,
  Label,
  Input,
  FieldError,
  toast,
} from "@heroui/react";
import { TbEdit, TbTrash, TbPlus, TbStack2 } from "react-icons/tb";
import { createDeck, updateDeck, deleteDeck } from "@/app/actions";
import type { Deck } from "@/lib/supabase";

// ── Edit deck modal ───────────────────────────────────────────

function EditDeckModal({ deck }: { deck: Deck }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Modal>
      <Button size="sm" variant="outline" isIconOnly aria-label="Sửa deck">
        <TbEdit size={16} />
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="sm">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Sửa Deck</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <form
                    id={`edit-deck-${deck.id}`}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      const name = fd.get("name") as string;
                      startTransition(async () => {
                        try {
                          await updateDeck(deck.id, name);
                          toast.success("Đã cập nhật deck!");
                          close();
                        } catch (err) {
                          toast.danger(
                            err instanceof Error ? err.message : "Lỗi server"
                          );
                        }
                      });
                    }}
                  >
                    <TextField isRequired name="name" defaultValue={deck.name} className="w-full">
                      <Label>Tên Deck</Label>
                      <Input />
                      <FieldError />
                    </TextField>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" slot="close">
                    Huỷ
                  </Button>
                  <Button
                    type="submit"
                    form={`edit-deck-${deck.id}`}
                    variant="primary"
                    isPending={isPending}
                    isDisabled={isPending}
                  >
                    Lưu
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

// ── Delete deck button ────────────────────────────────────────

function DeleteDeckButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      isDisabled={isPending}
      isPending={isPending}
      aria-label="Xoá deck"
      onPress={() =>
        startTransition(async () => {
          try {
            await deleteDeck(id);
            toast.success("Đã xoá deck!");
          } catch (err) {
            toast.danger(err instanceof Error ? err.message : "Lỗi server");
          }
        })
      }
      className="text-danger"
    >
      <TbTrash size={16} />
    </Button>
  );
}

// ── Main DecksTab ─────────────────────────────────────────────

export function DecksTab({ decks }: { decks: Deck[] }) {
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await createDeck(formData);
        toast.success("Đã thêm deck!");
        setFormKey((k) => k + 1);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Lỗi server";
        setError(msg);
        toast.danger(msg);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Decks table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
              <TbStack2 size={20} className="text-primary" />
              Danh sách Decks ({decks.length})
            </h2>
        </CardHeader>
        <CardContent>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Danh sách decks">
                <Table.Header>
                  <Table.Column isRowHeader>Tên Deck</Table.Column>
                  <Table.Column>Ngày tạo</Table.Column>
                  <Table.Column>Thao tác</Table.Column>
                </Table.Header>
                <Table.Body
                  items={decks}
                  renderEmptyState={() => (
                    <p className="py-6 text-center text-sm text-default-500">
                      Chưa có deck nào. Hãy tạo deck mới bên dưới!
                    </p>
                  )}
                >
                  {(deck) => (
                    <Table.Row id={deck.id}>
                      <Table.Cell>
                        <span className="font-medium">{deck.name}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-default-500">
                          {new Date(deck.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <EditDeckModal deck={deck} />
                          <DeleteDeckButton id={deck.id} />
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </CardContent>
      </Card>

      {/* Add deck form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
              <TbPlus size={20} className="text-primary" />
              Thêm Deck mới
            </h2>
        </CardHeader>
        <CardContent>
          <form key={formKey} onSubmit={handleAdd} className="flex flex-col gap-4">
            <TextField isRequired name="name" className="w-full">
              <Label>Tên Deck</Label>
              <Input placeholder="Nhập tên deck..." />
              <FieldError />
            </TextField>

            {error && (
              <p className="text-sm text-danger">{error}</p>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                isPending={isPending}
                isDisabled={isPending}
              >
                <TbPlus size={16} />
                Tạo Deck
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
