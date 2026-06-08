import assert from "node:assert/strict";
import test from "node:test";
import type { Notification } from "@sme-erp/api-client";
import { notificationTargetPath, unreadCountLabel } from "./notifications";

function notification(entityType: Notification["entityType"]): Notification {
  return {
    id: 1,
    userId: 3,
    type: entityType === "product" ? "low_stock" : "task_deadline",
    title: "Test",
    message: "Test notification",
    entityType,
    entityId: 10,
    isRead: false,
    createdAt: "2026-06-09T10:00:00.000Z",
    readAt: null,
  };
}

test("unreadCountLabel hides zero and caps large counts", () => {
  assert.equal(unreadCountLabel(0), "");
  assert.equal(unreadCountLabel(4), "4");
  assert.equal(unreadCountLabel(120), "99+");
});

test("notificationTargetPath maps notifications to reachable pages", () => {
  assert.equal(notificationTargetPath(notification("product")), "/inventory/products");
  assert.equal(notificationTargetPath(notification("invoice")), "/sales/invoices");
  assert.equal(notificationTargetPath(notification("task")), "/planning/tasks");
});
