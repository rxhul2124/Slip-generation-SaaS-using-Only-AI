/**
 * API Features Utility
 * Provides standardized query parsing for paginated list endpoints.
 * 
 * Contract for list endpoints:
 * - Request Query: ?page=1&limit=25&sort=-createdAt&search=foo
 * - Response Shape: { data: T[], meta: { page, limit, total, pages } }
 */

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
  let page = Number(queryString?.page);
  let limit = Number(queryString?.limit);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = 25;
  if (limit > 100) limit = 100;

  return { page, limit, skip: (page - 1) * limit };
}

export function sortOption(sort) {
  const defaultSort = "-createdAt -_id";
  if (!sort) return defaultSort;
  
  // Handle comma-separated list of sorts
  const parsed = String(sort).split(",").map(part => {
    part = part.trim();
    // Handle ?sort=field:desc or ?sort=field:asc
    if (part.includes(":")) {
      const [field, dir] = part.split(":");
      return dir.toLowerCase() === "desc" ? `-${field}` : field;
    }
    // Handle ?sort=-field or ?sort=field
    return part;
  }).filter(p => !p.includes("_id"));

  return [...parsed, "-_id"].join(" ");
}
