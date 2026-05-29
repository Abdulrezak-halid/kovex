import { useState } from "react";
import {
  useListProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
} from "@sme-erp/api-client";
import type { Product, ProductInput } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));

const emptyForm = { name: "", sku: "", description: "", price: "", cost: "", unit: "pcs", minimumStock: "0" };

export default function Products() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListProducts({ search: search || undefined });
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(row: Product) {
    setEditing(row);
    setForm({
      name: row.name, sku: row.sku, description: row.description ?? "", price: String(row.price),
      cost: row.cost ? String(row.cost) : "", unit: row.unit, minimumStock: String(row.minimumStock),
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const payload: ProductInput = {
      name: form.name, sku: form.sku, description: form.description || undefined,
      price: Number(form.price), cost: form.cost ? Number(form.cost) : undefined,
      unit: form.unit, minimumStock: Number(form.minimumStock),
    } as any;
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: payload as any });
      } else {
        await createMutation.mutateAsync({ data: payload });
      }
      toast({ title: editing ? "Product updated" : "Product created" });
      qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Product deleted" });
      qc.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  const columns = [
    { header: "Name", cell: (r: Product) => <span className="font-medium">{r.name}</span> },
    { header: "SKU", cell: (r: Product) => <span className="font-mono text-sm text-muted-foreground">{r.sku}</span> },
    { header: "Price", cell: (r: Product) => fmt(r.price) },
    { header: "Cost", cell: (r: Product) => r.cost ? fmt(r.cost) : <span className="text-muted-foreground">—</span> },
    { header: "Unit", cell: (r: Product) => r.unit },
    { header: "Min Stock", cell: (r: Product) => r.minimumStock },
    {
      header: "Actions",
      cell: (r: Product) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteId(r.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: "w-20",
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Products"
        description="Manage product catalog"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Product
          </Button>
        }
      />
      <div className="mb-4 relative w-64">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
      </div>
      <DataTable columns={columns} data={data} isLoading={isLoading} keyField="id" emptyMessage="No products." />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Product" : "New Product"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              { key: "name", label: "Name", full: true },
              { key: "sku", label: "SKU" },
              { key: "unit", label: "Unit" },
              { key: "price", label: "Price", type: "number" },
              { key: "cost", label: "Cost", type: "number" },
              { key: "minimumStock", label: "Min Stock", type: "number" },
              { key: "description", label: "Description", full: true },
            ].map(({ key, label, type, full }) => (
              <div key={key} className={full ? "col-span-2" : ""}>
                <Label className="text-sm">{label}</Label>
                <Input
                  className="mt-1"
                  type={type ?? "text"}
                  step={type === "number" ? "0.01" : undefined}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.sku || !form.price || createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete product?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
