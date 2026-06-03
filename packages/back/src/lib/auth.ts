import crypto from "node:crypto";
import { db, usersTable, type User } from "@sme-erp/database";
import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";

const COOKIE_NAME = "sme_erp_session";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
const PASSWORD_KEY_LENGTH = 64;

type AuthUser = Pick<
  User,
  "id" | "name" | "email" | "role" | "department" | "active" | "createdAt"
>;

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
    }
  }
}

type SessionPayload = {
  userId: number;
  expiresAt: number;
};

function getAuthSecret() {
  return process.env.AUTH_SECRET ?? "development-only-auth-secret";
}

function encode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64url");
}

function timingSafeEqualText(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createSessionToken(userId: number) {
  const payload: SessionPayload = {
    userId,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = encode(JSON.stringify(payload));

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function parseSessionToken(token: string | undefined) {
  if (!token) return null;

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  if (!timingSafeEqualText(sign(encodedPayload), signature)) return null;

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    if (!payload.userId || payload.expiresAt <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionCookieName() {
  return COOKIE_NAME;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_TTL_MS,
    path: "/",
  };
}

export function publicUser(user: User): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    active: user.active,
    createdAt: user.createdAt,
  };
}

export async function getAuthenticatedUser(req: Request) {
  const session = parseSessionToken(req.cookies?.[getSessionCookieName()]);
  if (!session) return null;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.userId));

  if (!user || !user.active) return null;

  return publicUser(user);
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthenticated" });

    req.authUser = user;
    next();
  } catch (err) {
    req.log.error({ err });
    res.status(500).json({ error: "Internal server error" });
  }
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const hash = crypto
    .scryptSync(password, salt, PASSWORD_KEY_LENGTH)
    .toString("base64url");

  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string | null) {
  if (!storedHash) return false;

  const [algorithm, salt, expectedHash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;

  const actualHash = crypto
    .scryptSync(password, salt, PASSWORD_KEY_LENGTH)
    .toString("base64url");
  return timingSafeEqualText(actualHash, expectedHash);
}
