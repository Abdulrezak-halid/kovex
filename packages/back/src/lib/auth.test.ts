import { describe, expect, it } from "vitest";
import {
  createSessionToken,
  hashPassword,
  isAdminRole,
  parseSessionToken,
  roleCanAccessModule,
  verifyPassword,
} from "./auth";

describe("backend auth helpers", () => {
  it("hashes passwords and verifies only the original password", () => {
    const hash = hashPassword("committee-demo-password");

    expect(hash).toMatch(/^scrypt:/);
    expect(hash).not.toContain("committee-demo-password");
    expect(verifyPassword("committee-demo-password", hash)).toBe(true);
    expect(verifyPassword("wrong-password", hash)).toBe(false);
    expect(verifyPassword("committee-demo-password", null)).toBe(false);
  });

  it("creates signed session tokens and rejects tampered tokens", () => {
    const token = createSessionToken(42);
    const session = parseSessionToken(token);

    expect(session?.userId).toBe(42);
    expect(session?.expiresAt).toBeGreaterThan(Date.now());
    expect(parseSessionToken(undefined)).toBeNull();
    expect(parseSessionToken(`${token}tampered`)).toBeNull();
    expect(parseSessionToken("not.a.valid.token")).toBeNull();
  });

  it("keeps backend role permissions aligned with business modules", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(roleCanAccessModule("admin", "settings")).toBe(true);
    expect(roleCanAccessModule("sales", "sales")).toBe(true);
    expect(roleCanAccessModule("sales", "inventory")).toBe(false);
    expect(roleCanAccessModule("accountant", "reports")).toBe(true);
    expect(roleCanAccessModule(undefined, "dashboard")).toBe(false);
  });
});
