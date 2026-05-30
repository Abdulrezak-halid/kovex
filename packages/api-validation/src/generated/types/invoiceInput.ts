/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */
import type { OrderItemInput } from "./orderItemInput";

export interface InvoiceInput {
  customerId: number;
  orderId?: number;
  dueDate?: string;
  notes?: string;
  items: OrderItemInput[];
}
