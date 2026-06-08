import { describe, expect, it } from "vitest";
import {
  isValidEmail,
  isValidPhone,
  normalizeEmail,
  sanitizePhoneInput,
} from "./form-validation";

describe("form validation utilities", () => {
  it("normalizes email before validation", () => {
    expect(normalizeEmail("  Manager@Example.COM  ")).toBe(
      "manager@example.com",
    );
    expect(isValidEmail("  Manager@Example.COM  ")).toBe(true);
  });

  it("rejects malformed email addresses", () => {
    expect(isValidEmail("manager")).toBe(false);
    expect(isValidEmail("manager@example")).toBe(false);
    expect(isValidEmail("manager example@example.com")).toBe(false);
  });

  it("sanitizes phone input while keeping allowed formatting characters", () => {
    expect(sanitizePhoneInput("+1 (555) ABC-0100 ext. 9")).toBe(
      "+1 (555) -0100  9",
    );
    expect(isValidPhone("+1 (555) -0100")).toBe(true);
    expect(isValidPhone("+1 (555) call")).toBe(false);
  });
});
