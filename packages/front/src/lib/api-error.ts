export function apiErrorMessage(err: unknown) {
  if (err && typeof err === "object") {
    const data = (err as { data?: unknown }).data;
    if (data && typeof data === "object") {
      const details = (data as { details?: unknown }).details;
      if (Array.isArray(details) && details.length > 0) {
        return details
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
          .join("\n");
      }

      const error = (data as { error?: unknown }).error;
      if (typeof error === "string" && error.trim()) return error;
    }

    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }

  return "Please check the highlighted fields and try again.";
}
