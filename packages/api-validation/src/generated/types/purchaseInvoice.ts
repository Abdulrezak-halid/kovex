/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */

export interface PurchaseInvoice {
  id: number;
  reference: string;
  supplierId: number;
  supplierName: string;
  /** @nullable */
  purchaseOrderId?: number | null;
  status: string;
  totalAmount: number;
  /** @nullable */
  dueDate?: string | null;
  /** @nullable */
  notes?: string | null;
  createdAt: string;
}
