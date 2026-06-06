import { Router } from "express";
import { db, warehousesTable, stockTable, productsTable } from "@sme-erp/database";
import { eq, sql } from "drizzle-orm";
import { CreateWarehouseBody, UpdateWarehouseBody, GetWarehouseParams, DeleteWarehouseParams, UpdateWarehouseParams, ListStockQueryParams } from "@sme-erp/api-validation";
import { validationErrorResponse } from "./validation";

const router = Router();

router.get("/warehouses", async (req, res) => {
  try {
    const rows = await db.select().from(warehousesTable);
    res.json(rows);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/warehouses", async (req, res) => {
  try {
    const body = CreateWarehouseBody.parse(req.body);
    const [row] = await db.insert(warehousesTable).values(body).returning();
    res.status(201).json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

router.get("/warehouses/:id", async (req, res) => {
  try {
    const { id } = GetWarehouseParams.parse({ id: Number(req.params.id) });
    const [row] = await db.select().from(warehousesTable).where(eq(warehousesTable.id, id));
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/warehouses/:id", async (req, res) => {
  try {
    const { id } = UpdateWarehouseParams.parse({ id: Number(req.params.id) });
    const body = UpdateWarehouseBody.parse(req.body);
    const [row] = await db.update(warehousesTable).set(body).where(eq(warehousesTable.id, id)).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    res.json(row);
  } catch (err) {
    req.log.error({ err });
    res.status(400).json(validationErrorResponse(err));
  }
});

router.delete("/warehouses/:id", async (req, res) => {
  try {
    const { id } = DeleteWarehouseParams.parse({ id: Number(req.params.id) });
    await db.delete(warehousesTable).where(eq(warehousesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// Stock endpoint
router.get("/stock", async (req, res) => {
  try {
    const query = ListStockQueryParams.parse(req.query);
    let q = db
      .select({
        productId: productsTable.id,
        productName: productsTable.name,
        sku: productsTable.sku,
        warehouseId: warehousesTable.id,
        warehouseName: warehousesTable.name,
        quantity: stockTable.quantity,
        minimumStock: productsTable.minimumStock,
      })
      .from(stockTable)
      .innerJoin(productsTable, eq(stockTable.productId, productsTable.id))
      .innerJoin(warehousesTable, eq(stockTable.warehouseId, warehousesTable.id))
      .$dynamic();

    const rows = await q;
    let filtered = rows;
    if (query.warehouseId) filtered = filtered.filter((r) => r.warehouseId === query.warehouseId);
    if (query.productId) filtered = filtered.filter((r) => r.productId === query.productId);
    res.json(filtered);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
