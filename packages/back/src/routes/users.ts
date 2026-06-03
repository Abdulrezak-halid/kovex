import {
  Router,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { db, usersTable } from "@sme-erp/database";
import { eq } from "drizzle-orm";
import { CreateUserBody, UpdateUserBody } from "@sme-erp/api-validation";
import { hashPassword, isAdminRole, publicUser } from "../lib/auth";
import { validationErrorResponse } from "./validation";

const router = Router();
const roles = new Set([
  "admin",
  "sysadmin",
  "user",
  "sales",
  "purchasing",
  "inventory",
  "planner",
]);

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!isAdminRole(req.authUser?.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  next();
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

const CreateUserWithPasswordBody = CreateUserBody.extend({
  password: CreateUserBody.shape.name.min(
    8,
    "Password must be at least 8 characters",
  ),
});

const UpdateUserWithPasswordBody = UpdateUserBody.extend({
  password: CreateUserBody.shape.name
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

function validateUserInput(input: any, options: { creating: boolean }) {
  const parsed = options.creating
    ? CreateUserWithPasswordBody.parse(input)
    : UpdateUserWithPasswordBody.parse(input);
  const name = String(parsed.name ?? input.name ?? "").trim();
  const email = String(parsed.email ?? input.email ?? "")
    .trim()
    .toLowerCase();
  const password =
    parsed.password === undefined ? undefined : String(parsed.password ?? "");
  const role = String(input.role ?? "user");
  const department =
    input.department === undefined || input.department === null
      ? null
      : String(input.department).trim() || null;
  const active = input.active === undefined ? true : Boolean(input.active);

  if (!name) return { error: "Name is required" };
  if (!email || !validEmail(email)) return { error: "Valid email is required" };
  if (!roles.has(role)) return { error: "Valid role is required" };
  if (options.creating && (!password || password.length < 8)) {
    return { error: "Password must be at least 8 characters" };
  }
  if (
    !options.creating &&
    password !== undefined &&
    password.length > 0 &&
    password.length < 8
  ) {
    return { error: "Password must be at least 8 characters" };
  }

  return { value: { name, email, password, role, department, active } };
}

router.get("/users", async (req, res) => {
  try {
    const rows = await db.select().from(usersTable);
    res.json(rows.map(publicUser));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/users", requireAdmin, async (req, res) => {
  try {
    const parsed = validateUserInput(req.body, { creating: true });
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    const { name, email, role, department, active } = parsed.value;
    const password = parsed.value.password;
    if (!password)
      return res.status(400).json({ error: "Password is required" });
    const [row] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        department,
        active,
      })
      .returning();
    res.status(201).json(publicUser(row));
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

router.get("/users/:id", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(req.params.id)));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(publicUser(row));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const current = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    if (!current[0]) return res.status(404).json({ error: "Not found" });

    const parsed = validateUserInput(
      { ...current[0], ...req.body },
      { creating: false },
    );
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    const { name, email, password, role, department, active } = parsed.value;
    const updateData: Record<string, unknown> = {};
    if (req.body.name !== undefined) updateData.name = name;
    if (req.body.email !== undefined) updateData.email = email;
    if (password) updateData.passwordHash = hashPassword(password);
    if (req.body.role !== undefined) updateData.role = role;
    if (req.body.department !== undefined) updateData.department = department;
    if (req.body.active !== undefined) updateData.active = active;

    const [row] = await db
      .update(usersTable)
      .set(updateData as any)
      .where(eq(usersTable.id, id))
      .returning();
    res.json(publicUser(row));
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
