"use client";

import { useState, useTransition } from "react";
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
  Pagination,
  toast,
} from "@heroui/react";
import { TbEdit, TbTrash, TbPlus, TbFilter, TbLayersIntersect } from "react-icons/tb";
import { createTerm, updateTerm, deleteTerm } from "@/app/actions";
import type { Term, Deck } from "@/lib/supabase";

const PAGE_SIZE = 10;

// ── Pagination helpers ────────────────────────────────────────

function buildPageList(current: number, total: number): Array<number | "e"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | "e"> = [1];
  if (current > 3) pages.push("e");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("e");
  pages.push(total);
  return pages;
}

function TermsPagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center pt-3">
      <Pagination>
        <Pagination.Content>
          <Pagination.Item>
            <Pagination.Previous isDisabled={page === 1} onPress={() => onChange(page - 1)}>
              <Pagination.PreviousIcon /><span>Trước</span>
            </Pagination.Previous>
          </Pagination.Item>
          {buildPageList(page, total).map((p, i) =>
            p === "e" ? (
              <Pagination.Item key={`e${i}`}><Pagination.Ellipsis /></Pagination.Item>
            ) : (
              <Pagination.Item key={p}>
                <Pagination.Link isActive={p === page} onPress={() => onChange(p as number)}>{p}</Pagination.Link>
              </Pagination.Item>
            )
          )}
          <Pagination.Item>
            <Pagination.Next isDisabled={page === total} onPress={() => onChange(page + 1)}>
              <span>Sau</span><Pagination.NextIcon />
            </Pagination.Next>
          </Pagination.Item>
        </Pagination.Content>
      </Pagination>
    </div>
  );
}

// ── Edit term modal ───────────────────────────────────────────

function EditTermModal({ term, decks }: { term: Term; decks: Deck[] }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Modal>
      <Button size="sm" variant="outline" isIconOnly aria-label="Sửa term">
        <TbEdit size={16} />
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog>
            {({ close }) => (
              <>
                <Modal.CloseTrigger />
                <Modal.Header><Modal.Heading>Sửa Term</Modal.Heading></Modal.Header>
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
                            deck_id: fd.get("deck_id") ? Number(fd.get("deck_id")) : null,
                          });
                          toast.success("Đã cập nhật term!");
                          close();
                        } catch (err) {
                          toast.danger(err instanceof Error ? err.message : "Lỗi server");
                        }
                      });
                    }}
                    className="flex flex-col gap-4"
                  >
                    <TextField isRequired name="term" defaultValue={term.term} className="w-full">
                      <Label>Term</Label><Input /><FieldError />
                    </TextField>
                    <TextField isRequired name="definition" defaultValue={term.definition} className="w-full">
                      <Label>Definition</Label><TextArea rows={3} /><FieldError />
                    </TextField>
                    <TextField name="example" defaultValue={term.example ?? ""} className="w-full">
                      <Label>Example</Label><TextArea rows={2} />
                    </TextField>
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-foreground">Deck</label>
                      <select
                        name="deck_id"
                        defaultValue={term.deck_id ?? ""}
                        className="w-full rounded-lg border border-default-300 bg-default-100 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Không có deck</option>
                        {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <Button type="button" variant="ghost" slot="close">Huỷ</Button>
                  <Button type="submit" form={`edit-term-${term.id}`} variant="primary" isPending={isPending} isDisabled={isPending}>Lưu</Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

// ── Delete button ─────────────────────────────────────────────

function DeleteTermButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();
  return (
    <Button
      size="sm" variant="ghost" isIconOnly
      isDisabled={isPending} isPending={isPending}
      aria-label="Xoá term"
      onPress={() => startTransition(async () => {
        try { await deleteTerm(id); toast.success("Đã xoá term!"); }
        catch (err) { toast.danger(err instanceof Error ? err.message : "Lỗi server"); }
      })}
      className="text-danger"
    >
      <TbTrash size={16} />
    </Button>
  );
}

// ── Main TermsTab ─────────────────────────────────────────────

interface Props { terms: Term[]; decks: Deck[]; currentDeck: Deck | null; }

