/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  /** @nullable */
  department?: string | null;
  active: boolean;
  createdAt: string;
}
