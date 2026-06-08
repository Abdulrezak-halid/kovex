import type { Notification } from "@sme-erp/api-client";

export function notificationTargetPath(notification: Notification) {
  if (notification.entityType === "product") return "/inventory/products";
  if (notification.entityType === "invoice") return "/sales/invoices";
  if (notification.entityType === "task") return "/planning/tasks";
  return "/";
}

export function unreadCountLabel(count: number) {
  if (count <= 0) return "";
  return count > 99 ? "99+" : String(count);
}
