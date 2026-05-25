import { useState } from "react";
import { useParams, Link } from "wouter";
import {
  useGetProject,
  useListProjectTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useListUsers,
  getListProjectTasksQueryKey,
  getGetProjectQueryKey,
} from "@sme-erp/api-client";
import type { Task, TaskInput } from "@sme-erp/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  Calendar,
  DollarSign,
  CheckSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUS_BADGE: Record<string, string> = {
  todo: "bg-slate-100 text-slate-700",
  "in-progress": "bg-blue-100 text-blue-700",
  review: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
};

const PRIORITY_ICON: Record<string, React.ReactNode> = {
  low: <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />,
  medium: <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />,
  high: <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />,
};

const emptyTask: Partial<TaskInput> = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
};

function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: string) => void;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:border-primary/30 transition-colors group">
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {PRIORITY_ICON[task.priority]}
            <p className={`text-sm font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </p>
          </div>
          {task.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={task.status} onValueChange={onStatusChange}>
              <SelectTrigger className={`h-5 text-xs border-0 px-2 py-0 w-auto ${STATUS_BADGE[task.status] ?? ""}`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            {task.assigneeName && (
              <span className="text-xs text-muted-foreground">{task.assigneeName}</span>
            )}
            {task.dueDate && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                <Calendar className="h-3 w-3" />
                {task.dueDate.slice(0, 10)}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = Number(params.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState<Partial<TaskInput>>(emptyTask);

  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: project, isLoading: projectLoading } = useGetProject(projectId);
  const { data: tasks, isLoading: tasksLoading } = useListProjectTasks(projectId);
  const { data: users } = useListUsers();

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const COLUMNS = ["todo", "in-progress", "review", "done"] as const;
  const COLUMN_LABELS: Record<string, string> = {
    todo: "To Do",
    "in-progress": "In Progress",
    review: "Review",
    done: "Done",
  };

  function openCreate() {
    setEditingTask(null);
    setForm(emptyTask);
    setDialogOpen(true);
  }

  function openEdit(t: Task) {
    setEditingTask(t);
    setForm({
      title: t.title,
      description: t.description ?? "",
      status: t.status,
      priority: t.priority,
      assignedTo: t.assignedTo ?? undefined,
      dueDate: t.dueDate ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    try {
      const payload: TaskInput = {
        title: form.title!,
        description: form.description || undefined,
        status: form.status ?? "todo",
        priority: form.priority ?? "medium",
        assignedTo: form.assignedTo ?? undefined,
        dueDate: form.dueDate || undefined,
      };
      if (editingTask) {
        await updateMutation.mutateAsync({ id: editingTask.id, data: payload });
        toast({ title: "Task updated" });
      } else {
        await createMutation.mutateAsync({ id: projectId, data: payload });
        toast({ title: "Task created" });
      }
      qc.invalidateQueries({ queryKey: getListProjectTasksQueryKey(projectId) });
      qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
      setDialogOpen(false);
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  }

  async function handleStatusChange(taskId: number, status: string) {
    try {
      await updateMutation.mutateAsync({ id: taskId, data: { status } as any });
      qc.invalidateQueries({ queryKey: getListProjectTasksQueryKey(projectId) });
      qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
    } catch {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync({ id: deleteId });
      toast({ title: "Task deleted" });
      qc.invalidateQueries({ queryKey: getListProjectTasksQueryKey(projectId) });
      qc.invalidateQueries({ queryKey: getGetProjectQueryKey(projectId) });
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setDeleteId(null);
    }
  }

  if (projectLoading) {
    return (
      <div className="p-6">
        <div className="h-8 bg-muted rounded w-48 animate-pulse mb-4" />
        <div className="h-4 bg-muted rounded w-96 animate-pulse" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6 text-center py-20 text-muted-foreground">
        Project not found.{" "}
        <Link href="/planning/projects">
          <span className="text-primary hover:underline cursor-pointer">Back to projects</span>
        </Link>
      </div>
    );
  }

  const progress =
    project.taskCount > 0
      ? Math.round((project.completedTaskCount / project.taskCount) * 100)
      : 0;

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/planning/projects">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground -ml-2 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            All Projects
          </Button>
        </Link>
        <PageHeader
          title={project.name}
          description={project.description ?? ""}
          action={
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Task
            </Button>
          }
        />
      </div>

      {/* Project meta */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-muted/40 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Status:</span>
          <span className="font-medium capitalize">{project.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Priority:</span>
          <span className="font-medium capitalize">{project.priority}</span>
        </div>
        {project.taskCount > 0 && (
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
            <span>
              {project.completedTaskCount}/{project.taskCount} tasks ({progress}%)
            </span>
          </div>
        )}
        {(project.startDate || project.endDate) && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {project.startDate?.slice(0, 10) ?? "—"} → {project.endDate?.slice(0, 10) ?? "—"}
            </span>
          </div>
        )}
        {project.budget != null && (
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>${Number(project.budget).toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Kanban board */}
      {tasksLoading ? (
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map((col) => (
            <div key={col} className="space-y-2">
              <div className="h-6 bg-muted rounded animate-pulse" />
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = tasks?.filter((t) => t.status === col) ?? [];
            return (
              <div key={col} className="flex flex-col">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {COLUMN_LABELS[col]}
                  </h3>
                  <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 min-h-[4rem]">
                  {colTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={() => openEdit(t)}
                      onDelete={() => setDeleteId(t.id)}
                      onStatusChange={(status) => handleStatusChange(t.id, status)}
                    />
                  ))}
                  {colTasks.length === 0 && (
                    <div className="border-2 border-dashed border-border rounded-lg h-16 flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No tasks</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-sm">Title *</Label>
              <Input
                className="mt-1"
                value={form.title ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Task title"
              />
            </div>
            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                className="mt-1 resize-none"
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Status</Label>
                <Select value={form.status ?? "todo"} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
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
                <Select value={form.priority ?? "medium"} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
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
                  value={form.assignedTo ? String(form.assignedTo) : "none"}
                  onValueChange={(v) => setForm((f) => ({ ...f, assignedTo: v !== "none" ? Number(v) : undefined }))}
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
                  value={form.dueDate ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!form.title || createMutation.isPending || updateMutation.isPending}
            >
              {editingTask ? "Save Changes" : "Add Task"}
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
