import type { CanonicalSlip } from "./types";

/**
 * Resolve a dot-notation path (with optional array access) against an object.
 * Supports: "orderNumber", "lineItems[0].productName", "totals.total"
 */
export function resolveVariable(slip: CanonicalSlip, path: string): unknown {
  if (!path) return "";

  // Tokenize path: split on dots and brackets
  // "lineItems[0].productName" → ["lineItems", "0", "productName"]
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current: unknown = slip;

  for (const part of parts) {
    if (current === null || current === undefined) return "";
    if (typeof current !== "object") return "";

    const obj = current as Record<string, unknown>;
    current = obj[part];
  }

  if (current === null || current === undefined) return "";
  if (typeof current === "object") return JSON.stringify(current);
  return current;
}

/**
 * Replace all {{variable}} placeholders in a template string
 * with values resolved from the canonical slip.
 *
 * Example: "Order: {{orderNumber}} for {{customerName}}"
 */
export function interpolate(template: string, slip: CanonicalSlip): string {
  return template.replace(/\{\{([\w.[\]]+)\}\}/g, (_match, path: string) => {
    const value = resolveVariable(slip, path);
    return String(value);
  });
}
