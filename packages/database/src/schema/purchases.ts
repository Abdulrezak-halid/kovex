import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { suppliersTable } from "./suppliers";

export const purchaseOrdersTable = pgTable("purchase_orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliersTable.id),
  status: text("status").notNull().default("draft"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  expectedDate: timestamp("expected_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchaseOrderItemsTable = pgTable("purchase_order_items", {
  id: serial("id").primaryKey(),
  purchaseOrderId: integer("purchase_order_id").notNull().references(() => purchaseOrdersTable.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: numeric("unit_cost", { precision: 12, scale: 2 }).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
});

export const purchaseInvoicesTable = pgTable("purchase_invoices", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  supplierId: integer("supplier_id").notNull().references(() => suppliersTable.id),
  purchaseOrderId: integer("purchase_order_id"),
  status: text("status").notNull().default("pending"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrdersTable).omit({ id: true, createdAt: true });
export const insertPurchaseInvoiceSchema = createInsertSchema(purchaseInvoicesTable).omit({ id: true, createdAt: true });

export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrdersTable.$inferSelect;
export type PurchaseOrderItem = typeof purchaseOrderItemsTable.$inferSelect;
export type InsertPurchaseInvoice = z.infer<typeof insertPurchaseInvoiceSchema>;
export type PurchaseInvoice = typeof purchaseInvoicesTable.$inferSelect;
