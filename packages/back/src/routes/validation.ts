export function validationErrorMessage(err: unknown) {
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (
      err as { issues?: { path?: unknown[]; message?: string }[] }
    ).issues;
    if (issues?.length) {
      return issues
        .map((issue) => {
          const field = issue.path?.length ? issue.path.join(".") : "input";
          return `${field}: ${issue.message ?? "invalid value"}`;
        })
        .join("; ");
    }
  }

  return err instanceof Error ? err.message : "Invalid input";
}
