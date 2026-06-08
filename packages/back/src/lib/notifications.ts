import {
  customersTable,
  db,
  invoicesTable,
  notificationsTable,
  productsTable,
  projectsTable,
  stockTable,
  tasksTable,
  usersTable,
  type Notification,
  type User,
} from "@sme-erp/database";
import { and, eq, inArray, lte, ne } from "drizzle-orm";
import { roleCanAccessModule, type PermissionModule } from "./auth";
import {
  markReadPatchForUser,
  notificationDedupeKey,
  taskDeadlineState,
  type NotificationDraft,
} from "./notification-rules";

export {
  canAccessNotification,
  markReadPatchForUser,
  notificationDedupeKey,
  taskDeadlineState,
} from "./notification-rules";

type AuthUser = Pick<User, "id" | "name" | "role" | "active">;
type ProductStockState = {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
};

const TASK_DEADLINE_WINDOW_DAYS = 3;

function isActiveUser(user: Pick<User, "active">) {
  return user.active !== false;
}

function userCanAccessModule(
  user: Pick<User, "role" | "active">,
  module: PermissionModule,
) {
  return isActiveUser(user) && roleCanAccessModule(user.role, module);
}

function formatDateLabel(value: string | Date | null | undefined) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

async function usersForModule(module: PermissionModule) {
  const users = await db.select().from(usersTable);
  return users.filter((user) => userCanAccessModule(user, module));
}

async function createNotification(draft: NotificationDraft) {
  const [existing] = await db
    .select()
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.userId, draft.userId),
        eq(notificationsTable.type, draft.type),
        eq(notificationsTable.entityType, draft.entityType),
        eq(notificationsTable.entityId, draft.entityId),
      ),
    )
    .limit(1);

  if (existing) return existing;

  const [created] = await db
    .insert(notificationsTable)
    .values(draft)
    .returning();
  return created;
}

async function createNotifications(drafts: NotificationDraft[]) {
  const uniqueDrafts = new Map<string, NotificationDraft>();
  for (const draft of drafts) {
    uniqueDrafts.set(notificationDedupeKey(draft), draft);
  }

  const created: Notification[] = [];
  for (const draft of uniqueDrafts.values()) {
    const notification = await createNotification(draft);
    if (notification) created.push(notification);
  }
  return created;
}

async function lowStockProducts(productIds?: number[]) {
  const productsQuery =
    productIds && productIds.length
      ? db
          .select()
          .from(productsTable)
          .where(inArray(productsTable.id, productIds))
      : db.select().from(productsTable);

  const [products, stockRows] = await Promise.all([
    productsQuery,
    db.select().from(stockTable),
  ]);

  return products
    .map<ProductStockState>((product) => {
      const currentStock = stockRows
        .filter((stock) => stock.productId === product.id)
        .reduce((sum, stock) => sum + stock.quantity, 0);

      return {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        currentStock,
        minimumStock: product.minimumStock,
      };
    })
    .filter((product) => product.currentStock <= product.minimumStock);
}

export async function createLowStockNotifications(
  productIds?: number[],
  recipientUsers?: Pick<User, "id" | "role" | "active">[],
) {
  const [products, recipients] = await Promise.all([
    lowStockProducts(productIds),
    recipientUsers ?? usersForModule("inventory"),
  ]);

  return createNotifications(
    products.flatMap((product) =>
      recipients
        .filter((user) => userCanAccessModule(user, "inventory"))
        .map((user) => ({
          userId: user.id,
          type: "low_stock" as const,
          title: `Low stock: ${product.productName}`,
          message: `${product.productName} (${product.sku}) has ${product.currentStock} in stock. Minimum stock is ${product.minimumStock}.`,
          entityType: "product" as const,
          entityId: product.productId,
        })),
    ),
  );
}

export async function createOverdueInvoiceNotifications(
  invoiceIds?: number[],
  recipientUsers?: Pick<User, "id" | "role" | "active">[],
) {
  const invoiceQuery =
    invoiceIds && invoiceIds.length
      ? db
          .select({
            id: invoicesTable.id,
            reference: invoicesTable.reference,
            customerName: customersTable.name,
            status: invoicesTable.status,
            dueDate: invoicesTable.dueDate,
          })
          .from(invoicesTable)
          .innerJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
          .where(inArray(invoicesTable.id, invoiceIds))
      : db
          .select({
            id: invoicesTable.id,
            reference: invoicesTable.reference,
            customerName: customersTable.name,
            status: invoicesTable.status,
            dueDate: invoicesTable.dueDate,
          })
          .from(invoicesTable)
          .innerJoin(customersTable, eq(invoicesTable.customerId, customersTable.id))
          .where(
            and(
              lte(invoicesTable.dueDate, new Date()),
              ne(invoicesTable.status, "paid"),
            ),
          );

  const [invoices, recipients] = await Promise.all([
    invoiceQuery,
    recipientUsers ?? usersForModule("accounting"),
  ]);

  const overdueInvoices = invoices.filter(
    (invoice) =>
      invoice.dueDate &&
      invoice.status !== "paid" &&
      new Date(invoice.dueDate).getTime() <= Date.now(),
  );

  return createNotifications(
    overdueInvoices.flatMap((invoice) =>
      recipients
        .filter((user) => userCanAccessModule(user, "accounting"))
        .map((user) => ({
          userId: user.id,
          type: "overdue_invoice" as const,
          title: `Overdue invoice: ${invoice.reference}`,
          message: `${invoice.reference} for ${invoice.customerName} was due on ${formatDateLabel(invoice.dueDate)}.`,
          entityType: "invoice" as const,
          entityId: invoice.id,
        })),
    ),
  );
}

