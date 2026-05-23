const operators = new Set(["gte", "gt", "lte", "lt", "ne", "in"]);

export function buildQuery(queryString, allowedFilters = []) {
  const query = {};

  for (const [key, value] of Object.entries(queryString)) {
    if (["page", "limit", "sort", "search", "fields"].includes(key)) continue;
    if (allowedFilters.length && !allowedFilters.includes(key.split(".")[0])) continue;

    if (typeof value === "object" && value !== null) {
      query[key] = Object.fromEntries(
        Object.entries(value)
          .filter(([operator]) => operators.has(operator))
          .map(([operator, operand]) => [`$${operator}`, operator === "in" ? String(operand).split(",") : operand])
      );
    } else {
      query[key] = value;
    }
  }

  return query;
}

export function pagination(queryString) {
  const page = Math.max(Number(queryString.page) || 1, 1);
  const limit = Math.min(Math.max(Number(queryString.limit) || 25, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function sortOption(sort) {
  return sort ? String(sort).split(",").join(" ") : "-createdAt";
}
