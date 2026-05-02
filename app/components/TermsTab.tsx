"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type VisibilityState,
  type Row,
  type Cell,
} from "@tanstack/react-table";
import {
  Table,
  Button,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Modal,
  Pagination,
  useOverlayState,
} from "@heroui/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { TbEdit, TbTrash, TbPlus, TbFilter, TbLayersIntersect, TbColumns, TbInbox } from "react-icons/tb";
import { useTermActions } from "@/app/hooks/useTermActions";
import { FormField } from "@/app/components/ui/FormField";
import { DeckSelectField } from "@/app/components/ui/DeckSelectField";
import { DeckFilterAutocomplete } from "@/app/components/ui/DeckFilterAutocomplete";
import type { Term, Deck } from "@/lib/supabase";

const PAGE_SIZE = 10;

const termSchema = Yup.object({
  term: Yup.string().required("Term là bắt buộc"),
  definition: Yup.string().required("Definition là bắt buộc"),
  example: Yup.string(),
  deck_id: Yup.number().nullable().default(null),
});

// ── Column definitions ────────────────────────────────────────

const columnHelper = createColumnHelper<Term>();

const TERM_COLUMNS = [
  columnHelper.accessor("term", { id: "term", header: "Term", enableHiding: false }),
  columnHelper.accessor("definition", { id: "definition", header: "Definition" }),
  columnHelper.accessor("example", { id: "example", header: "Example" }),
  columnHelper.accessor((row) => row.deck?.name ?? null, { id: "deck", header: "Deck" }),
  columnHelper.accessor("created_at", { id: "created_at", header: "Ngày tạo" }),
  columnHelper.display({ id: "actions", header: "Thao tác", enableHiding: false }),
];

// ── Page list helper ──────────────────────────────────────────

function buildPageList(current: number, total: number): Array<number | "e"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | "e"> = [1];
  if (current > 3) pages.push("e");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++)
    pages.push(i);
  if (current < total - 2) pages.push("e");
  pages.push(total);
  return pages;
}

// ── Column visibility toggle ──────────────────────────────────