export function TermsTab({ terms, decks, currentDeck }: Props) {
  const [isPending, startTransition] = useTransition();
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [filterDeckIds, setFilterDeckIds] = useState<Set<number>>(new Set());

  // Sort newest first
  const sorted = [...terms].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Filter by selected decks (multi-select)
  const filtered =
    filterDeckIds.size === 0
      ? sorted
      : sorted.filter((t) => t.deck_id !== null && filterDeckIds.has(t.deck_id));

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function toggleDeckFilter(id: number) {
    setFilterDeckIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setPage(1);
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Explicitly set deck_id from prop to avoid hidden-input rendering race
    if (currentDeck) formData.set("deck_id", String(currentDeck.id));
    else formData.delete("deck_id");
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
      {/* Terms table card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <TbLayersIntersect size={20} className="text-primary" />
                Danh sách Terms
                <span className="text-sm font-normal text-default-400">
                  ({filtered.length}/{terms.length})
                </span>
              </h2>
            </div>

            {/* Multi-select deck filter */}
            {decks.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-default-500 flex items-center gap-1">
                  <TbFilter size={14} /> Lọc theo deck:
                </span>
                {decks.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleDeckFilter(d.id)}
                    className="focus:outline-none"
                  >
                    <Chip
                      size="sm"
                      variant={filterDeckIds.has(d.id) ? "primary" : "soft"}
                      className="cursor-pointer"
                    >
                      {d.name}
                    </Chip>
                  </button>
                ))}
                {filterDeckIds.size > 0 && (
                  <button
                    type="button"
                    onClick={() => { setFilterDeckIds(new Set()); setPage(1); }}
                    className="text-xs text-default-400 hover:text-foreground underline"
                  >
                    Xoá lọc
                  </button>
                )}
              </div>
            )}
          </div>
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
                  items={paged}
                  renderEmptyState={() => (
                    <p className="py-8 text-center text-sm text-default-500">
                      {filterDeckIds.size > 0
                        ? "Không có term nào trong deck đã chọn."
                        : "Chưa có term nào. Hãy thêm mới bên dưới!"}
                    </p>
                  )}
                >
                  {(term) => (
                    <Table.Row id={term.id}>
                      <Table.Cell><span className="font-semibold">{term.term}</span></Table.Cell>
                      <Table.Cell><span className="line-clamp-2 max-w-48 text-sm">{term.definition}</span></Table.Cell>
                      <Table.Cell><span className="line-clamp-2 max-w-40 text-sm text-default-500">{term.example ?? "—"}</span></Table.Cell>
                      <Table.Cell>
                        {term.deck
                          ? <Chip size="sm" variant="secondary">{term.deck.name}</Chip>
                          : <span className="text-default-400 text-sm">—</span>}
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-default-500 whitespace-nowrap">
                          {new Date(term.created_at).toLocaleDateString("vi-VN")}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-1">
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

          <TermsPagination page={safePage} total={totalPages} onChange={setPage} />
          {filtered.length > 0 && (
            <p className="text-center text-xs text-default-400 pt-1">
              Trang {safePage}/{totalPages} &middot; {filtered.length} terms
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add term form card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TbPlus size={20} className="text-primary" />
              Thêm Term mới
            </h2>
            <div className="flex items-center gap-2 text-sm text-default-500">
              Đang thêm vào:
              {currentDeck
                ? <Chip size="sm" variant="primary">{currentDeck.name}</Chip>
                : <Chip size="sm" variant="tertiary">Không có deck</Chip>}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form key={formKey} onSubmit={handleAdd} className="flex flex-col gap-4">
            <TextField isRequired name="term" className="w-full">
              <Label>Term</Label>
              <Input placeholder="Nhập từ hoặc cụm từ..." />
              <FieldError />
            </TextField>
            <TextField isRequired name="definition" className="w-full">
              <Label>Definition</Label>
              <TextArea rows={3} placeholder="Nhập định nghĩa..." />
              <FieldError />
            </TextField>
            <TextField name="example" className="w-full">
              <Label>Example (tuỳ chọn)</Label>
              <TextArea rows={2} placeholder="Nhập ví dụ..." />
            </TextField>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex justify-end">
              <Button type="submit" variant="primary" isPending={isPending} isDisabled={isPending}>
                <TbPlus size={16} />
                Thêm Term
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
