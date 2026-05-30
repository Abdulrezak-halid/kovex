/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */
import type { PurchasesReportRow } from "./purchasesReportRow";
import type { TopSupplier } from "./topSupplier";

export interface PurchasesReport {
  totalSpent: number;
  totalPurchaseOrders: number;
  rows: PurchasesReportRow[];
  topSuppliers: TopSupplier[];
}
