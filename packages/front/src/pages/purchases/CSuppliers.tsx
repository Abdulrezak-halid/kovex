import { useState } from "react";
import {
  useListSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  getListSuppliersQueryKey,
} from "@sme-erp/api-client";
import type { Supplier, SupplierInput } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { CPageHeader } from "@/components/CPageHeader";
import { CDataTable } from "@/components/CDataTable";
import { CListQueryControls } from "@/components/CListQueryControls";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const emptyForm = { name: "", email: "", phone: "", address: "", company: "" };

export default function CSuppliers() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState(100);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);

  const qc = useQueryClient();
  const { toast } = useToast();

  const listParams = {
    search: search || undefined,
    sortBy,
    sortOrder,
    limit,
  };
  const { data, isLoading } = useListSuppliers(listParams);
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(row: Supplier) {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email ?? "",
      phone: row.phone ?? "",
      address: row.address ?? "",
      company: row.company ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form as any });
      } else {
        await createMutation.mutateAsync({ data: form as SupplierInput });
      }
      toast({ title: editing ? "Supplier updated" : "Supplier created" });
      qc.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Supplier deleted" });
      qc.invalidateQueries({ queryKey: getListSuppliersQueryKey() });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  const columns = [
    {
      header: "Name",
      cell: (r: Supplier) => <span className="font-medium">{r.name}</span>,
    },
    {
      header: "Company",
      cell: (r: Supplier) =>
        r.company || <span className="text-muted-foreground">—</span>,
    },
    {
      header: "Email",
      cell: (r: Supplier) =>
        r.email || <span className="text-muted-foreground">—</span>,
    },
    {
      header: "Phone",
      cell: (r: Supplier) =>
        r.phone || <span className="text-muted-foreground">—</span>,
    },
    {
      header: "Actions",
      cell: (r: Supplier) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => openEdit(r)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
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
      className: "w-20",
    },
  ];

  return (
    <div className="p-6">
      <CPageHeader
        title="Suppliers"
        description="Manage supplier records"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Supplier
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
        searchPlaceholder="Search suppliers..."
        sortOptions={[
          { value: "name", label: "Name" },
          { value: "company", label: "Company" },
          { value: "createdAt", label: "Created" },
        ]}
      />
      <CDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="id"
        emptyMessage="No suppliers."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Supplier" : "New Supplier"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(["name", "company", "email", "phone", "address"] as const).map(
              (field) => (
                <div key={field}>
                  <Label className="capitalize">{field}</Label>
                  <Input
                    className="mt-1"
                    value={(form as any)[field]}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                  />
                </div>
              ),
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !form.name ||
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
            <AlertDialogTitle>Delete supplier?</AlertDialogTitle>
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
