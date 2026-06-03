import { Router } from "express";
import { db, customersTable } from "@sme-erp/database";
import { eq, ilike, or } from "drizzle-orm";
import {
  ListCustomersQueryParams,
  CreateCustomerBody,
  UpdateCustomerBody,
  GetCustomerParams,
  DeleteCustomerParams,
  UpdateCustomerParams,
} from "@sme-erp/api-validation";
import { validationErrorMessage } from "./validation";
import { applyListQuery, parseListQuery } from "./list-query";

const router = Router();

router.get("/customers", async (req, res) => {
  try {
    const query = ListCustomersQueryParams.parse(req.query);
    const rows = query.search
      ? await db
          .select()
          .from(customersTable)
          .where(
            or(
              ilike(customersTable.name, `%${query.search}%`),
              ilike(customersTable.company, `%${query.search}%`),
              ilike(customersTable.email, `%${query.search}%`),
              ilike(customersTable.phone, `%${query.search}%`),
            ),
          )
      : await db.select().from(customersTable);
    const options = parseListQuery(req.query);
    res.json(
      applyListQuery(rows, options, ["name", "company", "email", "phone"], {
        name: (row) => row.name,
        company: (row) => row.company,
        createdAt: (row) => row.createdAt,
      }),
    );
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
    res.status(400).json({ error: validationErrorMessage(err) });
  }
});

router.get("/customers/:id", async (req, res) => {
  try {
    const { id } = GetCustomerParams.parse({ id: Number(req.params.id) });
    const [row] = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, id));
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
    const [row] = await db
      .update(customersTable)
      .set(body)
      .where(eq(customersTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: validationErrorMessage(err) });
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
