/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */

export interface Product {
  id: number;
  name: string;
  sku: string;
  /** @nullable */
  description?: string | null;
  price: number;
  /** @nullable */
  cost?: number | null;
  unit: string;
  minimumStock: number;
  createdAt: string;
}
