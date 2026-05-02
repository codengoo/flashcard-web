"use client";

import { useEffect, useRef } from "react";
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type VisibilityState,
  type Row,
  type Cell,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  Button,
  Card,
  CardHeader,
  CardContent,
  Modal,
  useOverlayState,
} from "@heroui/react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { TbEdit, TbTrash, TbPlus, TbStack2, TbColumns, TbInbox } from "react-icons/tb";
import { useDeckActions } from "@/app/hooks/useDeckActions";
import { FormField } from "@/app/components/ui/FormField";
import type { Deck } from "@/lib/supabase";

const deckSchema = Yup.object({
  name: Yup.string().required("Tên deck là bắt buộc"),
});

// ── Column definitions ────────────────────────────────────────

const columnHelper = createColumnHelper<Deck>();

const DECK_COLUMNS = [
  columnHelper.accessor("name", { id: "name", header: "Tên Deck", enableHiding: false }),
  columnHelper.accessor("created_at", { id: "created_at", header: "Ngày tạo" }),
  columnHelper.display({ id: "actions", header: "Thao tác", enableHiding: false }),
];

// ── Column visibility toggle ──────────────────────────────────

function ColumnVisibilityToggle({
  table,
}: {
  table: ReturnType<typeof useReactTable<Deck>>;
}) {
  const [open, setOpen] = useState(false);
  const hidable = table.getAllLeafColumns().filter((c) => c.columnDef.enableHiding !== false);

  if (hidable.length === 0) return null;

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

// ── Edit deck modal ───────────────────────────────────────────

function EditDeckModal({ deck }: { deck: Deck }) {
  const state = useOverlayState({ defaultOpen: false });
  const { edit, isPending } = useDeckActions();

  return (
    <>
      <Button size="sm" variant="outline" isIconOnly aria-label="Sửa deck" onPress={state.open}>
        <TbEdit size={16} />
      </Button>
      <Modal>
        <Modal.Backdrop isOpen={state.isOpen} onOpenChange={state.toggle}>
          <Modal.Container size="sm">
            <Modal.Dialog>
              {({ close }) => (
                <Formik
                  initialValues={{ name: deck.name }}
                  validationSchema={deckSchema}
                  enableReinitialize
                  onSubmit={(values) => edit(deck.id, values.name, close)}
                >
                  <Form id={`edit-deck-${deck.id}`}>
                    <Modal.CloseTrigger />
                    <Modal.Header>
                      <Modal.Heading>Sửa Deck</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body>
                      <FormField
                        name="name"
                        label="Tên Deck"
                        isRequired
                        placeholder="Nhập tên deck..."
                      />
                    </Modal.Body>
                    <Modal.Footer>
                      <Button type="button" variant="ghost" onPress={close}>
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

// ── Delete deck button ────────────────────────────────────────

function DeleteDeckButton({ id }: { id: number }) {
  const { remove, isPending } = useDeckActions();
  return (
    <Button
      size="sm"
      variant="ghost"
      isDisabled={isPending}
      isPending={isPending}
      aria-label="Xoá deck"
      onPress={() => remove(id)}
      className="text-danger"
    >
      <TbTrash size={16} />
    </Button>
  );
}

// ── Main DecksTab ─────────────────────────────────────────────

interface Props {
  decks: Deck[];
  addDeckFocusTrigger?: number;
}

export function DecksTab({ decks, addDeckFocusTrigger = 0 }: Props) {
  const { add, isPending } = useDeckActions();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const addFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (addDeckFocusTrigger > 0) {
      setTimeout(() => {
        const el = addFormRef.current;
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          const input = el.querySelector<HTMLInputElement>("input");
          input?.focus();
        }
      }, 150);
    }
  }, [addDeckFocusTrigger]);

  const tanTable = useReactTable({
    data: decks,
    columns: DECK_COLUMNS,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

  function renderCell(colId: string, deck: Deck) {
    switch (colId) {
      case "name":
        return <span className="font-medium">{deck.name}</span>;
      case "created_at":
        return (
          <span className="text-sm text-default-500">
            {new Date(deck.created_at).toLocaleDateString("vi-VN")}
          </span>
        );
      case "actions":
        return (
          <div className="flex items-center gap-2">
            <EditDeckModal deck={deck} />
            <DeleteDeckButton id={deck.id} />
          </div>
        );
      default:
        return null;
    }
  }

  const visibleCols = tanTable.getVisibleLeafColumns();

  return (
    <div className="flex flex-col gap-6">
      {/* Decks table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TbStack2 size={20} className="text-primary" />
              Danh sách Decks ({decks.length})
            </h2>
            <ColumnVisibilityToggle table={tanTable} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <Table.ResizableContainer>
              <Table.Content aria-label="Danh sách decks">
                <Table.Header columns={visibleCols}>
                  {(col) => (
                    <Table.Column id={col.id} isRowHeader={col.id === "name"}>
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
                  items={tanTable.getRowModel().rows as Row<Deck>[]}
                  renderEmptyState={() => (
                    <div className="py-12 flex flex-col items-center gap-3 text-default-400">
                      <TbInbox size={40} className="text-default-300" />
                      <div className="text-center">
                        <p className="font-medium text-sm">Chưa có deck nào</p>
                        <p className="text-xs mt-1 text-default-300">
                          Hãy tạo deck mới bên dưới
                        </p>
                      </div>
                    </div>
                  )}
                >
                  {(row: Row<Deck>) => (
                    <Table.Row id={row.original.id}>
                      <Table.Collection items={row.getVisibleCells() as Cell<Deck, unknown>[]}>
                        {(cell: Cell<Deck, unknown>) => (
                          <Table.Cell>{renderCell(cell.column.id, row.original)}</Table.Cell>
                        )}
                      </Table.Collection>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ResizableContainer>
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
          <div ref={addFormRef}>
            <Formik
              initialValues={{ name: "" }}
              validationSchema={deckSchema}
              onSubmit={(values, { resetForm }) => {
                add(values.name, resetForm);
              }}
            >
              <Form className="flex flex-col gap-4">
                <FormField name="name" label="Tên Deck" isRequired placeholder="Nhập tên deck..." />
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
              </Form>
            </Formik>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
