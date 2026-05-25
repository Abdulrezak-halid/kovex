import { useState } from "react";
import {
  useListTasks,
  useListProjects,
  useListUsers,
  useUpdateTask,
  useDeleteTask,
  getListTasksQueryKey,
} from "@sme-erp/api-client";
import type { Task } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { PageHeader } from "@/components/PageHeader";
import { DataTable } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_BADGE: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const PRIORITY_BADGE: Record<string, string> = {
  low: "bg-slate-100 text-slate-600",
  medium: "bg-orange-100 text-orange-700",
  high: "bg-red-100 text-red-700",
};

export default function Tasks() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: tasks, isLoading } = useListTasks({
    status: filterStatus !== "all" ? filterStatus : undefined,
    projectId: filterProject !== "all" ? Number(filterProject) : undefined,
  });
  const { data: projects } = useListProjects({});
  const { data: users } = useListUsers();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  function openEdit(t: Task) {
    setEditingTask(t);
    setEditForm({
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo ?? undefined,
      dueDate: t.dueDate ?? "",
    });
  }

  async function handleUpdate() {
    if (!editingTask) return;
    try {
      await updateMutation.mutateAsync({
        id: editingTask.id,
        data: {
          title: editForm.title!,
          description: editForm.description || undefined,
          status: editForm.status,
          priority: editForm.priority,
          assignedTo: editForm.assignedTo ?? undefined,
          dueDate: editForm.dueDate || undefined,
        },
      });
      toast({ title: "Task updated" });
      qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
      setEditingTask(null);
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Task deleted" });
      qc.invalidateQueries({ queryKey: getListTasksQueryKey() });
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  const columns = [
    {
      header: "Task",
      cell: (t: Task) => (
        <div>
          <p className="font-medium text-sm">{t.title}</p>
          {t.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{t.description}</p>}
        </div>
      ),
    },
    {
      header: "Project",
      cell: (t: Task) => (
        <Link href={`/planning/projects/${t.projectId}`}>
          <span className="text-sm text-primary hover:underline cursor-pointer">{t.projectName}</span>
        </Link>
      ),
    },
    {
      header: "Status",
      cell: (t: Task) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[t.status] ?? "bg-slate-100 text-slate-700"}`}>
          {t.status}
        </span>
      ),
    },
    {
      header: "Priority",
      cell: (t: Task) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_BADGE[t.priority] ?? "bg-slate-100 text-slate-600"}`}>
          {t.priority}
        </span>
      ),
    },
    {
      header: "Assignee",
      cell: (t: Task) => t.assigneeName ?? <span className="text-muted-foreground text-sm">Unassigned</span>,
    },
    {
      header: "Due Date",
      cell: (t: Task) =>
        t.dueDate ? (
          <span className="text-sm">{t.dueDate.slice(0, 10)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      header: "Actions",
      cell: (t: Task) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => setDeleteId(t.id)}
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
      <PageHeader title="All Tasks" description="View and manage tasks across all projects" />

      <div className="mb-4 flex gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="h-8 text-sm w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="h-8 text-sm w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects?.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={tasks}
        isLoading={isLoading}
        keyField="id"
        emptyMessage="No tasks found. Create projects and add tasks to get started."
      />

      <Dialog open={!!editingTask} onOpenChange={(o) => !o && setEditingTask(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-sm">Title *</Label>
              <Input
                className="mt-1"
                value={editForm.title ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={2}
                value={editForm.description ?? ""}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Status</Label>
                <Select value={editForm.status ?? "todo"} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Priority</Label>
                <Select value={editForm.priority ?? "medium"} onValueChange={(v) => setEditForm((f) => ({ ...f, priority: v }))}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Assignee</Label>
                <Select
                  value={editForm.assignedTo ? String(editForm.assignedTo) : "none"}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, assignedTo: v !== "none" ? Number(v) : undefined }))}
                >
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {users?.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm">Due Date</Label>
                <Input
                  type="date"
                  className="mt-1 h-9 text-sm"
                  value={editForm.dueDate ?? ""}
                  onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={!editForm.title || updateMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
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
