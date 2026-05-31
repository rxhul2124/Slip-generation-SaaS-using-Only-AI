import type { CanonicalField, FieldMapping } from "./types";

/* ------------------------------------------------------------------ */
/*  Alias Dictionary                                                   */
/* ------------------------------------------------------------------ */

const ALIASES: Record<CanonicalField, string[]> = {
  order_number: ["order id", "order no", "order number", "order ref", "po number", "purchase order", "order #", "orderid", "order_id", "orderreference", "order reference"],
  invoice_number: ["invoice", "invoice no", "invoice number", "inv no", "bill number", "invoice id", "invoice #"],
  customer_name: ["customer", "customer name", "buyer", "buyer name", "ship to", "sold to", "consignee", "client", "client name", "company name"],
  contact_person: ["contact", "contact person", "attn", "attention", "contact name"],
  shipping_address: ["address", "ship address", "delivery address", "addr", "shipping address", "street", "address line", "address line 1", "full address"],
  city: ["city", "town", "ship city", "delivery city"],
  state: ["state", "province", "region", "ship state"],
  postal_code: ["zip", "zipcode", "zip code", "postal code", "postcode", "pin", "pincode", "pin code"],
  country: ["country", "nation", "ship country"],
  phone: ["phone", "mobile", "tel", "telephone", "contact number", "phone number", "mobile number", "cell"],
  email: ["email", "e-mail", "email address", "mail", "email id"],
  product_name: ["product", "product name", "item", "item name", "description", "item description", "product description", "product title"],
  sku: ["sku", "item code", "product code", "article", "article number", "item no", "item number", "article no"],
  part_number: ["part no", "part number", "part #", "p/n", "part_number"],
  quantity: ["qty", "quantity", "units", "count", "pcs", "nos", "order qty", "ordered qty"],
  unit_price: ["price", "unit price", "rate", "mrp", "cost", "unit cost", "price each"],
  total_price: ["total", "total price", "line total", "subtotal", "net amount", "total amount", "grand total", "total cost"],
  weight: ["weight", "wt", "gross weight", "net weight", "kg", "weight kg"],
  notes: ["notes", "remarks", "comment", "comments", "instructions", "special instructions", "memo"],
  tracking_id: ["tracking", "tracking id", "tracking number", "awb", "awb no", "tracking no"],
  shipment_id: ["shipment", "shipment id", "shipment no", "shipment number"],
  date: ["date", "order date", "ship date", "delivery date", "created", "created at", "created date", "dispatch date"],
  ignore: [],
};

/* ------------------------------------------------------------------ */
/*  Regex patterns for header matching                                 */
/* ------------------------------------------------------------------ */

