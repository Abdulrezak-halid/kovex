export function apiErrorMessage(err: unknown) {
  // Handle structured API validation errors first (expected and safe to show)
  if (err && typeof err === "object") {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const details = (data as { details?: unknown }).details;
      if (Array.isArray(details) && details.length > 0) {
        // Build a concise, user-focused validation summary
        return (
          "Validation errors: " +
          details
            .map((detail) => {
              if (!detail || typeof detail !== "object") return null;
              const field = (detail as { field?: unknown }).field;
              const message = (detail as { message?: unknown }).message;
              if (typeof field !== "string" || typeof message !== "string") {
                return null;
              }

              return `${field}: ${message}`;
            })
            .filter(Boolean)
            .join("; ")
        );
      }

      const error = (data as { error?: unknown }).error;
      if (typeof error === "string" && error.trim())
        return String(error).trim();
    }

    // Network / transport errors
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      const m = message.toLowerCase();
      if (m.includes("failed to fetch") || m.includes("network") || m.includes("ecônnrefused") || m.includes("econnrefused")) {
        return "Unable to reach the server. Check your network or try again later.";
      }

      // Avoid showing raw technical messages; only show safe, short messages
      return "An error occurred. Please try again. If this persists contact support.";
    }
  }

  // Fallback generic message
  return "Something went wrong. Please try again or contact support if the problem continues.";
}
