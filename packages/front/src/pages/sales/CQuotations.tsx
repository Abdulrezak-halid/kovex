import { useState } from "react";
import {
  useListQuotations,
  useCreateQuotation,
  useUpdateQuotation,
  useDeleteQuotation,
  useConvertQuotationToOrder,
  useListCustomers,
  useListProducts,
  getListQuotationsQueryKey,
  getListOrdersQueryKey,
} from "@sme-erp/api-client";
import type { Quotation, QuotationInput } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { CPageHeader } from "@/components/CPageHeader";
import { CDataTable } from "@/components/CDataTable";
import { CListQueryControls } from "@/components/CListQueryControls";
import { CStatusBadge } from "@/components/CStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusOptions = ["draft", "sent", "accepted", "rejected"];
const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n),
  );

export default function CQuotations() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(100);
  const [items, setItems] = useState<
    {
      productId: number;
      productName: string;
      quantity: number;
      unitPrice: number;
    }[]
  >([]);

  const qc = useQueryClient();
  const { toast } = useToast();

  const listParams = {
    search: search || undefined,
    sortBy,
    sortOrder,
    limit,
  };
  const { data, isLoading } = useListQuotations(listParams);
  const { data: customers } = useListCustomers();
  const { data: products } = useListProducts();
  const createMutation = useCreateQuotation();
  const updateMutation = useUpdateQuotation();
  const deleteMutation = useDeleteQuotation();
  const convertMutation = useConvertQuotationToOrder();

  function openCreate() {
    setEditing(null);
    setCustomerId("");
    setStatus("draft");
    setNotes("");
    setItems([]);
    setDialogOpen(true);
  }

  function openEdit(row: Quotation) {
    setEditing(row);
    setCustomerId(String(row.customerId));
    setStatus(row.status);
    setNotes(row.notes ?? "");
    setItems(
      row.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    );
    setDialogOpen(true);
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { productId: 0, productName: "", quantity: 1, unitPrice: 0 },
    ]);
  }

  function updateItem(idx: number, field: string, value: string | number) {
    setItems((prev) => {
      const next = [...prev];
      if (field === "productId") {
        const p = products?.find((p) => p.id === Number(value));
        next[idx] = {
          ...next[idx],
          productId: Number(value),
          productName: p?.name ?? "",
          unitPrice: Number(p?.price ?? 0),
        };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  }

  async function handleSave() {
    const payload: QuotationInput = {
      customerId: Number(customerId),
      notes: notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    } as any;
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: { status, notes, items: payload.items } as any,
        });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }
      toast({ title: editing ? "Quotation updated" : "Quotation created" });
      qc.invalidateQueries({ queryKey: getListQuotationsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Quotation deleted" });
      qc.invalidateQueries({ queryKey: getListQuotationsQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  async function handleConvert(id: number) {
    try {
      await convertMutation.mutateAsync({ id } as any);
      toast({ title: "Converted to order" });
      qc.invalidateQueries({ queryKey: getListQuotationsQueryKey() });
      qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  const columns = [
    {
      header: "Reference",
      cell: (r: Quotation) => (
        <span className="font-medium font-mono text-sm">{r.reference}</span>
      ),
    },
    { header: "Customer", cell: (r: Quotation) => r.customerName },
    {
      header: "Status",
      cell: (r: Quotation) => <CStatusBadge status={r.status} />,
    },
    {
      header: "Total",
      cell: (r: Quotation) => (
        <span className="font-medium">{fmt(r.totalAmount)}</span>
      ),
    },
    {
      header: "Date",
      cell: (r: Quotation) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (r: Quotation) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => openEdit(r)}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {(r.status === "accepted" || r.status === "draft") && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-primary"
              onClick={() => handleConvert(r.id)}
              title="Convert to Order"
            >
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteId(r.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: "w-28",
    },
  ];

  return (
    <div className="p-6">
      <CPageHeader
        title="Quotations"
        description="Manage quotations and convert to orders"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Quotation
          </Button>
        }
      />
      <CListQueryControls
        search={search}
        onSearchChange={setSearch}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        limit={limit}
        onLimitChange={setLimit}
        sortOptions={[
          { value: "createdAt", label: "Date" },
          { value: "totalAmount", label: "Total" },
          { value: "customerName", label: "Customer" },
          { value: "status", label: "Status" },
          { value: "reference", label: "Reference" },
        ]}
      />
      <CDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="id"
        emptyMessage="No quotations."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Quotation" : "New Quotation"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Customer</Label>
                <Select
                  value={customerId}
                  onValueChange={setCustomerId}
                  disabled={!!editing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editing && (
                <div>
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                className="mt-1"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add Item
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-5">
                      <Select
                        value={String(item.productId)}
                        onValueChange={(v) => updateItem(idx, "productId", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products?.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Qty"
                        min={1}
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", Number(e.target.value))
                        }
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="Price"
                        min={0}
                        step={0.01}
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(idx, "unitPrice", Number(e.target.value))
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="col-span-1 h-8 w-8 text-destructive"
                      onClick={() =>
                        setItems((p) => p.filter((_, i) => i !== idx))
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !customerId ||
                items.length === 0 ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete quotation?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
