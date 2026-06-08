import { describe, expect, it } from "vitest";
import {
  isAdminRole,
  permissionModuleForPath,
  roleCanAccessModule,
} from "./auth";

describe("frontend auth permission helpers", () => {
  it("recognizes administrator roles", () => {
    expect(isAdminRole("admin")).toBe(true);
    expect(isAdminRole("sysadmin")).toBe(true);
    expect(isAdminRole("sales")).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });

  it("maps paths to the correct permission module", () => {
    expect(permissionModuleForPath("/sales/orders")).toBe("sales");
    expect(permissionModuleForPath("/sales/invoices")).toBe("accounting");
    expect(permissionModuleForPath("/purchases/orders")).toBe("purchases");
    expect(permissionModuleForPath("/purchases/invoices")).toBe("accounting");
    expect(permissionModuleForPath("/reports/sales")).toBe("reports");
    expect(permissionModuleForPath("/settings/users")).toBe("settings");
    expect(permissionModuleForPath("/")).toBe("dashboard");
  });

  it("allows roles only into their assigned modules", () => {
    expect(roleCanAccessModule("admin", "settings")).toBe(true);
    expect(roleCanAccessModule("sales", "sales")).toBe(true);
    expect(roleCanAccessModule("sales", "reports")).toBe(false);
    expect(roleCanAccessModule("accountant", "reports")).toBe(true);
    expect(roleCanAccessModule("unknown", "dashboard")).toBe(false);
  });
});
