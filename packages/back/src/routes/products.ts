import { Router } from "express";
import { db, productsTable } from "@sme-erp/database";
import { eq, ilike } from "drizzle-orm";
import { ListProductsQueryParams, CreateProductBody, UpdateProductBody, GetProductParams, DeleteProductParams, UpdateProductParams } from "@sme-erp/api-validation";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.parse(req.query);
    const rows = query.search
      ? await db.select().from(productsTable).where(ilike(productsTable.name, `%${query.search}%`))
      : await db.select().from(productsTable);
    res.json(rows.map((r) => ({ ...r, price: Number(r.price), cost: r.cost ? Number(r.cost) : null })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [row] = await db.insert(productsTable).values({
      ...body,
      price: String(body.price),
      cost: body.cost != null ? String(body.cost) : null,
    }).returning();
    res.status(201).json({ ...row, price: Number(row.price), cost: row.cost ? Number(row.cost) : null });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = GetProductParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, price: Number(row.price), cost: row.cost ? Number(row.cost) : null });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const { id } = UpdateProductParams.parse({ id: Number(req.params.id) });
    const body = UpdateProductBody.parse(req.body);
    const updateData: Record<string, unknown> = { ...body };
    if (body.price != null) updateData.price = String(body.price);
    if (body.cost != null) updateData.cost = String(body.cost);
    const [row] = await db.update(productsTable).set(updateData as any).where(eq(productsTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({ ...row, price: Number(row.price), cost: row.cost ? Number(row.cost) : null });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = DeleteProductParams.parse({ id: Number(req.params.id) });
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