const HEADER_REGEX: [CanonicalField, RegExp][] = [
  ["order_number", /^(?:ord|order|po)[\s._-]*(?:no|num|number|id|ref|#)?$/i],
  ["invoice_number", /^(?:inv|invoice|bill)[\s._-]*(?:no|num|number|id|#)?$/i],
  ["customer_name", /^(?:cust|customer|buyer|client|consignee)[\s._-]*(?:name)?$/i],
  ["shipping_address", /^(?:ship|shipping|delivery|mailing|billing)?[\s._-]*(?:addr|address)/i],
  ["product_name", /^(?:prod|product|item)[\s._-]*(?:name|desc|description)?$/i],
  ["sku", /^(?:sku|item[\s._-]*code|product[\s._-]*code|article)/i],
  ["quantity", /^(?:qty|quantity|units|count|pcs|nos)/i],
  ["unit_price", /^(?:unit)?[\s._-]*(?:price|rate|cost|mrp)/i],
  ["total_price", /^(?:total|line[\s._-]*total|net|grand[\s._-]*total|sub[\s._-]*total)/i],
  ["email", /^(?:e[\s._-]*mail)/i],
  ["phone", /^(?:phone|mobile|tel|cell)/i],
  ["date", /^(?:.*date|created[\s._-]*at)/i],
  ["weight", /^(?:weight|wt|gross[\s._-]*weight|net[\s._-]*weight)/i],
  ["tracking_id", /^(?:tracking|awb)/i],
  ["postal_code", /^(?:zip|postal|pin)[\s._-]*(?:code)?$/i],
  ["city", /^(?:city|town)$/i],
  ["state", /^(?:state|province|region)$/i],
  ["country", /^(?:country|nation)$/i],
  ["notes", /^(?:notes?|remarks?|comments?|instructions?|memo)/i],
  ["contact_person", /^(?:contact|attn|attention)/i],
  ["part_number", /^(?:part)[\s._-]*(?:no|number|#)?$/i],
];

/* ------------------------------------------------------------------ */
/*  Value pattern inference                                            */
/* ------------------------------------------------------------------ */

function inferFromValues(values: unknown[]): { field: CanonicalField; score: number } | null {
  const stringValues = values
    .filter((v) => v !== null && v !== undefined && v !== "")
    .map(String)
    .slice(0, 10);

  if (stringValues.length === 0) return null;

  // Email pattern
  const emailCount = stringValues.filter((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)).length;
  if (emailCount / stringValues.length > 0.5) return { field: "email", score: 40 };

  // Phone pattern (10+ digits, may have +, -, spaces)
  const phoneCount = stringValues.filter((v) => /^[+]?\d[\d\s\-().]{8,}$/.test(v.replace(/\s/g, ""))).length;
  if (phoneCount / stringValues.length > 0.5) return { field: "phone", score: 40 };

  // Order number pattern (ORD-xxx, PO-xxx, #xxx)
  const orderCount = stringValues.filter((v) => /^(?:ORD|PO|SO|#)[\s\-_]?\d{2,}/i.test(v)).length;
  if (orderCount / stringValues.length > 0.5) return { field: "order_number", score: 40 };

  // Invoice pattern (INV-xxx)
  const invCount = stringValues.filter((v) => /^(?:INV|BILL)[\s\-_]?\d{2,}/i.test(v)).length;
  if (invCount / stringValues.length > 0.5) return { field: "invoice_number", score: 40 };

  // Date pattern
  const dateCount = stringValues.filter((v) => {
    if (/^\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4}$/.test(v)) return true;
    if (!isNaN(Date.parse(v))) return true;
    return false;
  }).length;
  if (dateCount / stringValues.length > 0.5) return { field: "date", score: 40 };

  // Postal code (5-6 digit numbers)
  const zipCount = stringValues.filter((v) => /^\d{5,6}$/.test(v)).length;
  if (zipCount / stringValues.length > 0.7) return { field: "postal_code", score: 40 };

  // Price pattern ($xxx, ₹xxx, xx.xx)
  const priceCount = stringValues.filter((v) => /^[$₹€£]?\s?\d+[.,]\d{2}$/.test(v)).length;
  if (priceCount / stringValues.length > 0.5) return { field: "unit_price", score: 40 };

  // Small integers → quantity
  const numValues = stringValues.map(Number).filter((n) => !isNaN(n));
  if (numValues.length > 0 && numValues.length / stringValues.length > 0.7) {
    const allSmall = numValues.every((n) => n >= 0 && n <= 99999 && Number.isInteger(n));
    if (allSmall) return { field: "quantity", score: 40 };
  }

  return null;
}

/* ------------------------------------------------------------------ */
/*  Main analyzer                                                      */
/* ------------------------------------------------------------------ */

/**
 * Analyze CSV columns using header names AND sample values.
 * Returns a FieldMapping for each header with a confidence score.
 */
export function analyzeColumns(
  headers: string[],
  rows: Record<string, unknown>[]
): FieldMapping[] {
  const usedFields = new Set<CanonicalField>();
  const results: FieldMapping[] = [];

  for (const header of headers) {
    const normalized = header.toLowerCase().replace(/[_\-./]/g, " ").trim();
    const sampleValues = rows.slice(0, 5).map((row) => row[header]);
    let bestField: CanonicalField = "ignore";
    let bestScore = 0;

    // 1) Exact alias match (score = 100)
    for (const [field, aliases] of Object.entries(ALIASES) as [CanonicalField, string[]][]) {
      if (field === "ignore") continue;
      for (const alias of aliases) {
        if (normalized === alias) {
          if (!usedFields.has(field) && 100 > bestScore) {
            bestField = field;
            bestScore = 100;
          }
        }
      }
    }

    // 2) Partial alias match (score = 80)
    if (bestScore < 100) {
      for (const [field, aliases] of Object.entries(ALIASES) as [CanonicalField, string[]][]) {
        if (field === "ignore") continue;
        for (const alias of aliases) {
          if (normalized.includes(alias) || alias.includes(normalized)) {
            if (!usedFields.has(field) && 80 > bestScore) {
              bestField = field;
              bestScore = 80;
            }
          }
        }
      }
    }

    // 3) Regex match on header (score = 60)
    if (bestScore < 80) {
      for (const [field, regex] of HEADER_REGEX) {
        if (regex.test(normalized) && !usedFields.has(field) && 60 > bestScore) {
          bestField = field;
          bestScore = 60;
        }
      }
    }

    // 4) Value-based inference (score = 40)
    if (bestScore < 60) {
      const valueInference = inferFromValues(sampleValues);
      if (valueInference && !usedFields.has(valueInference.field) && valueInference.score > bestScore) {
        bestField = valueInference.field;
        bestScore = valueInference.score;
      }
    }

    if (bestField !== "ignore") {
      usedFields.add(bestField);
    }

    results.push({
      csvHeader: header,
      canonicalField: bestField,
      confidence: bestScore,
      sampleValues,
    });
  }

  return results;
}

/** Get confidence level label from score */
export function getConfidenceLevel(score: number): "high" | "medium" | "low" {
  if (score > 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}
