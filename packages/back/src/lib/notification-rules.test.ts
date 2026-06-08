import assert from "node:assert/strict";
import test from "node:test";
import {
  canAccessNotification,
  markReadPatchForUser,
  notificationDedupeKey,
  taskDeadlineState,
} from "./notification-rules";

test("notificationDedupeKey keeps same user/type/entity events unique", () => {
  const first = notificationDedupeKey({
    userId: 7,
    type: "low_stock",
    title: "Low stock",
    message: "Steel Bracket is low.",
    entityType: "product",
    entityId: 12,
  });
  const duplicate = notificationDedupeKey({
    userId: 7,
    type: "low_stock",
    title: "Different title",
    message: "Different message",
    entityType: "product",
    entityId: 12,
  });
  const otherUser = notificationDedupeKey({
    userId: 8,
    type: "low_stock",
    title: "Low stock",
    message: "Steel Bracket is low.",
    entityType: "product",
    entityId: 12,
  });

  assert.equal(first, duplicate);
  assert.notEqual(first, otherUser);
});

test("notification ownership blocks other users", () => {
  assert.equal(canAccessNotification(3, 3), true);
  assert.equal(canAccessNotification(3, 4), false);
});

test("markReadPatchForUser returns read patch only for the owner", () => {
  const readAt = new Date("2026-06-09T10:00:00.000Z");

  assert.deepEqual(markReadPatchForUser(3, 3, readAt), {
    isRead: true,
    readAt,
  });
  assert.equal(markReadPatchForUser(3, 4, readAt), null);
});

test("taskDeadlineState identifies approaching and overdue tasks", () => {
  const now = new Date("2026-06-09T09:00:00.000Z");

  assert.equal(taskDeadlineState("2026-06-08", now), "overdue");
  assert.equal(taskDeadlineState("2026-06-12", now), "approaching");
  assert.equal(taskDeadlineState("2026-06-20", now), null);
});