function ColumnVisibilityToggle({
  table,
}: {
  table: ReturnType<typeof useReactTable<Term>>;
}) {
  const [open, setOpen] = useState(false);
  const hidable = table.getAllLeafColumns().filter((c) => c.columnDef.enableHiding !== false);

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        onPress={() => setOpen((v) => !v)}
        className="gap-1 text-xs"
      >
        <TbColumns size={14} />
        Cột
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg p-3 flex flex-col gap-2 shadow-lg min-w-44">
            {hidable.map((col) => (
              <label
                key={col.id}
                className="flex items-center gap-2 text-sm cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={col.getIsVisible()}
                  onChange={() => col.toggleVisibility()}
                  className="rounded"
                />
                {col.columnDef.header as string}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Edit term modal ───────────────────────────────────────────

function EditTermModal({ term, decks }: { term: Term; decks: Deck[] }) {
  const state = useOverlayState({ defaultOpen: false });
  const { edit, isPending } = useTermActions();

  const initialValues = {
    term: term.term,
    definition: term.definition,
    example: term.example ?? "",
    deck_id: term.deck_id,
  };

  return (
    <>
      <Button size="sm" variant="outline" isIconOnly aria-label="Sửa term" onPress={state.open}>
        <TbEdit size={16} />
      </Button>
      <Modal>
        <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.toggle}>
          <Modal.Container size="md">
            <Modal.Dialog>
              {({ close }) => (
                <Formik
                  initialValues={initialValues}
                  validationSchema={termSchema}
                  enableReinitialize
                  onSubmit={(values) => {
                    edit(term.id, { ...values, deck_id: values.deck_id ?? null }, close);
                  }}
                >
                  <Form id={`edit-term-${term.id}`}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>Sửa Term</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="flex flex-col gap-4">
                      <FormField name="term" label="Term" isRequired placeholder="Nhập từ hoặc cụm từ..." />
                      <FormField
                        name="definition"
                        label="Definition"
                        isRequired
                        as="textarea"
                        rows={3}
                        placeholder="Nhập định nghĩa..."
                      />
                      <FormField
                        name="example"
                        label="Example"
                        as="textarea"
                        rows={2}
                        placeholder="Nhập ví dụ (tuỳ chọn)..."
                      />
                      <DeckSelectField name="deck_id" label="Deck" decks={decks} />
                    </Modal.Body>
                    <Modal.Footer>
                      <Button type="button" variant="ghost" onPress={close}>
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
                  </Form>
                </Formik>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

// ── Delete button ─────────────────────────────────────────────

function DeleteTermButton({ id }: { id: number }) {
  const { remove, isPending } = useTermActions();
  return (
    <Button
      size="sm"
      variant="ghost"
      isIconOnly
      isDisabled={isPending}
      isPending={isPending}
      aria-label="Xoá term"
      onPress={() => remove(id)}
      className="text-danger"
    >
      <TbTrash size={16} />
    </Button>
  );
}

// ── Main TermsTab ─────────────────────────────────────────────

interface Props {
  terms: Term[];
  decks: Deck[];
  onGoToDecks: () => void;
}

export function TermsTab({ terms, decks, onGoToDecks }: Props) {
  const { add, isPending } = useTermActions();
  const [page, setPage] = useState(1);
  const [filterDeckIds, setFilterDeckIds] = useState<string[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const defaultDeckId = decks[0]?.id ?? null;

  const sorted = useMemo(
    () =>
      [...terms].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [terms]
  );

  const filtered = useMemo(
    () =>
      filterDeckIds.length === 0
        ? sorted
        : sorted.filter((t) => t.deck_id !== null && filterDeckIds.includes(String(t.deck_id))),
    [sorted, filterDeckIds]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage]
  );

  const tanTable = useReactTable({
    data: paged,
    columns: TERM_COLUMNS,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  function handleFilterChange(ids: string[]) {
    setFilterDeckIds(ids);
    setPage(1);
  }

  function renderCell(colId: string, term: Term) {
    switch (colId) {
      case "term":
        return <span className="font-semibold">{term.term}</span>;
      case "definition":
        return <span className="line-clamp-2 max-w-48 text-sm">{term.definition}</span>;
      case "example":
        return (
          <span className="line-clamp-2 max-w-40 text-sm text-default-500">
            {term.example ?? "—"}
          </span>
        );
      case "deck":
        return term.deck ? (
          <Chip size="sm" variant="secondary">
            {term.deck.name}
          </Chip>
        ) : (
          <span className="text-default-400 text-sm">—</span>
        );
      case "created_at":
        return (
          <span className="text-sm text-default-500 whitespace-nowrap">
            {new Date(term.created_at).toLocaleDateString("vi-VN")}
          </span>
        );
      case "actions":
        return (
          <div className="flex items-center gap-1">
            <EditTermModal term={term} decks={decks} />
            <DeleteTermButton id={term.id} />
          </div>
        );
      default:
        return null;
    }
  }

  const addInitialValues = {
    term: "",
    definition: "",
    example: "",
    deck_id: defaultDeckId,
  };

  const visibleCols = tanTable.getVisibleLeafColumns();

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
              <ColumnVisibilityToggle table={tanTable} />
            </div>

            {/* Deck filter */}
            {decks.length > 0 && (
              <div className="flex items-center gap-2">
                <TbFilter size={14} className="text-default-400 shrink-0" />
                <div className="w-60">
                  <DeckFilterAutocomplete
                    decks={decks}
                    value={filterDeckIds}
                    onChange={handleFilterChange}
                  />
                </div>
                {filterDeckIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleFilterChange([])}
                    className="text-xs text-default-400 hover:text-foreground underline whitespace-nowrap"
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
            <Table.ResizableContainer>
              <Table.Content aria-label="Danh sách terms">
                <Table.Header columns={visibleCols}>
                  {(col) => (
                    <Table.Column id={col.id} isRowHeader={col.id === "term"}>
                      {() => (
                        <>
                          {col.columnDef.header as string}
                          {col.id !== "actions" && <Table.ColumnResizer />}
                        </>
                      )}
                    </Table.Column>
                  )}
                </Table.Header>
                <Table.Body
                  items={tanTable.getRowModel().rows as Row<Term>[]}
                  renderEmptyState={() => (
                    <div className="py-12 flex flex-col items-center gap-3 text-default-400">
                      <TbInbox size={40} className="text-default-300" />
                      <div className="text-center">
                        <p className="font-medium text-sm">
                          {filterDeckIds.length > 0 ? "Không có term nào" : "Chưa có term nào"}
                        </p>
                        <p className="text-xs mt-1 text-default-300">
                          {filterDeckIds.length > 0
                            ? "Thử thay đổi bộ lọc"
                            : "Hãy thêm term mới bên dưới"}
                        </p>
                      </div>
                    </div>
                  )}
                >
                  {(row: Row<Term>) => (
                    <Table.Row id={row.original.id}>
                      <Table.Collection items={row.getVisibleCells() as Cell<Term, unknown>[]}>
                        {(cell: Cell<Term, unknown>) => (
                          <Table.Cell>{renderCell(cell.column.id, row.original)}</Table.Cell>
                        )}
                      </Table.Collection>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ResizableContainer>

            {totalPages > 1 && (
              <Table.Footer>
                <div className="flex items-center justify-between w-full px-2 py-1">
                  <span className="text-xs text-default-400">
                    Trang {safePage}/{totalPages} &middot; {filtered.length} terms
                  </span>
                  <Pagination>
                    <Pagination.Content>
                      <Pagination.Item>
                        <Pagination.Previous
                          isDisabled={safePage === 1}
                          onPress={() => setPage((p) => p - 1)}
                        >
                          <Pagination.PreviousIcon />
                        </Pagination.Previous>
                      </Pagination.Item>
                      {buildPageList(safePage, totalPages).map((p, i) =>
                        p === "e" ? (
                          <Pagination.Item key={`e${i}`}>
                            <Pagination.Ellipsis />
                          </Pagination.Item>
                        ) : (
                          <Pagination.Item key={p}>
                            <Pagination.Link
                              isActive={p === safePage}
                              onPress={() => setPage(p as number)}
                            >
                              {p}
                            </Pagination.Link>
                          </Pagination.Item>
                        )
                      )}
                      <Pagination.Item>
                        <Pagination.Next
                          isDisabled={safePage === totalPages}
                          onPress={() => setPage((p) => p + 1)}
                        >
                          <Pagination.NextIcon />
                        </Pagination.Next>
                      </Pagination.Item>
                    </Pagination.Content>
                  </Pagination>
                </div>
              </Table.Footer>
            )}
          </Table>
        </CardContent>
      </Card>

      {/* Add term form card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TbPlus size={20} className="text-primary" />
            Thêm Term mới
          </h2>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={addInitialValues}
            validationSchema={termSchema}
            enableReinitialize
            onSubmit={(values, { resetForm }) => {
              add({ ...values, deck_id: values.deck_id ?? null }, resetForm);
            }}
          >
            <Form className="flex flex-col gap-4">
              <FormField name="term" label="Term" isRequired placeholder="Nhập từ hoặc cụm từ..." />
              <FormField
                name="definition"
                label="Definition"
                isRequired
                as="textarea"
                rows={3}
                placeholder="Nhập định nghĩa..."
              />
              <FormField
                name="example"
                label="Example"
                as="textarea"
                rows={2}
                placeholder="Nhập ví dụ (tuỳ chọn)..."
              />
              <DeckSelectField
                name="deck_id"
                label="Deck"
                decks={decks}
                onCreateDeck={onGoToDecks}
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isPending={isPending}
                  isDisabled={isPending}
                >
                  <TbPlus size={16} />
                  Thêm Term
                </Button>
              </div>
            </Form>
          </Formik>
        </CardContent>
      </Card>
    </div>
  );
}
