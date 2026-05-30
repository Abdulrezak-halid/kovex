/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */

export interface LowStockItem {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
  warehouseName: string;
}
