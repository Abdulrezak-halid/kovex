import { Router } from "express";
import type { Request } from "express";
import { db, notificationsTable } from "@sme-erp/database";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  markAllNotificationsReadForUser,
  markNotificationReadForUser,
  syncNotificationsForUser,
} from "../lib/notifications";

const router = Router();

function currentUser(req: Request) {
  return req.authUser;
}

router.get("/notifications", async (req, res) => {
  try {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    await syncNotificationsForUser(user);

    const limit = Math.min(
      Math.max(Number(req.query.limit ?? 20) || 20, 1),
      50,
    );
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.id))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(limit);

    res.json(rows);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/notifications/unread-count", async (req, res) => {
  try {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    await syncNotificationsForUser(user);

    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.userId, user.id),
          eq(notificationsTable.isRead, false),
        ),
      );

    res.json({ count: row?.count ?? 0 });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid notification id" });
    }

    const updated = await markNotificationReadForUser(id, user.id);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/read-all", async (req, res) => {
  try {
    const user = currentUser(req);
    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    const updated = await markAllNotificationsReadForUser(user.id);
    res.json({ updated });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
