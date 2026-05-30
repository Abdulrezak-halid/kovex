/**
 * 
 * Do not edit manually.
 * Api
 * SME ERP System API
 * OpenAPI spec version: 0.1.0
 */

export interface TaskInput {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: number;
  dueDate?: string;
}
