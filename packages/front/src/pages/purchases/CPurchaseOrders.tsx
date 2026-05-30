import { useState } from "react";
import {
  useListPurchaseOrders,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrder,
  useDeletePurchaseOrder,
  useReceivePurchaseOrder,
  useListSuppliers,
  useListProducts,
  getListPurchaseOrdersQueryKey,
} from "@sme-erp/api-client";
import type { PurchaseOrder } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { CPageHeader } from "@/components/CPageHeader";
import { CDataTable } from "@/components/CDataTable";
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
import { Plus, Pencil, Trash2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusOptions = ["draft", "sent", "received", "cancelled"];
const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n),
  );

export default function CPurchaseOrders() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<PurchaseOrder | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<
    {
      productId: number;
      productName: string;
      quantity: number;
      unitCost: number;
    }[]
  >([]);

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListPurchaseOrders();
  const { data: suppliers } = useListSuppliers();
  const { data: products } = useListProducts();
  const createMutation = useCreatePurchaseOrder();
  const updateMutation = useUpdatePurchaseOrder();
  const deleteMutation = useDeletePurchaseOrder();
  const receiveMutation = useReceivePurchaseOrder();

  function openCreate() {
    setEditing(null);
    setSupplierId("");
    setStatus("draft");
    setNotes("");
    setItems([]);
    setDialogOpen(true);
  }

  function openEdit(row: PurchaseOrder) {
    setEditing(row);
    setSupplierId(String(row.supplierId));
    setStatus(row.status);
    setNotes(row.notes ?? "");
    setItems(
      row.items.map((i) => ({
        productId: i.productId,
        productName: i.productName,
        quantity: i.quantity,
        unitCost: i.unitCost,
      })),
    );
    setDialogOpen(true);
  }

  function addItem() {
    setItems((p) => [
      ...p,
      { productId: 0, productName: "", quantity: 1, unitCost: 0 },
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
          unitCost: Number(p?.cost ?? p?.price ?? 0),
        };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: { status, notes } as any,
        });
      } else {
        await createMutation.mutateAsync({
          data: {
            supplierId: Number(supplierId),
            notes: notes || undefined,
            items: items.map((i) => ({
              productId: i.productId,
              quantity: i.quantity,
              unitCost: i.unitCost,
            })),
          } as any,
        });
      }
      toast({
        title: editing ? "Purchase order updated" : "Purchase order created",
      });
      qc.invalidateQueries({ queryKey: getListPurchaseOrdersQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Purchase order deleted" });
      qc.invalidateQueries({ queryKey: getListPurchaseOrdersQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  async function handleReceive(id: number) {
    try {
      await receiveMutation.mutateAsync({ id } as any);
      toast({ title: "Goods received — stock updated" });
      qc.invalidateQueries({ queryKey: getListPurchaseOrdersQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  const columns = [
    {
      header: "Reference",
      cell: (r: PurchaseOrder) => (
        <span className="font-medium font-mono text-sm">{r.reference}</span>
      ),
    },
    { header: "Supplier", cell: (r: PurchaseOrder) => r.supplierName },
    {
      header: "Status",
      cell: (r: PurchaseOrder) => <CStatusBadge status={r.status} />,
    },
    {
      header: "Total",
      cell: (r: PurchaseOrder) => (
        <span className="font-medium">{fmt(r.totalAmount)}</span>
      ),
    },
    {
      header: "Date",
      cell: (r: PurchaseOrder) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (r: PurchaseOrder) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => openEdit(r)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          {r.status === "sent" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-green-600"
              onClick={() => handleReceive(r.id)}
              title="Receive goods"
            >
              <CheckCircle className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
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
        title="Purchase Orders"
        description="Manage orders from suppliers"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New PO
          </Button>
        }
      />
      <CDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="id"
        emptyMessage="No purchase orders."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Purchase Order" : "New Purchase Order"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Supplier</Label>
                <Select
                  value={supplierId}
                  onValueChange={setSupplierId}
                  disabled={!!editing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.name}
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
            {!editing && (
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
                    Add
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
                          placeholder="Cost"
                          min={0}
                          step={0.01}
                          value={item.unitCost}
                          onChange={(e) =>
                            updateItem(idx, "unitCost", Number(e.target.value))
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
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                (!editing && (!supplierId || items.length === 0)) ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editing ? "Save" : "Create"}
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
            <AlertDialogTitle>Delete purchase order?</AlertDialogTitle>
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
