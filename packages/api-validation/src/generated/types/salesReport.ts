/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */
import type { SalesReportRow } from "./salesReportRow";
import type { TopCustomer } from "./topCustomer";

export interface SalesReport {
  totalRevenue: number;
  totalOrders: number;
  rows: SalesReportRow[];
  topCustomers: TopCustomer[];
}
