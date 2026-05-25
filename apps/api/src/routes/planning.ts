import { Router } from "express";
import { db, projectsTable, tasksTable, usersTable } from "@sme-erp/database";
import { eq, sql } from "drizzle-orm";

const router = Router();

// ─── Projects ────────────────────────────────────────────────────────────────

router.get("/projects", async (req, res) => {
  try {
    const { status } = req.query as { status?: string };
    const rows = await db.select().from(projectsTable);
    const filtered = status ? rows.filter((r) => r.status === status) : rows;

    const taskCounts = await db
      .select({
        projectId: tasksTable.projectId,
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${tasksTable.status} = 'done')::int`,
      })
      .from(tasksTable)
      .groupBy(tasksTable.projectId);

    const countMap = new Map(taskCounts.map((t) => [t.projectId, t]));

    const result = filtered.map((p) => ({
      ...p,
      budget: p.budget ? Number(p.budget) : null,
      taskCount: countMap.get(p.id)?.total ?? 0,
      completedTaskCount: countMap.get(p.id)?.done ?? 0,
    }));

    res.json(result);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const { name, description, status, priority, startDate, endDate, budget, customerId } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });
    const [row] = await db
      .insert(projectsTable)
      .values({
        name,
        description: description ?? null,
        status: status ?? "planning",
        priority: priority ?? "medium",
        startDate: startDate ?? null,
        endDate: endDate ?? null,
        budget: budget ? String(budget) : null,
        customerId: customerId ?? null,
      })
      .returning();
    res.status(201).json({ ...row, budget: row.budget ? Number(row.budget) : null, taskCount: 0, completedTaskCount: 0 });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [row] = await db.select().from(projectsTable).where(eq(projectsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });

    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${tasksTable.status} = 'done')::int`,
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, id));

    res.json({
      ...row,
      budget: row.budget ? Number(row.budget) : null,
      taskCount: counts?.total ?? 0,
      completedTaskCount: counts?.done ?? 0,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, status, priority, startDate, endDate, budget, customerId } = req.body;
    const update: Record<string, unknown> = {};
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (priority !== undefined) update.priority = priority;
    if (startDate !== undefined) update.startDate = startDate;
    if (endDate !== undefined) update.endDate = endDate;
    if (budget !== undefined) update.budget = budget ? String(budget) : null;
    if (customerId !== undefined) update.customerId = customerId;

    const [row] = await db.update(projectsTable).set(update as any).where(eq(projectsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });

    const [counts] = await db
      .select({
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${tasksTable.status} = 'done')::int`,
      })
      .from(tasksTable)
      .where(eq(tasksTable.projectId, id));

    res.json({
      ...row,
      budget: row.budget ? Number(row.budget) : null,
      taskCount: counts?.total ?? 0,
      completedTaskCount: counts?.done ?? 0,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(tasksTable).where(eq(tasksTable.projectId, id));
    await db.delete(projectsTable).where(eq(projectsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ─── Tasks within a project ──────────────────────────────────────────────────

router.get("/projects/:id/tasks", async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
    if (!project) return res.status(404).json({ error: "Project not found" });

    const rows = await db.select().from(tasksTable).where(eq(tasksTable.projectId, projectId));
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    res.json(
      rows.map((t) => ({
        ...t,
        projectName: project.name,
        assigneeName: t.assignedTo ? (userMap.get(t.assignedTo) ?? null) : null,
      }))
    );
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects/:id/tasks", async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, projectId));
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const [row] = await db
      .insert(tasksTable)
      .values({
        projectId,
        title,
        description: description ?? null,
        status: status ?? "todo",
        priority: priority ?? "medium",
        assignedTo: assignedTo ?? null,
        dueDate: dueDate ?? null,
      })
      .returning();

    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    res.status(201).json({
      ...row,
      projectName: project.name,
      assigneeName: row.assignedTo ? (userMap.get(row.assignedTo) ?? null) : null,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

// ─── Tasks (all) ─────────────────────────────────────────────────────────────

router.get("/tasks", async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query as Record<string, string | undefined>;
    let rows = await db.select().from(tasksTable);
    if (projectId) rows = rows.filter((t) => t.projectId === Number(projectId));
    if (status) rows = rows.filter((t) => t.status === status);
    if (assignedTo) rows = rows.filter((t) => t.assignedTo === Number(assignedTo));

    const projects = await db.select().from(projectsTable);
    const users = await db.select().from(usersTable);
    const projectMap = new Map(projects.map((p) => [p.id, p.name]));
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    res.json(
      rows.map((t) => ({
        ...t,
        projectName: projectMap.get(t.projectId) ?? "",
        assigneeName: t.assignedTo ? (userMap.get(t.assignedTo) ?? null) : null,
      }))
    );
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tasks/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(tasksTable).where(eq(tasksTable.id, Number(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, row.projectId));
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map((u) => [u.id, u.name]));
    res.json({
      ...row,
      projectName: project?.name ?? "",
      assigneeName: row.assignedTo ? (userMap.get(row.assignedTo) ?? null) : null,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, status, priority, assignedTo, dueDate } = req.body;
    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (priority !== undefined) update.priority = priority;
    if (assignedTo !== undefined) update.assignedTo = assignedTo;
    if (dueDate !== undefined) update.dueDate = dueDate;

    const [row] = await db.update(tasksTable).set(update as any).where(eq(tasksTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });

    const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, row.projectId));
    const users = await db.select().from(usersTable);
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    res.json({
      ...row,
      projectName: project?.name ?? "",
      assigneeName: row.assignedTo ? (userMap.get(row.assignedTo) ?? null) : null,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    await db.delete(tasksTable).where(eq(tasksTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
