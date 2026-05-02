"use client";

import { useState, useTransition, useRef } from "react";
import {
  Table,
  Button,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Modal,
  TextField,
  Label,
  Input,
  TextArea,
  FieldError,
  toast,
} from "@heroui/react";
import { createTerm, updateTerm, deleteTerm } from "@/app/actions";
import type { Term, Deck } from "@/lib/supabase";

// ── Edit term modal ──────────────────────────────────────────

function EditTermModal({ term, decks }: { term: Term; decks: Deck[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Modal>
      <Button size="sm" variant="outline">
        Sửa
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading>Sửa Term</Modal.Heading>
                </Modal.Header>
                <Modal.Body className="flex flex-col gap-4">
                  <form
                    id={`edit-term-${term.id}`}
                    onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      startTransition(async () => {
                        try {
                          await updateTerm(term.id, {
                            term: fd.get("term") as string,
                            definition: fd.get("definition") as string,
                            example: (fd.get("example") as string) || null,
                            deck_id: fd.get("deck_id")
                              ? Number(fd.get("deck_id"))
                              : null,
                          });
                          toast.success("Đã cập nhật term!");
                          close();
                        } catch (err) {
                          toast.danger(
                            err instanceof Error ? err.message : "Lỗi server"
                          );
                        }
                      });
                    }}
                    className="flex flex-col gap-4"
                  >
                    <TextField isRequired name="term" defaultValue={term.term} className="w-full">
                      <Label>Term</Label>
                      <Input />
                      <FieldError />
                    </TextField>

                    <TextField
                      isRequired
                      name="definition"
                      defaultValue={term.definition}
                      className="w-full"
                    >
                      <Label>Definition</Label>
                      <TextArea rows={3} />
                      <FieldError />
                    </TextField>

                    <TextField
                      name="example"
                      defaultValue={term.example ?? ""}
                      className="w-full"
                    >
                      <Label>Example</Label>
                      <TextArea rows={2} />
                    </TextField>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-foreground">
                        Deck
                      </label>
                      <select
                        name="deck_id"
                        defaultValue={term.deck_id ?? ""}
                        className="w-full rounded-lg border border-default-300 bg-default-100 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Không có deck</option>
                        {decks.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" slot="close">
                    Huỷ
                  </Button>
                  <Button
                    type="submit"
                    form={`edit-term-${term.id}`}
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

// ── Delete term button ────────────────────────────────────────

function DeleteTermButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="ghost"
      isDisabled={isPending}
      isPending={isPending}
      aria-label="Xoá term"
      onPress={() =>
        startTransition(async () => {
          try {
            await deleteTerm(id);
            toast.success("Đã xoá term!");
          } catch (err) {
            toast.danger(err instanceof Error ? err.message : "Lỗi server");
          }
        })
      }
      className="text-danger"
    >
      Xoá
    </Button>
  );
}

// ── Main TermsTab ─────────────────────────────────────────────

interface Props {
  terms: Term[];
  decks: Deck[];
  currentDeck: Deck | null;
}

export function TermsTab({ terms, decks, currentDeck }: Props) {
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await createTerm(formData);
        toast.success("Đã thêm term!");
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
      {/* Terms table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Danh sách Terms ({terms.length})</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Danh sách terms">
                <Table.Header>
                  <Table.Column isRowHeader>Term</Table.Column>
                  <Table.Column>Definition</Table.Column>
                  <Table.Column>Example</Table.Column>
                  <Table.Column>Deck</Table.Column>
                  <Table.Column>Ngày tạo</Table.Column>
                  <Table.Column>Thao tác</Table.Column>
                </Table.Header>
                <Table.Body
                  items={terms}
                  renderEmptyState={() => (
                    <p className="py-6 text-center text-sm text-default-500">
                      Chưa có term nào. Hãy thêm mới bên dưới!
                    </p>
                  )}
                >
                  {(term) => (
                    <Table.Row id={term.id}>
                      <Table.Cell>
                        <span className="font-medium">{term.term}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="line-clamp-2 max-w-48">{term.definition}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="line-clamp-2 max-w-48 text-default-500">
                          {term.example ?? "—"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {term.deck ? (
                          <Chip size="sm" variant="secondary">
                            {term.deck.name}
                          </Chip>
                        ) : (
                          <span className="text-default-400 text-sm">—</span>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-default-500">
                          {new Date(term.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          <EditTermModal term={term} decks={decks} />
                          <DeleteTermButton id={term.id} />
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

      {/* Add term form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold">Thêm Term mới</h2>
            <div className="flex items-center gap-2 text-sm text-default-500">
              Đang thêm vào:
              {currentDeck ? (
                <Chip size="sm" variant="primary">
                  {currentDeck.name}
                </Chip>
              ) : (
                <Chip size="sm" variant="tertiary">
                  Không có deck
                </Chip>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form key={formKey} onSubmit={handleAdd} className="flex flex-col gap-4">
            {currentDeck && (
              <input type="hidden" name="deck_id" value={currentDeck.id} />
            )}

            <TextField isRequired name="term" className="w-full">
              <Label>Term</Label>
              <Input placeholder="Nhập từ hoặc cụm từ..." />
              <FieldError />
            </TextField>

            <TextField isRequired name="definition" className="w-full">
              <Label>Definition</Label>
              <TextArea
                rows={3}
                placeholder="Nhập định nghĩa..."
              />
              <FieldError />
            </TextField>

            <TextField name="example" className="w-full">
              <Label>Example (tuỳ chọn)</Label>
              <TextArea
                rows={2}
                placeholder="Nhập ví dụ..."
              />
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
                Thêm Term
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
