import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useListCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  getListCustomersQueryKey,
} from "@sme-erp/api-client";
import type { Customer, CustomerInput } from "@sme-erp/api-client";
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
import { apiErrorMessage } from "@/lib/api-error";

type ICustomerRow = Customer;

const emptyForm: Partial<CustomerInput> = {
  name: "",
  email: "",
  phone: "",
  address: "",
  company: "",
};

export default function CCustomers() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [limit, setLimit] = useState(100);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<ICustomerRow | null>(null);
  const [form, setForm] = useState<Partial<CustomerInput>>(emptyForm);

  const qc = useQueryClient();
  const { toast } = useToast();

  const listParams = {
    search: search || undefined,
    sortBy,
    sortOrder,
    limit,
  };
  const { data, isLoading } = useListCustomers(listParams);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(row: ICustomerRow) {
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
        toast({ title: t("customerUpdated") });
      } else {
        await createMutation.mutateAsync({ data: form as CustomerInput });
        toast({ title: t("customerCreated") });
      }
      qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: t("error"),
        description: apiErrorMessage(err),
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: t("customerDeleted") });
      qc.invalidateQueries({ queryKey: getListCustomersQueryKey() });
    } catch (err) {
      toast({
        title: t("error"),
        description: apiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  }

  const columns = [
    {
      header: t("name"),
      accessor: "name" as const,
      cell: (r: ICustomerRow) => <span className="font-medium">{r.name}</span>,
    },
    {
      header: t("company"),
      accessor: "company" as const,
      cell: (r: ICustomerRow) =>
        r.company || <span className="text-muted-foreground">—</span>,
    },
    {
      header: t("email"),
      accessor: "email" as const,
      cell: (r: ICustomerRow) =>
        r.email || <span className="text-muted-foreground">—</span>,
    },
    {
      header: t("phone"),
      accessor: "phone" as const,
      cell: (r: ICustomerRow) =>
        r.phone || <span className="text-muted-foreground">—</span>,
    },
    {
      header: t("actions"),
      cell: (r: ICustomerRow) => (
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
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteId(r.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      className: "w-24",
    },
  ];

  return (
    <div className="p-6">
      <CPageHeader
        title={t("customers")}
        description={t("manageYourCustomerRecords")}
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            {t("newCustomer")}
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
        searchPlaceholder={t("searchCustomers")}
        sortOptions={[
          { value: "name", label: t("name") },
          { value: "company", label: t("company") },
          { value: "createdAt", label: t("created") },
        ]}
      />

      <CDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="id"
        emptyMessage={t("noCustomersFound")}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("editCustomer") : t("newCustomer")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {(["name", "company", "email", "phone", "address"] as const).map(
              (field) => (
                <div key={field}>
                  <Label className="capitalize text-sm">{t(field)}</Label>
                  <Input
                    className="mt-1"
                    value={(form as any)[field] ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, [field]: e.target.value }))
                    }
                    required={field === "name"}
                  />
                </div>
              ),
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                !form.name ||
                createMutation.isPending ||
                updateMutation.isPending
              }
            >
              {editing ? t("saveChanges") : t("create")}
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
            <AlertDialogTitle>{t("deleteCustomerQuestion")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("thisCannotBeUndone")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
