/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */
import type { InventoryReportRow } from "./inventoryReportRow";

export interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  rows: InventoryReportRow[];
}
