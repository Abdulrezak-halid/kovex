import { Router } from "express";
import { db, usersTable } from "@sme-erp/database";
import { eq } from "drizzle-orm";
import {
  createSessionToken,
  getAuthenticatedUser,
  getSessionCookieName,
  publicUser,
  sessionCookieOptions,
  verifyPassword,
} from "../lib/auth";

const router = Router();
const safeLoginError = { error: "Invalid email or password" };

router.post("/auth/login", async (req, res) => {
  try {
    const email = String(req.body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password ?? "");

    if (!email || !password) return res.status(401).json(safeLoginError);

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (!user || !user.active || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json(safeLoginError);
    }

    res.cookie(
      getSessionCookieName(),
      createSessionToken(user.id),
      sessionCookieOptions(),
    );
    res.json({ user: publicUser(user) });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.clearCookie(getSessionCookieName(), { path: "/" });
  res.status(204).send();
});

router.get("/auth/me", async (req, res) => {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    res.json({ user });
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
