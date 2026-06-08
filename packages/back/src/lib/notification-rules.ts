import type { NotificationType } from "@sme-erp/database";

export type NotificationEntityType = "product" | "invoice" | "task";

export type NotificationDraft = {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  entityType: NotificationEntityType;
  entityId: number;
};

export function notificationDedupeKey(draft: NotificationDraft) {
  return `${draft.userId}:${draft.type}:${draft.entityType}:${draft.entityId}`;
}

export function canAccessNotification(userId: number, notificationUserId: number) {
  return userId === notificationUserId;
}

export function markReadPatchForUser(
  userId: number,
  notificationUserId: number,
  readAt = new Date(),
) {
  if (!canAccessNotification(userId, notificationUserId)) return null;
  return { isRead: true, readAt };
}

export function taskDeadlineState(
  dueDate: string | Date | null | undefined,
  now = new Date(),
) {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  if (Number.isNaN(due.getTime())) return null;

  const dueDay = new Date(
    due.getFullYear(),
    due.getMonth(),
    due.getDate(),
  ).getTime();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const daysUntilDue = Math.ceil((dueDay - today) / 86_400_000);

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 3) return "approaching";
  return null;
}
