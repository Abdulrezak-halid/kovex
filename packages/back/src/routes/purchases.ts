import { Router } from "express";
import { db } from "@sme-erp/database";
import {
  purchaseOrdersTable, purchaseOrderItemsTable, purchaseInvoicesTable,
  suppliersTable, productsTable, stockTable, warehousesTable,
} from "@sme-erp/database";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function genRef(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

// ── PURCHASE ORDERS ───────────────────────────────────────────────────────
router.get("/purchase-orders", async (req, res) => {
  try {
    const { status, supplierId } = req.query as Record<string, string>;
    const rows = await db
      .select({ id: purchaseOrdersTable.id, reference: purchaseOrdersTable.reference, supplierId: purchaseOrdersTable.supplierId, supplierName: suppliersTable.name, status: purchaseOrdersTable.status, totalAmount: purchaseOrdersTable.totalAmount, expectedDate: purchaseOrdersTable.expectedDate, notes: purchaseOrdersTable.notes, createdAt: purchaseOrdersTable.createdAt })
      .from(purchaseOrdersTable)
      .innerJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id))
      .orderBy(desc(purchaseOrdersTable.createdAt));

    let filtered = rows;
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (supplierId) filtered = filtered.filter((r) => r.supplierId === Number(supplierId));

    const withItems = await Promise.all(
      filtered.map(async (po) => {
        const items = await db.select().from(purchaseOrderItemsTable).where(eq(purchaseOrderItemsTable.purchaseOrderId, po.id));
        return { ...po, totalAmount: Number(po.totalAmount), items: items.map((i) => ({ ...i, unitCost: Number(i.unitCost), total: Number(i.total) })) };
      })
    );
    res.json(withItems);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/purchase-orders", async (req, res) => {
  try {
    const { supplierId, expectedDate, notes, items } = req.body;
    const total = items.reduce((s: number, i: any) => s + i.quantity * i.unitCost, 0);
    const [po] = await db.insert(purchaseOrdersTable).values({ reference: genRef("PO"), supplierId: Number(supplierId), expectedDate: expectedDate ? new Date(expectedDate) : null, notes: notes ?? null, totalAmount: String(total) }).returning();
    const prods = await db.select().from(productsTable);
    const itemRows = items.map((i: any) => {
      const p = prods.find((x) => x.id === Number(i.productId));
      return { purchaseOrderId: po.id, productId: Number(i.productId), productName: p?.name ?? "", quantity: Number(i.quantity), unitCost: String(i.unitCost), total: String(Number(i.quantity) * Number(i.unitCost)) };
    });
    const savedItems = await db.insert(purchaseOrderItemsTable).values(itemRows).returning();
    const supplier = await db.select().from(suppliersTable).where(eq(suppliersTable.id, po.supplierId));
    res.status(201).json({ ...po, totalAmount: Number(po.totalAmount), supplierName: supplier[0]?.name ?? "", items: savedItems.map((i) => ({ ...i, unitCost: Number(i.unitCost), total: Number(i.total) })) });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/purchase-orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [po] = await db.select({ id: purchaseOrdersTable.id, reference: purchaseOrdersTable.reference, supplierId: purchaseOrdersTable.supplierId, supplierName: suppliersTable.name, status: purchaseOrdersTable.status, totalAmount: purchaseOrdersTable.totalAmount, expectedDate: purchaseOrdersTable.expectedDate, notes: purchaseOrdersTable.notes, createdAt: purchaseOrdersTable.createdAt }).from(purchaseOrdersTable).innerJoin(suppliersTable, eq(purchaseOrdersTable.supplierId, suppliersTable.id)).where(eq(purchaseOrdersTable.id, id));
    if (!po) return res.status(404).json({ error: "Not found" });
    const items = await db.select().from(purchaseOrderItemsTable).where(eq(purchaseOrderItemsTable.purchaseOrderId, id));
    res.json({ ...po, totalAmount: Number(po.totalAmount), items: items.map((i) => ({ ...i, unitCost: Number(i.unitCost), total: Number(i.total) })) });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/purchase-orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, expectedDate, notes } = req.body;
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (expectedDate !== undefined) updateData.expectedDate = expectedDate ? new Date(expectedDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    const [po] = await db.update(purchaseOrdersTable).set(updateData as any).where(eq(purchaseOrdersTable.id, id)).returning();
    if (!po) return res.status(404).json({ error: "Not found" });
    const supplier = await db.select().from(suppliersTable).where(eq(suppliersTable.id, po.supplierId));
    const items = await db.select().from(purchaseOrderItemsTable).where(eq(purchaseOrderItemsTable.purchaseOrderId, id));
    res.json({ ...po, totalAmount: Number(po.totalAmount), supplierName: supplier[0]?.name ?? "", items: items.map((i) => ({ ...i, unitCost: Number(i.unitCost), total: Number(i.total) })) });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/purchase-orders/:id", async (req, res) => {
  try {
    await db.delete(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/purchase-orders/:id/receive", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [po] = await db.select().from(purchaseOrdersTable).where(eq(purchaseOrdersTable.id, id));
    if (!po) return res.status(404).json({ error: "Not found" });
    const items = await db.select().from(purchaseOrderItemsTable).where(eq(purchaseOrderItemsTable.purchaseOrderId, id));

    let warehouses = req.body?.warehouseId
      ? await db.select().from(warehousesTable).where(eq(warehousesTable.id, Number(req.body.warehouseId))).limit(1)
      : await db.select().from(warehousesTable).limit(1);
    if (!warehouses.length) {
      if (req.body?.warehouseId) {
        return res.status(400).json({ error: "Warehouse not found" });
      }
      const [warehouse] = await db.insert(warehousesTable).values({ name: "Main Warehouse" }).returning();
      warehouses = [warehouse];
    }
    const whId = warehouses[0].id;

    for (const item of items) {
      const existing = await db
        .select()
        .from(stockTable)
        .where(sql`${stockTable.productId} = ${item.productId} and ${stockTable.warehouseId} = ${whId}`)
        .limit(1);
      if (existing.length > 0) {
        await db.update(stockTable).set({ quantity: existing[0].quantity + item.quantity }).where(eq(stockTable.id, existing[0].id));
      } else {
        await db.insert(stockTable).values({ productId: item.productId, warehouseId: whId, quantity: item.quantity });
      }
    }

    const [updated] = await db.update(purchaseOrdersTable).set({ status: "received" }).where(eq(purchaseOrdersTable.id, id)).returning();
    const supplier = await db.select().from(suppliersTable).where(eq(suppliersTable.id, updated.supplierId));
    res.json({ ...updated, totalAmount: Number(updated.totalAmount), supplierName: supplier[0]?.name ?? "", items: items.map((i) => ({ ...i, unitCost: Number(i.unitCost), total: Number(i.total) })) });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── PURCHASE INVOICES ─────────────────────────────────────────────────────
router.get("/purchase-invoices", async (req, res) => {
  try {
    const { status } = req.query as Record<string, string>;
    const rows = await db
      .select({ id: purchaseInvoicesTable.id, reference: purchaseInvoicesTable.reference, supplierId: purchaseInvoicesTable.supplierId, supplierName: suppliersTable.name, purchaseOrderId: purchaseInvoicesTable.purchaseOrderId, status: purchaseInvoicesTable.status, totalAmount: purchaseInvoicesTable.totalAmount, dueDate: purchaseInvoicesTable.dueDate, notes: purchaseInvoicesTable.notes, createdAt: purchaseInvoicesTable.createdAt })
      .from(purchaseInvoicesTable)
      .innerJoin(suppliersTable, eq(purchaseInvoicesTable.supplierId, suppliersTable.id))
      .orderBy(desc(purchaseInvoicesTable.createdAt));

    let filtered = rows;
    if (status) filtered = filtered.filter((r) => r.status === status);
    res.json(filtered.map((r) => ({ ...r, totalAmount: Number(r.totalAmount) })));
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/purchase-invoices", async (req, res) => {
  try {
    const { supplierId, purchaseOrderId, totalAmount, dueDate, notes } = req.body;
    const [inv] = await db.insert(purchaseInvoicesTable).values({ reference: genRef("PINV"), supplierId: Number(supplierId), purchaseOrderId: purchaseOrderId ? Number(purchaseOrderId) : null, totalAmount: String(totalAmount), dueDate: dueDate ? new Date(dueDate) : null, notes: notes ?? null }).returning();
    const supplier = await db.select().from(suppliersTable).where(eq(suppliersTable.id, inv.supplierId));
    res.status(201).json({ ...inv, totalAmount: Number(inv.totalAmount), supplierName: supplier[0]?.name ?? "" });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/purchase-invoices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [inv] = await db.select({ id: purchaseInvoicesTable.id, reference: purchaseInvoicesTable.reference, supplierId: purchaseInvoicesTable.supplierId, supplierName: suppliersTable.name, purchaseOrderId: purchaseInvoicesTable.purchaseOrderId, status: purchaseInvoicesTable.status, totalAmount: purchaseInvoicesTable.totalAmount, dueDate: purchaseInvoicesTable.dueDate, notes: purchaseInvoicesTable.notes, createdAt: purchaseInvoicesTable.createdAt }).from(purchaseInvoicesTable).innerJoin(suppliersTable, eq(purchaseInvoicesTable.supplierId, suppliersTable.id)).where(eq(purchaseInvoicesTable.id, id));
    if (!inv) return res.status(404).json({ error: "Not found" });
    res.json({ ...inv, totalAmount: Number(inv.totalAmount) });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/purchase-invoices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, dueDate, notes } = req.body;
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    const [inv] = await db.update(purchaseInvoicesTable).set(updateData as any).where(eq(purchaseInvoicesTable.id, id)).returning();
    if (!inv) return res.status(404).json({ error: "Not found" });
    const supplier = await db.select().from(suppliersTable).where(eq(suppliersTable.id, inv.supplierId));
    res.json({ ...inv, totalAmount: Number(inv.totalAmount), supplierName: supplier[0]?.name ?? "" });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
