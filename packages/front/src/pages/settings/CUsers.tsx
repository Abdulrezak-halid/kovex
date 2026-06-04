import { useState } from "react";
import {
  useListUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  getListUsersQueryKey,
} from "@sme-erp/api-client";
import type { User, UserInput } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { CPageHeader } from "@/components/CPageHeader";
import { CDataTable } from "@/components/CDataTable";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { apiErrorMessage } from "@/lib/api-error";
import { isValidEmail, normalizeEmail } from "@/lib/form-validation";

const roles = [
  "admin",
  "sysadmin",
  "user",
  "sales",
  "purchasing",
  "inventory",
  "accountant",
  "planner",
];

const rolePermissionSummary: Record<string, { view: string; edit: string }> = {
  admin: { view: "All system modules", edit: "All system modules" },
  sysadmin: { view: "All system modules", edit: "All system modules" },
  user: { view: "Dashboard only", edit: "No module editing" },
  sales: { view: "Sales", edit: "Customers, quotations, and orders" },
  purchasing: {
    view: "Purchases",
    edit: "Suppliers and purchase orders",
  },
  inventory: {
    view: "Inventory",
    edit: "Products, stock, and warehouses",
  },
  accountant: {
    view: "Invoices and reports",
    edit: "Sales invoices and purchase invoices",
  },
  planner: { view: "Planning", edit: "Projects and tasks" },
};
type UserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
  active: boolean;
};
type UserPayload = Partial<UserInput> & { password?: string };

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "user",
  department: "",
  active: true,
};

export default function CUsers() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(emptyForm);

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useListUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }
  function openEdit(row: User) {
    setEditing(row);
    setForm({
      name: row.name,
      email: row.email,
      password: "",
      role: row.role,
      department: row.department ?? "",
      active: row.active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const nameMissing = !form.name.trim();
    const emailMissing = !form.email.trim();
    const emailInvalid = !emailMissing && !isValidEmail(form.email);
    const passwordMissing = !editing && !form.password;
    const passwordTooShort =
      !editing && !!form.password && form.password.length < 8;
    if (
      nameMissing ||
      emailMissing ||
      emailInvalid ||
      passwordMissing ||
      passwordTooShort
    )
      return;

    try {
      const payload: UserPayload = {
        name: form.name.trim(),
        email: normalizeEmail(form.email),
        role: form.role,
        department: form.department.trim(),
        active: form.active,
      };

      if (form.password) payload.password = form.password;

      if (editing) {
        await updateMutation.mutateAsync({
          id: editing.id,
          data: payload as UserInput,
        });
      } else {
        await createMutation.mutateAsync({ data: payload as UserInput });
      }
      toast({ title: editing ? "User updated" : "User created" });
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setDialogOpen(false);
    } catch (err) {
      toast({
        title: "Validation error",
        description: apiErrorMessage(err),
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "User deleted" });
      qc.invalidateQueries({ queryKey: getListUsersQueryKey() });
    } catch (err) {
      toast({
        title: "Error",
        description: apiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  }

  const nameMissing = !form.name.trim();
  const emailMissing = !form.email.trim();
  const emailInvalid = !emailMissing && !isValidEmail(form.email);
  const passwordMissing = !editing && !form.password;
  const passwordTooShort =
    !editing && !!form.password && form.password.length < 8;

  const columns = [
    {
      header: "Name",
      cell: (r: User) => <span className="font-medium">{r.name}</span>,
    },
    { header: "Email", cell: (r: User) => r.email },
    {
      header: "Role",
      cell: (r: User) => (
        <Badge variant="secondary" className="capitalize text-xs">
          {r.role}
        </Badge>
      ),
    },
    {
      header: "Department",
      cell: (r: User) =>
        r.department || <span className="text-muted-foreground">—</span>,
    },
    {
      header: "Status",
      cell: (r: User) =>
        r.active ? (
          <Badge
            variant="secondary"
            className="text-xs text-green-700 bg-green-100"
          >
            Active
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            Inactive
          </Badge>
        ),
    },
    {
      header: "Actions",
      cell: (r: User) => (
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
        title="Users"
        description="Manage system users and roles"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1.5" />
            New User
          </Button>
        }
      />
      <CDataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        keyField="id"
        emptyMessage="No users."
        emptyAction={
          <div className="flex justify-center">
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              New User
            </Button>
          </div>
        }
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit User" : "New User"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
              {nameMissing && (
                <p className="mt-1 text-xs text-destructive">Required</p>
              )}
            </div>
            <div>
              <Label>Email</Label>
              <Input
                className="mt-1"
                type="email"
                value={form.email}
                onBlur={(e) =>
                  setForm((f) => ({
                    ...f,
                    email: normalizeEmail(e.target.value),
                  }))
                }
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                required
              />
              {emailMissing && (
                <p className="mt-1 text-xs text-destructive">Required</p>
              )}
              {emailInvalid && (
                <p className="mt-1 text-xs text-destructive">
                  Enter a valid email address.
                </p>
              )}
            </div>
            <div>
              <Label>Password</Label>
              <Input
                className="mt-1"
                type="password"
                autoComplete="new-password"
                placeholder={
                  editing
                    ? "Leave blank to keep current password"
                    : "At least 8 characters"
                }
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                required={!editing}
              />
              {passwordMissing && (
                <p className="mt-1 text-xs text-destructive">Required</p>
              )}
              {passwordTooShort && (
                <p className="mt-1 text-xs text-destructive">
                  Password must be at least 8 characters.
                </p>
              )}
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border border-border bg-muted/30 p-3 text-xs">
              <p className="font-medium">Role permissions</p>
              <div className="mt-2 grid gap-1 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Can see:</span>{" "}
                  {rolePermissionSummary[form.role]?.view ?? "Dashboard only"}
                </p>
                <p>
                  <span className="font-medium text-foreground">
                    Can edit/delete:
                  </span>{" "}
                  {rolePermissionSummary[form.role]?.edit ??
                    "No module editing"}
                </p>
              </div>
            </div>
            <div>
              <Label>Department</Label>
              <Input
                className="mt-1"
                value={form.department}
                onChange={(e) =>
                  setForm((f) => ({ ...f, department: e.target.value }))
                }
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={String(form.active)}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, active: v === "true" }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                nameMissing ||
                emailMissing ||
                emailInvalid ||
                passwordMissing ||
                passwordTooShort ||
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
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
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
