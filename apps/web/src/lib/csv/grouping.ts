import type { CanonicalSlip, GroupingStrategy } from "./types";

/**
 * Get the grouping key value from a slip based on the strategy.
 */
function getGroupKey(slip: CanonicalSlip, strategy: GroupingStrategy): string {
  switch (strategy) {
    case "order_number": return slip.orderNumber || "";
    case "invoice_number": return slip.invoiceNumber || "";
    case "shipment_id": return slip.shipmentId || "";
    case "tracking_id": return slip.trackingId || "";
    default: return "";
  }
}

/**
 * Group an array of single-item canonical slips by a grouping key.
 * Merges rows with the same key into one slip with multiple lineItems.
 */
export function groupSlips(
  slips: CanonicalSlip[],
  strategy: GroupingStrategy
): CanonicalSlip[] {
  if (strategy === "none" || slips.length === 0) return slips;

  const groups = new Map<string, CanonicalSlip[]>();

  for (const slip of slips) {
    const key = getGroupKey(slip, strategy);
    // If key is empty, treat as its own group
    if (!key) {
      const soloKey = `__solo_${groups.size}`;
      groups.set(soloKey, [slip]);
    } else {
      const existing = groups.get(key);
      if (existing) {
        existing.push(slip);
      } else {
        groups.set(key, [slip]);
      }
    }
  }

  const merged: CanonicalSlip[] = [];

  for (const group of groups.values()) {
    if (group.length === 1) {
      merged.push(group[0]);
      continue;
    }

    // Merge: keep customer info from first row, merge lineItems and totals
    const first = group[0];
    const allLineItems = group.flatMap((s) => s.lineItems);
    const allSourceRows = group.flatMap((s) => s.importMeta?.sourceRows || []);

    let subtotal = 0;
    let hasAnyTotal = false;
    for (const s of group) {
      if (s.totals?.total) {
        subtotal += s.totals.total;
        hasAnyTotal = true;
      } else {
        for (const item of s.lineItems) {
          if (item.totalPrice) {
            subtotal += item.totalPrice;
            hasAnyTotal = true;
          }
        }
      }
    }

    merged.push({
      ...first,
      lineItems: allLineItems,
      totals: hasAnyTotal ? { total: subtotal } : first.totals,
      importMeta: first.importMeta
        ? { ...first.importMeta, sourceRows: allSourceRows }
        : undefined,
    });
  }

  return merged;
}
