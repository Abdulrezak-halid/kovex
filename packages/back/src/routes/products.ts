import { Router } from "express";
import { db, productsTable } from "@sme-erp/database";
import { eq, ilike, or } from "drizzle-orm";
import {
  ListProductsQueryParams,
  CreateProductBody,
  UpdateProductBody,
  GetProductParams,
  DeleteProductParams,
  UpdateProductParams,
} from "@sme-erp/api-validation";
import { validationErrorMessage } from "./validation";
import { applyListQuery, parseListQuery } from "./list-query";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const query = ListProductsQueryParams.parse(req.query);
    const rows = query.search
      ? await db
          .select()
          .from(productsTable)
          .where(
            or(
              ilike(productsTable.name, `%${query.search}%`),
              ilike(productsTable.sku, `%${query.search}%`),
              ilike(productsTable.description, `%${query.search}%`),
              ilike(productsTable.unit, `%${query.search}%`),
            ),
          )
      : await db.select().from(productsTable);
    const mappedRows = rows.map((r) => ({
      ...r,
      price: Number(r.price),
      cost: r.cost ? Number(r.cost) : null,
    }));
    const options = parseListQuery(req.query);
    res.json(
      applyListQuery(
        mappedRows,
        options,
        ["name", "sku", "description", "unit"],
        {
          name: (row) => row.name,
          sku: (row) => row.sku,
          price: (row) => row.price,
          createdAt: (row) => row.createdAt,
        },
      ),
    );
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const body = CreateProductBody.parse(req.body);
    const [row] = await db
      .insert(productsTable)
      .values({
        ...body,
        price: String(body.price),
        cost: body.cost != null ? String(body.cost) : null,
      })
      .returning();
    res
      .status(201)
      .json({
        ...row,
        price: Number(row.price),
        cost: row.cost ? Number(row.cost) : null,
      });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: validationErrorMessage(err) });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const { id } = GetProductParams.parse({ id: Number(req.params.id) });
    const [row] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({
      ...row,
      price: Number(row.price),
      cost: row.cost ? Number(row.cost) : null,
    });
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
    const [row] = await db
      .update(productsTable)
      .set(updateData as any)
      .where(eq(productsTable.id, id))
      .returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json({
      ...row,
      price: Number(row.price),
      cost: row.cost ? Number(row.cost) : null,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: validationErrorMessage(err) });
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
