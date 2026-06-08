import { describe, expect, it } from "vitest";
import { apiErrorMessage } from "./api-error";

describe("apiErrorMessage", () => {
  it("formats structured validation details", () => {
    expect(
      apiErrorMessage({
        data: {
          details: [
            { field: "email", message: "Invalid email" },
            { field: "name", message: "Required" },
          ],
        },
      }),
    ).toBe("Validation errors: email: Invalid email; name: Required");
  });

  it("uses safe API error messages", () => {
    expect(apiErrorMessage({ data: { error: "Forbidden" } })).toBe(
      "Forbidden",
    );
  });

  it("replaces network errors with a user-friendly message", () => {
    expect(apiErrorMessage(new Error("Failed to fetch"))).toBe(
      "Unable to reach the server. Check your network or try again later.",
    );
  });

  it("hides raw unexpected technical messages", () => {
    expect(apiErrorMessage(new Error("stack trace detail"))).toBe(
      "An error occurred. Please try again. If this persists contact support.",
    );
  });
});
