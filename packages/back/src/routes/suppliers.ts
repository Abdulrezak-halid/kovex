import { Router } from "express";
import { db, suppliersTable } from "@sme-erp/database";
import { eq, ilike, or } from "drizzle-orm";
import {
  ListSuppliersQueryParams,
  CreateSupplierBody,
  UpdateSupplierBody,
  GetSupplierParams,
  DeleteSupplierParams,
  UpdateSupplierParams,
} from "@sme-erp/api-validation";

const router = Router();

router.get("/suppliers", async (req, res) => {
  try {
    const query = ListSuppliersQueryParams.parse(req.query);
    const rows = query.search
      ? await db
          .select()
          .from(suppliersTable)
          .where(
            or(
              ilike(suppliersTable.name, `%${query.search}%`),
              ilike(suppliersTable.company, `%${query.search}%`),
              ilike(suppliersTable.email, `%${query.search}%`),
              ilike(suppliersTable.phone, `%${query.search}%`),
            ),
          )
      : await db.select().from(suppliersTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/suppliers", async (req, res) => {
  try {
    const body = CreateSupplierBody.parse(req.body);
    const [row] = await db.insert(suppliersTable).values(body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/suppliers/:id", async (req, res) => {
  try {
    const { id } = GetSupplierParams.parse({ id: Number(req.params.id) });
    const [row] = await db
      .select()
      .from(suppliersTable)
      .where(eq(suppliersTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/suppliers/:id", async (req, res) => {
  try {
    const { id } = UpdateSupplierParams.parse({ id: Number(req.params.id) });
    const body = UpdateSupplierBody.parse(req.body);
    const [row] = await db
      .update(suppliersTable)
      .set(body)
      .where(eq(suppliersTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/suppliers/:id", async (req, res) => {
  try {
    const { id } = DeleteSupplierParams.parse({ id: Number(req.params.id) });
    await db.delete(suppliersTable).where(eq(suppliersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
