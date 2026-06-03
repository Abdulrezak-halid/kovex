type SortOrder = "asc" | "desc";

export type ListQueryOptions = {
  search?: string;
  limit: number;
  sortBy?: string;
  sortOrder: SortOrder;
};

export function parseListQuery(
  query: Record<string, unknown>,
): ListQueryOptions {
  const search =
    typeof query.search === "string" && query.search.trim()
      ? query.search.trim().toLowerCase()
      : undefined;
  const requestedLimit =
    typeof query.limit === "string" ? Number(query.limit) : undefined;
  const limit =
    requestedLimit && Number.isFinite(requestedLimit)
      ? Math.min(Math.max(Math.floor(requestedLimit), 1), 500)
      : 100;
  const sortBy =
    typeof query.sortBy === "string" && query.sortBy.trim()
      ? query.sortBy.trim()
      : undefined;
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  return { search, limit, sortBy, sortOrder };
}

export function applyListQuery<T>(
  rows: T[],
  options: ListQueryOptions,
  searchFields: Array<keyof T>,
  sortAccessors: Record<
    string,
    (row: T) => string | number | Date | null | undefined
  >,
) {
  let next = rows;

  if (options.search) {
    next = next.filter((row) =>
      searchFields.some((field) =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(options.search!),
      ),
    );
  }

  const sortAccessor = options.sortBy
    ? sortAccessors[options.sortBy]
    : (sortAccessors.createdAt ??
      sortAccessors.name ??
      sortAccessors.reference);
  if (sortAccessor) {
    next = [...next].sort((a, b) => {
      const left = sortAccessor(a);
      const right = sortAccessor(b);
      const leftValue = left instanceof Date ? left.getTime() : (left ?? "");
      const rightValue =
        right instanceof Date ? right.getTime() : (right ?? "");
      const direction = options.sortOrder === "asc" ? 1 : -1;

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * direction;
      }

      return String(leftValue).localeCompare(String(rightValue)) * direction;
    });
  }

  return next.slice(0, options.limit);
}
