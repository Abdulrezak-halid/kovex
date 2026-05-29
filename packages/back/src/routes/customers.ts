import { Router } from "express";
import { db, customersTable } from "@sme-erp/database";
import { eq, ilike } from "drizzle-orm";
import { ListCustomersQueryParams, CreateCustomerBody, UpdateCustomerBody, GetCustomerParams, DeleteCustomerParams, UpdateCustomerParams } from "@sme-erp/api-validation";

const router = Router();

router.get("/customers", async (req, res) => {
  try {
    const query = ListCustomersQueryParams.parse(req.query);
    const rows = query.search
      ? await db.select().from(customersTable).where(ilike(customersTable.name, `%${query.search}%`))
      : await db.select().from(customersTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/customers", async (req, res) => {
  try {
    const body = CreateCustomerBody.parse(req.body);
    const [row] = await db.insert(customersTable).values(body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const { id } = GetCustomerParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(customersTable).where(eq(customersTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/customers/:id", async (req, res) => {
  try {
    const { id } = UpdateCustomerParams.parse({ id: Number(req.params.id) });
    const body = UpdateCustomerBody.parse(req.body);
    const [row] = await db.update(customersTable).set(body).where(eq(customersTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/customers/:id", async (req, res) => {
  try {
    const { id } = DeleteCustomerParams.parse({ id: Number(req.params.id) });
    await db.delete(customersTable).where(eq(customersTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
