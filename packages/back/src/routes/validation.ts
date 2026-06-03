export function validationErrorDetails(err: unknown) {
  if (err && typeof err === "object" && "issues" in err) {
    const issues = (
      err as { issues?: { path?: unknown[]; message?: string }[] }
    ).issues;
    if (issues?.length) {
      return issues.map((issue) => ({
        field: issue.path?.length ? issue.path.join(".") : "input",
        message: issue.message ?? "invalid value",
      }));
    }
  }

  return [];
}

export function validationErrorMessage(err: unknown) {
  const details = validationErrorDetails(err);
  if (details.length) {
    return details
      .map((detail) => `${detail.field}: ${detail.message}`)
      .join("; ");
  }

  return err instanceof Error ? err.message : "Invalid input";
}

export function validationErrorResponse(err: unknown) {
  const details = validationErrorDetails(err);

  return {
    error: validationErrorMessage(err),
    ...(details.length ? { details } : {}),
  };
}
