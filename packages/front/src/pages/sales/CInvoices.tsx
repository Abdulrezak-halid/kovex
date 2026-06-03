import { useState } from "react";
import {
  useListInvoices,
  useUpdateInvoice,
  getListInvoicesQueryKey,
} from "@sme-erp/api-client";
import type { Invoice } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { CPageHeader } from "@/components/CPageHeader";
import { CDataTable } from "@/components/CDataTable";
import { CListQueryControls } from "@/components/CListQueryControls";
import { CStatusBadge } from "@/components/CStatusBadge";
import { Button } from "@/components/ui/button";
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
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statusOptions = ["draft", "sent", "paid", "overdue"];
const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number(n),
  );

export default function CInvoices() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Invoice | null>(null);
  const [status, setStatus] = useState("draft");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [limit, setLimit] = useState(100);

  const qc = useQueryClient();
  const { toast } = useToast();

  const listParams = {
    search: search || undefined,
    sortBy,
    sortOrder,
    limit,
  };
  const { data, isLoading } = useListInvoices(listParams);
  const updateMutation = useUpdateInvoice();

  function openEdit(row: Invoice) {
    setEditing(row);
    setStatus(row.status);
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({
        id: editing.id,
        data: { status } as any,
      });
      toast({ title: "Invoice updated" });
      qc.invalidateQueries({ queryKey: getListInvoicesQueryKey() });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  }

  const columns = [
    {
      header: "Reference",
      cell: (r: Invoice) => (
        <span className="font-medium font-mono text-sm">{r.reference}</span>
      ),
    },
    { header: "Customer", cell: (r: Invoice) => r.customerName },
    {
      header: "Status",
      cell: (r: Invoice) => <CStatusBadge status={r.status} />,
    },
    {
      header: "Total",
      cell: (r: Invoice) => (
        <span className="font-medium">{fmt(r.totalAmount)}</span>
      ),
    },
    {
      header: "Due Date",
      cell: (r: Invoice) =>
        r.dueDate ? (
          new Date(r.dueDate).toLocaleDateString()
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: "Date",
      cell: (r: Invoice) => new Date(r.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      cell: (r: Invoice) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => openEdit(r)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ),
      className: "w-20",
    },
  ];

  return (
    <div className="p-6">
      <CPageHeader
        title="Invoices"
        description="View and manage sales invoices"
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
          { value: "dueDate", label: "Due Date" },
          { value: "totalAmount", label: "Total" },
          { value: "customerName", label: "Customer" },
          { value: "status", label: "Status" },
        ]}
      />
      <CDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="id"
        emptyMessage="No invoices. Create them from sales orders."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Invoice</DialogTitle>
          </DialogHeader>
          <div className="py-2">
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
