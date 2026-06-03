import { Router } from "express";
import { db } from "@sme-erp/database";
import {
  quotationsTable,
  quotationItemsTable,
  ordersTable,
  orderItemsTable,
  invoicesTable,
  invoiceItemsTable,
  customersTable,
  productsTable,
  stockTable,
} from "@sme-erp/database";
import { eq, sql, desc } from "drizzle-orm";
import { applyListQuery, parseListQuery } from "./list-query";

const router = Router();

function genRef(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

async function decreaseStockForSale(
  items: { productId: number; quantity: number; productName?: string }[],
) {
  for (const item of items) {
    const stockRows = await db
      .select()
      .from(stockTable)
      .where(eq(stockTable.productId, item.productId));
    const available = stockRows.reduce((sum, row) => sum + row.quantity, 0);

    if (available < item.quantity) {
      const productLabel = item.productName || `product ${item.productId}`;
      throw new Error(
        `Insufficient stock for ${productLabel}. Available: ${available}, required: ${item.quantity}.`,
      );
    }

    let remaining = item.quantity;
    for (const row of stockRows) {
      if (remaining <= 0) break;
      const deducted = Math.min(row.quantity, remaining);
      await db
        .update(stockTable)
        .set({ quantity: row.quantity - deducted })
        .where(eq(stockTable.id, row.id));
      remaining -= deducted;
    }
  }
}

// ── QUOTATIONS ────────────────────────────────────────────────────────────
router.get("/quotations", async (req, res) => {
  try {
    const { status, customerId } = req.query as Record<string, string>;
    const rows = await db
      .select({
        id: quotationsTable.id,
        reference: quotationsTable.reference,
        customerId: quotationsTable.customerId,
        customerName: customersTable.name,
        status: quotationsTable.status,
        totalAmount: quotationsTable.totalAmount,
        validUntil: quotationsTable.validUntil,
        notes: quotationsTable.notes,
        createdAt: quotationsTable.createdAt,
      })
      .from(quotationsTable)
      .innerJoin(
        customersTable,
        eq(quotationsTable.customerId, customersTable.id),
      )
      .orderBy(desc(quotationsTable.createdAt));

    const options = parseListQuery(req.query);
    let filtered = rows;
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (customerId)
      filtered = filtered.filter((r) => r.customerId === Number(customerId));
    filtered = applyListQuery(
      filtered,
      options,
      ["reference", "customerName", "status"],
      {
        reference: (row) => row.reference,
        customerName: (row) => row.customerName,
        status: (row) => row.status,
        totalAmount: (row) => Number(row.totalAmount),
        createdAt: (row) => row.createdAt,
      },
    );

    const withItems = await Promise.all(
      filtered.map(async (q) => {
        const items = await db
          .select()
          .from(quotationItemsTable)
          .where(eq(quotationItemsTable.quotationId, q.id));
        return {
          ...q,
          totalAmount: Number(q.totalAmount),
          items: items.map((i) => ({
            ...i,
            unitPrice: Number(i.unitPrice),
            total: Number(i.total),
          })),
        };
      }),
    );
    res.json(withItems);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/quotations", async (req, res) => {
  try {
    const { customerId, validUntil, notes, items } = req.body;
    const total = items.reduce(
      (s: number, i: any) => s + i.quantity * i.unitPrice,
      0,
    );
    const [q] = await db
      .insert(quotationsTable)
      .values({
        reference: genRef("QUO"),
        customerId: Number(customerId),
        validUntil: validUntil ? new Date(validUntil) : null,
        notes: notes ?? null,
        totalAmount: String(total),
      })
      .returning();

    const prods = await db.select().from(productsTable);
    const itemRows = items.map((i: any) => {
      const p = prods.find((x) => x.id === Number(i.productId));
      return {
        quotationId: q.id,
        productId: Number(i.productId),
        productName: p?.name ?? "",
        quantity: Number(i.quantity),
        unitPrice: String(i.unitPrice),
        total: String(Number(i.quantity) * Number(i.unitPrice)),
      };
    });
    const savedItems = await db
      .insert(quotationItemsTable)
      .values(itemRows)
      .returning();
    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, q.customerId));
    res
      .status(201)
      .json({
        ...q,
        totalAmount: Number(q.totalAmount),
        customerName: customer[0]?.name ?? "",
        items: savedItems.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/quotations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [q] = await db
      .select({
        id: quotationsTable.id,
        reference: quotationsTable.reference,
        customerId: quotationsTable.customerId,
        customerName: customersTable.name,
        status: quotationsTable.status,
        totalAmount: quotationsTable.totalAmount,
        validUntil: quotationsTable.validUntil,
        notes: quotationsTable.notes,
        createdAt: quotationsTable.createdAt,
      })
      .from(quotationsTable)
      .innerJoin(
        customersTable,
        eq(quotationsTable.customerId, customersTable.id),
      )
      .where(eq(quotationsTable.id, id));
    if (!q) return res.status(404).json({ error: "Not found" });
    const items = await db
      .select()
      .from(quotationItemsTable)
      .where(eq(quotationItemsTable.quotationId, id));
    res.json({
      ...q,
      totalAmount: Number(q.totalAmount),
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/quotations/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, validUntil, notes, items } = req.body;
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (validUntil !== undefined)
      updateData.validUntil = validUntil ? new Date(validUntil) : null;
    if (notes !== undefined) updateData.notes = notes;
    if (items?.length) {
      const total = items.reduce(
        (s: number, i: any) => s + i.quantity * i.unitPrice,
        0,
      );
      updateData.totalAmount = String(total);
    }
    const [q] = await db
      .update(quotationsTable)
      .set(updateData as any)
      .where(eq(quotationsTable.id, id))
      .returning();
    if (!q) return res.status(404).json({ error: "Not found" });
    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, q.customerId));
    const qItems = await db
      .select()
      .from(quotationItemsTable)
      .where(eq(quotationItemsTable.quotationId, id));
    res.json({
      ...q,
      totalAmount: Number(q.totalAmount),
      customerName: customer[0]?.name ?? "",
      items: qItems.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
    });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/quotations/:id", async (req, res) => {
  try {
    await db
      .delete(quotationsTable)
      .where(eq(quotationsTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/quotations/:id/convert", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [q] = await db
      .select()
      .from(quotationsTable)
      .where(eq(quotationsTable.id, id));
    if (!q) return res.status(404).json({ error: "Not found" });
    const items = await db
      .select()
      .from(quotationItemsTable)
      .where(eq(quotationItemsTable.quotationId, id));
    const [order] = await db
      .insert(ordersTable)
      .values({
        reference: genRef("ORD"),
        customerId: q.customerId,
        quotationId: q.id,
        totalAmount: q.totalAmount,
        notes: q.notes,
      })
      .returning();
    const orderItems = items.map((i) => ({
      orderId: order.id,
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    }));
    const savedItems = await db
      .insert(orderItemsTable)
      .values(orderItems)
      .returning();
    await db
      .update(quotationsTable)
      .set({ status: "accepted" })
      .where(eq(quotationsTable.id, id));
    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, order.customerId));
    res
      .status(201)
      .json({
        ...order,
        totalAmount: Number(order.totalAmount),
        customerName: customer[0]?.name ?? "",
        items: savedItems.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── ORDERS ────────────────────────────────────────────────────────────────
router.get("/orders", async (req, res) => {
  try {
    const { status, customerId } = req.query as Record<string, string>;
    const rows = await db
      .select({
        id: ordersTable.id,
        reference: ordersTable.reference,
        customerId: ordersTable.customerId,
        customerName: customersTable.name,
        status: ordersTable.status,
        totalAmount: ordersTable.totalAmount,
        notes: ordersTable.notes,
        quotationId: ordersTable.quotationId,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .innerJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .orderBy(desc(ordersTable.createdAt));

    const options = parseListQuery(req.query);
    let filtered = rows;
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (customerId)
      filtered = filtered.filter((r) => r.customerId === Number(customerId));
    filtered = applyListQuery(
      filtered,
      options,
      ["reference", "customerName", "status"],
      {
        reference: (row) => row.reference,
        customerName: (row) => row.customerName,
        status: (row) => row.status,
        totalAmount: (row) => Number(row.totalAmount),
        createdAt: (row) => row.createdAt,
      },
    );

    const withItems = await Promise.all(
      filtered.map(async (o) => {
        const items = await db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, o.id));
        return {
          ...o,
          totalAmount: Number(o.totalAmount),
          items: items.map((i) => ({
            ...i,
            unitPrice: Number(i.unitPrice),
            total: Number(i.total),
          })),
        };
      }),
    );
    res.json(withItems);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders", async (req, res) => {
  try {
    const { customerId, notes, items } = req.body;
    const total = items.reduce(
      (s: number, i: any) => s + i.quantity * i.unitPrice,
      0,
    );
    const [order] = await db
      .insert(ordersTable)
      .values({
        reference: genRef("ORD"),
        customerId: Number(customerId),
        notes: notes ?? null,
        totalAmount: String(total),
      })
      .returning();
    const prods = await db.select().from(productsTable);
    const itemRows = items.map((i: any) => {
      const p = prods.find((x) => x.id === Number(i.productId));
      return {
        orderId: order.id,
        productId: Number(i.productId),
        productName: p?.name ?? "",
        quantity: Number(i.quantity),
        unitPrice: String(i.unitPrice),
        total: String(Number(i.quantity) * Number(i.unitPrice)),
      };
    });
    const savedItems = await db
      .insert(orderItemsTable)
      .values(itemRows)
      .returning();

    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, order.customerId));
    res
      .status(201)
      .json({
        ...order,
        totalAmount: Number(order.totalAmount),
        customerName: customer[0]?.name ?? "",
        items: savedItems.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [o] = await db
      .select({
        id: ordersTable.id,
        reference: ordersTable.reference,
        customerId: ordersTable.customerId,
        customerName: customersTable.name,
        status: ordersTable.status,
        totalAmount: ordersTable.totalAmount,
        notes: ordersTable.notes,
        quotationId: ordersTable.quotationId,
        createdAt: ordersTable.createdAt,
      })
      .from(ordersTable)
      .innerJoin(customersTable, eq(ordersTable.customerId, customersTable.id))
      .where(eq(ordersTable.id, id));
    if (!o) return res.status(404).json({ error: "Not found" });
    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, id));
    res.json({
      ...o,
      totalAmount: Number(o.totalAmount),
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/orders/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body;
    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    const [o] = await db
      .update(ordersTable)
      .set(updateData as any)
      .where(eq(ordersTable.id, id))
      .returning();
    if (!o) return res.status(404).json({ error: "Not found" });
    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, o.customerId));
    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, id));
    res.json({
      ...o,
      totalAmount: Number(o.totalAmount),
      customerName: customer[0]?.name ?? "",
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
    });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/orders/:id", async (req, res) => {
  try {
    await db
      .delete(ordersTable)
      .where(eq(ordersTable.id, Number(req.params.id)));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/orders/:id/invoice", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [o] = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.id, id));
    if (!o) return res.status(404).json({ error: "Not found" });
    const items = await db
      .select()
      .from(orderItemsTable)
      .where(eq(orderItemsTable.orderId, id));
    const [inv] = await db
      .insert(invoicesTable)
      .values({
        reference: genRef("INV"),
        customerId: o.customerId,
        orderId: o.id,
        totalAmount: o.totalAmount,
        notes: o.notes,
      })
      .returning();
    const invItems = items.map((i) => ({
      invoiceId: inv.id,
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      total: i.total,
    }));
    const savedItems = await db
      .insert(invoiceItemsTable)
      .values(invItems)
      .returning();
    await db
      .update(ordersTable)
      .set({ status: "delivered" })
      .where(eq(ordersTable.id, id));
    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, inv.customerId));
    res
      .status(201)
      .json({
        ...inv,
        totalAmount: Number(inv.totalAmount),
        customerName: customer[0]?.name ?? "",
        items: savedItems.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── INVOICES ──────────────────────────────────────────────────────────────
router.get("/invoices", async (req, res) => {
  try {
    const { status, customerId } = req.query as Record<string, string>;
    const rows = await db
      .select({
        id: invoicesTable.id,
        reference: invoicesTable.reference,
        customerId: invoicesTable.customerId,
        customerName: customersTable.name,
        orderId: invoicesTable.orderId,
        status: invoicesTable.status,
        totalAmount: invoicesTable.totalAmount,
        dueDate: invoicesTable.dueDate,
        notes: invoicesTable.notes,
        createdAt: invoicesTable.createdAt,
      })
      .from(invoicesTable)
      .innerJoin(
        customersTable,
        eq(invoicesTable.customerId, customersTable.id),
      )
      .orderBy(desc(invoicesTable.createdAt));

    const options = parseListQuery(req.query);
    let filtered = rows;
    if (status) filtered = filtered.filter((r) => r.status === status);
    if (customerId)
      filtered = filtered.filter((r) => r.customerId === Number(customerId));
    filtered = applyListQuery(
      filtered,
      options,
      ["reference", "customerName", "status"],
      {
        reference: (row) => row.reference,
        customerName: (row) => row.customerName,
        status: (row) => row.status,
        totalAmount: (row) => Number(row.totalAmount),
        dueDate: (row) => row.dueDate,
        createdAt: (row) => row.createdAt,
      },
    );

    const withItems = await Promise.all(
      filtered.map(async (inv) => {
        const items = await db
          .select()
          .from(invoiceItemsTable)
          .where(eq(invoiceItemsTable.invoiceId, inv.id));
        return {
          ...inv,
          totalAmount: Number(inv.totalAmount),
          items: items.map((i) => ({
            ...i,
            unitPrice: Number(i.unitPrice),
            total: Number(i.total),
          })),
        };
      }),
    );
    res.json(withItems);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { customerId, orderId, dueDate, notes, items } = req.body;
    const total = items.reduce(
      (s: number, i: any) => s + i.quantity * i.unitPrice,
      0,
    );
    const [inv] = await db
      .insert(invoicesTable)
      .values({
        reference: genRef("INV"),
        customerId: Number(customerId),
        orderId: orderId ? Number(orderId) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes: notes ?? null,
        totalAmount: String(total),
      })
      .returning();
    const prods = await db.select().from(productsTable);
    const itemRows = items.map((i: any) => {
      const p = prods.find((x) => x.id === Number(i.productId));
      return {
        invoiceId: inv.id,
        productId: Number(i.productId),
        productName: p?.name ?? "",
        quantity: Number(i.quantity),
        unitPrice: String(i.unitPrice),
        total: String(Number(i.quantity) * Number(i.unitPrice)),
      };
    });
    const savedItems = await db
      .insert(invoiceItemsTable)
      .values(itemRows)
      .returning();
    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, inv.customerId));
    res
      .status(201)
      .json({
        ...inv,
        totalAmount: Number(inv.totalAmount),
        customerName: customer[0]?.name ?? "",
        items: savedItems.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
      });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [inv] = await db
      .select({
        id: invoicesTable.id,
        reference: invoicesTable.reference,
        customerId: invoicesTable.customerId,
        customerName: customersTable.name,
        orderId: invoicesTable.orderId,
        status: invoicesTable.status,
        totalAmount: invoicesTable.totalAmount,
        dueDate: invoicesTable.dueDate,
        notes: invoicesTable.notes,
        createdAt: invoicesTable.createdAt,
      })
      .from(invoicesTable)
      .innerJoin(
        customersTable,
        eq(invoicesTable.customerId, customersTable.id),
      )
      .where(eq(invoicesTable.id, id));
    if (!inv) return res.status(404).json({ error: "Not found" });
    const items = await db
      .select()
      .from(invoiceItemsTable)
      .where(eq(invoiceItemsTable.invoiceId, id));
    res.json({
      ...inv,
      totalAmount: Number(inv.totalAmount),
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/invoices/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, dueDate, notes } = req.body;
    const [current] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, id));
    if (!current) return res.status(404).json({ error: "Not found" });

    if (status === "paid" && current.status !== "paid") {
      const items = await db
        .select()
        .from(invoiceItemsTable)
        .where(eq(invoiceItemsTable.invoiceId, id));
      await decreaseStockForSale(items);
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (dueDate !== undefined)
      updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (notes !== undefined) updateData.notes = notes;
    const [inv] = await db
      .update(invoicesTable)
      .set(updateData as any)
      .where(eq(invoicesTable.id, id))
      .returning();
    if (!inv) return res.status(404).json({ error: "Not found" });
    const customer = await db
      .select()
      .from(customersTable)
      .where(eq(customersTable.id, inv.customerId));
    const items = await db
      .select()
      .from(invoiceItemsTable)
      .where(eq(invoiceItemsTable.invoiceId, id));
    res.json({
      ...inv,
      totalAmount: Number(inv.totalAmount),
      customerName: customer[0]?.name ?? "",
      items: items.map((i) => ({
        ...i,
        unitPrice: Number(i.unitPrice),
        total: Number(i.total),
      })),
    });
  } catch (err) {
    req.log.error({ err });
    res.status(400).json({
      error: err instanceof Error ? err.message : "Invalid input",
    });
  }
});

export default router;
