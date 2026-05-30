/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */
import type { PurchaseOrderItemInput } from "./purchaseOrderItemInput";

export interface PurchaseOrderInput {
  supplierId: number;
  expectedDate?: string;
  notes?: string;
  items: PurchaseOrderItemInput[];
}
