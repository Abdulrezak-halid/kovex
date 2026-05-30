/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */

export interface StockLevel {
  productId: number;
  productName: string;
  sku: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  minimumStock: number;
}
