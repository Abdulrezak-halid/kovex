/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */
import type { OrderItemInput } from "./orderItemInput";

export interface QuotationUpdate {
  status?: string;
  validUntil?: string;
  notes?: string;
  items?: OrderItemInput[];
}
