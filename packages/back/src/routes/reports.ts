import { Router } from "express";
import { db } from "@sme-erp/database";
import {
  ordersTable,
  orderItemsTable,
  customersTable,
  productsTable,
  stockTable,
  purchaseOrdersTable,
  suppliersTable,
} from "@sme-erp/database";
import { eq, gte, lte } from "drizzle-orm";

const router = Router();

router.get("/reports/sales", async (req, res) => {
  try {
    const { from, to } = req.query as Record<string, string>;

    let ordersQuery = db.select().from(ordersTable).$dynamic();
    if (from)
      ordersQuery = ordersQuery.where(
        gte(ordersTable.createdAt, new Date(from)),
      );
    if (to)
      ordersQuery = ordersQuery.where(lte(ordersTable.createdAt, new Date(to)));

    const orders = await ordersQuery;
    const totalRevenue = orders.reduce((s, o) => s + Number(o.totalAmount), 0);
    const totalOrders = orders.length;

    // Group by date
    const byDate: Record<string, { ordersCount: number; revenue: number }> = {};
    for (const o of orders) {
      const d = new Date(o.createdAt).toISOString().split("T")[0];
      if (!byDate[d]) byDate[d] = { ordersCount: 0, revenue: 0 };
      byDate[d].ordersCount++;
      byDate[d].revenue += Number(o.totalAmount);
    }
    const rows = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    // Top customers
    const customerSpend: Record<
      number,
      {
        customerId: number;
        customerName: string;
        totalSpent: number;
        ordersCount: number;
      }
    > = {};
    for (const o of orders) {
      if (!customerSpend[o.customerId]) {
        const [c] = await db
          .select()
          .from(customersTable)
          .where(eq(customersTable.id, o.customerId));
        customerSpend[o.customerId] = {
          customerId: o.customerId,
          customerName: c?.name ?? "",
          totalSpent: 0,
          ordersCount: 0,
        };
      }
      customerSpend[o.customerId].totalSpent += Number(o.totalAmount);
      customerSpend[o.customerId].ordersCount++;
    }
    const topCustomers = Object.values(customerSpend)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    res.json({ totalRevenue, totalOrders, rows, topCustomers });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/inventory", async (req, res) => {
  try {
    const products = await db.select().from(productsTable);
    const stockRows = await db.select().from(stockTable);

    const reportRows = products.map((p) => {
      const totalStock = stockRows
        .filter((s) => s.productId === p.id)
        .reduce((sum, s) => sum + s.quantity, 0);
      const stockValue = totalStock * Number(p.price);
      return {
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        totalStock,
        minimumStock: p.minimumStock,
        stockValue,
      };
    });

    const totalStockValue = reportRows.reduce((s, r) => s + r.stockValue, 0);
    const lowStockCount = reportRows.filter(
      (r) => r.totalStock <= r.minimumStock,
    ).length;

    res.json({
      totalProducts: products.length,
      totalStockValue,
      lowStockCount,
      rows: reportRows,
    });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/reports/purchases", async (req, res) => {
  try {
    const { from, to } = req.query as Record<string, string>;

    let posQuery = db.select().from(purchaseOrdersTable).$dynamic();
    if (from)
      posQuery = posQuery.where(
        gte(purchaseOrdersTable.createdAt, new Date(from)),
      );
    if (to)
      posQuery = posQuery.where(
        lte(purchaseOrdersTable.createdAt, new Date(to)),
      );

    const pos = await posQuery;
    const totalSpent = pos.reduce((s, o) => s + Number(o.totalAmount), 0);
    const totalPurchaseOrders = pos.length;

    const byDate: Record<
      string,
      { purchaseOrdersCount: number; totalSpent: number }
    > = {};
    for (const po of pos) {
      const d = new Date(po.createdAt).toISOString().split("T")[0];
      if (!byDate[d]) byDate[d] = { purchaseOrdersCount: 0, totalSpent: 0 };
      byDate[d].purchaseOrdersCount++;
      byDate[d].totalSpent += Number(po.totalAmount);
    }
    const rows = Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, ...v }));

    const supplierSpend: Record<
      number,
      {
        supplierId: number;
        supplierName: string;
        totalPurchased: number;
        ordersCount: number;
      }
    > = {};
    for (const po of pos) {
      if (!supplierSpend[po.supplierId]) {
        const [s] = await db
          .select()
          .from(suppliersTable)
          .where(eq(suppliersTable.id, po.supplierId));
        supplierSpend[po.supplierId] = {
          supplierId: po.supplierId,
          supplierName: s?.name ?? "",
          totalPurchased: 0,
          ordersCount: 0,
        };
      }
      supplierSpend[po.supplierId].totalPurchased += Number(po.totalAmount);
      supplierSpend[po.supplierId].ordersCount++;
    }
    const topSuppliers = Object.values(supplierSpend)
      .sort((a, b) => b.totalPurchased - a.totalPurchased)
      .slice(0, 10);

    res.json({ totalSpent, totalPurchaseOrders, rows, topSuppliers });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
