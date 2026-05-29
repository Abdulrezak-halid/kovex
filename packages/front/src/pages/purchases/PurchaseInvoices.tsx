import { useState } from "react";
import {
  useListPurchaseInvoices,
  useCreatePurchaseInvoice,
  useUpdatePurchaseInvoice,
  useListSuppliers,
  getListPurchaseInvoicesQueryKey,
} from "@sme-erp/api-client";
import type { PurchaseInvoice } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusOptions = ["pending", "paid", "overdue"];
const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));

export default function PurchaseInvoices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PurchaseInvoice | null>(null);
  const [supplierId, setSupplierId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("pending");

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListPurchaseInvoices();
  const { data: suppliers } = useListSuppliers();
  const createMutation = useCreatePurchaseInvoice();
  const updateMutation = useUpdatePurchaseInvoice();

  function openCreate() {
    setEditing(null); setSupplierId(""); setTotalAmount(""); setDueDate(""); setNotes(""); setStatus("pending");
    setDialogOpen(true);
  }

  function openEdit(row: PurchaseInvoice) {
    setEditing(row); setSupplierId(String(row.supplierId)); setTotalAmount(String(row.totalAmount));
    setDueDate(row.dueDate ? new Date(row.dueDate).toISOString().split("T")[0] : "");
    setNotes(row.notes ?? ""); setStatus(row.status);
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: { status, dueDate: dueDate || undefined, notes: notes || undefined } as any });
      } else {
        await createMutation.mutateAsync({ data: { supplierId: Number(supplierId), totalAmount: Number(totalAmount), dueDate: dueDate || undefined, notes: notes || undefined } as any });
      }
      toast({ title: editing ? "Invoice updated" : "Invoice created" });
      qc.invalidateQueries({ queryKey: getListPurchaseInvoicesQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  const columns = [
    { header: "Reference", cell: (r: PurchaseInvoice) => <span className="font-medium font-mono text-sm">{r.reference}</span> },
    { header: "Supplier", cell: (r: PurchaseInvoice) => r.supplierName },
    { header: "Status", cell: (r: PurchaseInvoice) => <StatusBadge status={r.status} /> },
    { header: "Total", cell: (r: PurchaseInvoice) => <span className="font-medium">{fmt(r.totalAmount)}</span> },
    { header: "Due", cell: (r: PurchaseInvoice) => r.dueDate ? new Date(r.dueDate).toLocaleDateString() : <span className="text-muted-foreground">—</span> },
    { header: "Date", cell: (r: PurchaseInvoice) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: "Actions",
      cell: (r: PurchaseInvoice) => (
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ),
      className: "w-20",
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Purchase Invoices"
        description="Manage invoices from suppliers"
        action={<Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1.5" />New Invoice</Button>}
      />
      <DataTable columns={columns} data={data} isLoading={isLoading} keyField="id" emptyMessage="No purchase invoices." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Invoice" : "New Purchase Invoice"}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            {!editing && (
              <div>
                <Label>Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers?.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {!editing && (
              <div>
                <Label>Total Amount</Label>
                <Input className="mt-1" type="number" min={0} step={0.01} value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} />
              </div>
            )}
            {editing && (
              <div>
                <Label>Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{statusOptions.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Due Date</Label>
              <Input className="mt-1" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div>
              <Label>Notes</Label>
              <Input className="mt-1" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={(!editing && (!supplierId || !totalAmount)) || createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
