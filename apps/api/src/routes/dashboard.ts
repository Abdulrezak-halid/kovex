import { Router } from "express";
import { db } from "@sme-erp/database";
import {
  customersTable, productsTable, ordersTable, orderItemsTable,
  invoicesTable, stockTable, quotationItemsTable,
} from "@sme-erp/database";
import { sql, desc, lt, and } from "drizzle-orm";

const router = Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalCustomers,
      totalProducts,
      salesThisMonth,
      ordersThisMonth,
      pendingOrders,
      revenueThisYear,
      pendingInvoices,
      lowStockCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(customersTable),
      db.select({ count: sql<number>`count(*)::int` }).from(productsTable),
      db.select({ total: sql<number>`coalesce(sum(total_amount::numeric), 0)` })
        .from(ordersTable)
        .where(sql`created_at >= ${startOfMonth.toISOString()}`),
      db.select({ count: sql<number>`count(*)::int` })
        .from(ordersTable)
        .where(sql`created_at >= ${startOfMonth.toISOString()}`),
      db.select({ count: sql<number>`count(*)::int` })
        .from(ordersTable)
        .where(sql`status = 'pending'`),
      db.select({ total: sql<number>`coalesce(sum(total_amount::numeric), 0)` })
        .from(ordersTable)
        .where(sql`created_at >= ${startOfYear.toISOString()}`),
      db.select({ count: sql<number>`count(*)::int` })
        .from(invoicesTable)
        .where(sql`status in ('draft', 'sent')`),
      db.select({ count: sql<number>`count(*)::int` })
        .from(stockTable)
        .innerJoin(productsTable, sql`${stockTable.productId} = ${productsTable.id}`)
        .where(sql`${stockTable.quantity} <= ${productsTable.minimumStock}`),
    ]);

    res.json({
      totalCustomers: totalCustomers[0]?.count ?? 0,
      totalProducts: totalProducts[0]?.count ?? 0,
      totalSalesThisMonth: Number(salesThisMonth[0]?.total ?? 0),
      totalOrdersThisMonth: ordersThisMonth[0]?.count ?? 0,
      pendingOrders: pendingOrders[0]?.count ?? 0,
      totalRevenueThisYear: Number(revenueThisYear[0]?.total ?? 0),
      pendingInvoicesCount: pendingInvoices[0]?.count ?? 0,
      lowStockCount: lowStockCount[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "dashboard summary error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/top-products", async (req, res) => {
  try {
    const rows = await db
      .select({
        productId: orderItemsTable.productId,
        productName: orderItemsTable.productName,
        sku: productsTable.sku,
        quantitySold: sql<number>`sum(${orderItemsTable.quantity})::int`,
        totalRevenue: sql<number>`sum(${orderItemsTable.total}::numeric)`,
      })
      .from(orderItemsTable)
      .innerJoin(productsTable, sql`${orderItemsTable.productId} = ${productsTable.id}`)
      .groupBy(orderItemsTable.productId, orderItemsTable.productName, productsTable.sku)
      .orderBy(desc(sql`sum(${orderItemsTable.quantity})`))
      .limit(10);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "top products error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/recent-orders", async (req, res) => {
  try {
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
      .innerJoin(customersTable, sql`${ordersTable.customerId} = ${customersTable.id}`)
      .orderBy(desc(ordersTable.createdAt))
      .limit(10);
    res.json(rows.map((r) => ({ ...r, items: [], totalAmount: Number(r.totalAmount) })));
  } catch (err) {
    req.log.error({ err }, "recent orders error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/low-stock", async (req, res) => {
  try {
    const rows = await db
      .select({
        productId: productsTable.id,
        productName: productsTable.name,
        sku: productsTable.sku,
        minimumStock: productsTable.minimumStock,
        currentStock: stockTable.quantity,
        warehouseName: sql<string>`'Default'`,
      })
      .from(stockTable)
      .innerJoin(productsTable, sql`${stockTable.productId} = ${productsTable.id}`)
      .where(sql`${stockTable.quantity} <= ${productsTable.minimumStock}`)
      .orderBy(stockTable.quantity)
      .limit(20);
    res.json(rows);
  } catch (err) {
    req.log.error({ err }, "low stock error");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
