import { useState } from "react";
import {
  useListCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  getListCustomersQueryKey,
} from "@sme-erp/api-client";
import type { Customer, CustomerInput } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
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
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CustomerRow = Customer;

const emptyForm: Partial<CustomerInput> = {
  name: "",
  email: "",
  phone: "",
  address: "",
  company: "",
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState<Partial<CustomerInput>>(emptyForm);

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListCustomers({ search: search || undefined });
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(row: CustomerRow) {
    setEditing(row);
    setForm({ name: row.name, email: row.email ?? "", phone: row.phone ?? "", address: row.address ?? "", company: row.company ?? "" });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form as any });
        toast({ title: "Customer updated" });
      } else {
        await createMutation.mutateAsync({ data: form as CustomerInput });
        toast({ title: "Customer created" });
      }
      qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Customer deleted" });
      qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  const columns = [
    { header: "Name", accessor: "name" as const, cell: (r: CustomerRow) => <span className="font-medium">{r.name}</span> },
    { header: "Company", accessor: "company" as const, cell: (r: CustomerRow) => r.company || <span className="text-muted-foreground">—</span> },
    { header: "Email", accessor: "email" as const, cell: (r: CustomerRow) => r.email || <span className="text-muted-foreground">—</span> },
    { header: "Phone", accessor: "phone" as const, cell: (r: CustomerRow) => r.phone || <span className="text-muted-foreground">—</span> },
    {
      header: "Actions",
      cell: (r: CustomerRow) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(r.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="p-6">
      <PageHeader
        title="Customers"
        description="Manage your customer records"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New Customer
          </Button>
        }
      />

      <div className="mb-4 relative w-64">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="id"
        emptyMessage="No customers found."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Customer" : "New Customer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(["name", "company", "email", "phone", "address"] as const).map((field) => (
              <div key={field}>
                <Label className="capitalize text-sm">{field}</Label>
                <Input
                  className="mt-1"
                  value={(form as any)[field] ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  required={field === "name"}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save Changes" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete customer?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
