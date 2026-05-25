import { pgTable, text, serial, timestamp, integer, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { customersTable } from "./customers";

export const quotationsTable = pgTable("quotations", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  customerId: integer("customer_id").notNull().references(() => customersTable.id),
  status: text("status").notNull().default("draft"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quotationItemsTable = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull().references(() => quotationsTable.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  total: numeric("total", { precision: 12, scale: 2 }).notNull(),
});

export const insertQuotationSchema = createInsertSchema(quotationsTable).omit({ id: true, createdAt: true });
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotationsTable.$inferSelect;
export type QuotationItem = typeof quotationItemsTable.$inferSelect;