async function taskRows(taskIds?: number[]) {
  const query =
    taskIds && taskIds.length
      ? db
          .select({
            id: tasksTable.id,
            title: tasksTable.title,
            status: tasksTable.status,
            assignedTo: tasksTable.assignedTo,
            dueDate: tasksTable.dueDate,
            projectName: projectsTable.name,
          })
          .from(tasksTable)
          .innerJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
          .where(inArray(tasksTable.id, taskIds))
      : db
          .select({
            id: tasksTable.id,
            title: tasksTable.title,
            status: tasksTable.status,
            assignedTo: tasksTable.assignedTo,
            dueDate: tasksTable.dueDate,
            projectName: projectsTable.name,
          })
          .from(tasksTable)
          .innerJoin(projectsTable, eq(tasksTable.projectId, projectsTable.id))
          .where(
            and(
              ne(tasksTable.status, "done"),
              lte(tasksTable.dueDate, deadlineCutoffDate()),
            ),
          );

  return query;
}

function deadlineCutoffDate(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + TASK_DEADLINE_WINDOW_DAYS);
  return cutoff.toISOString().slice(0, 10);
}

export async function createTaskDeadlineNotifications(
  taskIds?: number[],
  recipientUsers?: Pick<User, "id" | "role" | "active">[],
) {
  const [tasks, users] = await Promise.all([
    taskRows(taskIds),
    recipientUsers ?? db.select().from(usersTable),
  ]);
  const activeUsers = users.filter(isActiveUser);
  const activeUserIds = new Set(activeUsers.map((user) => user.id));
  const planningRecipients = activeUsers.filter((user) =>
    roleCanAccessModule(user.role, "planning"),
  );

  const drafts: NotificationDraft[] = [];
  for (const task of tasks) {
    if (task.status === "done") continue;
    const state = taskDeadlineState(task.dueDate);
    if (!state) continue;

    const recipients =
      task.assignedTo && activeUserIds.has(task.assignedTo)
        ? activeUsers.filter((user) => user.id === task.assignedTo)
        : planningRecipients;

    for (const user of recipients) {
      drafts.push({
        userId: user.id,
        type: "task_deadline",
        title:
          state === "overdue"
            ? `Task overdue: ${task.title}`
            : `Task due soon: ${task.title}`,
        message: `${task.title} in ${task.projectName} is due on ${formatDateLabel(task.dueDate)}.`,
        entityType: "task",
        entityId: task.id,
      });
    }
  }

  return createNotifications(drafts);
}

export async function syncNotificationsForUser(user: AuthUser) {
  const recipients = [user];
  const jobs: Promise<unknown>[] = [];

  if (userCanAccessModule(user, "inventory")) {
    jobs.push(createLowStockNotifications(undefined, recipients));
  }

  if (userCanAccessModule(user, "accounting")) {
    jobs.push(createOverdueInvoiceNotifications(undefined, recipients));
  }

  jobs.push(createTaskDeadlineNotifications(undefined, recipients));
  await Promise.all(jobs);
}

export async function removeTaskDeadlineNotificationsForOtherUsers(
  taskId: number,
  allowedUserIds: number[],
) {
  if (!allowedUserIds.length) return;

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(
      and(
        eq(notificationsTable.type, "task_deadline"),
        eq(notificationsTable.entityType, "task"),
        eq(notificationsTable.entityId, taskId),
      ),
    );

  await Promise.all(
    rows
      .filter((row) => !allowedUserIds.includes(row.userId))
      .map((row) =>
        db.delete(notificationsTable).where(eq(notificationsTable.id, row.id)),
      ),
  );
}

export async function markNotificationReadForUser(
  notificationId: number,
  userId: number,
) {
  const now = new Date();
  const readPatch = markReadPatchForUser(userId, userId, now);
  const [updated] = await db
    .update(notificationsTable)
    .set(readPatch ?? { isRead: true, readAt: now })
    .where(
      and(
        eq(notificationsTable.id, notificationId),
        eq(notificationsTable.userId, userId),
      ),
    )
    .returning();
  return updated ?? null;
}

export async function markAllNotificationsReadForUser(userId: number) {
  const now = new Date();
  const updated = await db
    .update(notificationsTable)
    .set({ isRead: true, readAt: now })
    .where(
      and(eq(notificationsTable.userId, userId), eq(notificationsTable.isRead, false)),
    )
    .returning();
  return updated.length;
}
