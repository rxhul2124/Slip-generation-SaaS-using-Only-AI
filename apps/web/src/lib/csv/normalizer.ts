import type { Product, Customer } from "../types";
import type {
  CanonicalField,
  CanonicalLineItem,
  CanonicalSlip,
  CsvHealthReport,
  FieldMapping,
  NormalizationResult,
  NormalizationWarning,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function str(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function num(value: unknown): number {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function findProduct(name: string, sku: string | undefined, products: Product[]): Product | undefined {
  if (!products.length) return undefined;
  const lower = name.toLowerCase();
  const skuLower = sku?.toLowerCase();
  return products.find(
    (p) =>
      p.name.toLowerCase() === lower ||
      p.partName?.toLowerCase() === lower ||
      (skuLower && p.sku?.toLowerCase() === skuLower) ||
      (skuLower && p.partNumber?.toLowerCase() === skuLower)
  );
}

function findCustomer(name: string, customers: Customer[]): Customer | undefined {
  if (!customers.length) return undefined;
  const lower = name.toLowerCase();
  return customers.find((c) => c.name.toLowerCase() === lower);
}

/* ------------------------------------------------------------------ */
/*  Main normalizer                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert raw CSV rows + confirmed field mappings into CanonicalSlip objects.
 * Attempts DB enrichment; marks unlinked items as warnings.
 */
export function normalizeRows(
  rows: Record<string, unknown>[],
  mappings: FieldMapping[],
  options: {
    products?: Product[];
    customers?: Customer[];
    presetName?: string;
    originalHeaders: string[];
  }
): NormalizationResult {
  const warnings: NormalizationWarning[] = [];
  const slips: CanonicalSlip[] = [];
  const products = options.products || [];
  const customers = options.customers || [];

  // Build a lookup: canonicalField → csvHeader
  const fieldToHeader = new Map<CanonicalField, string>();
  for (const m of mappings) {
    if (m.canonicalField !== "ignore") {
      fieldToHeader.set(m.canonicalField, m.csvHeader);
    }
  }

  const getValue = (row: Record<string, unknown>, field: CanonicalField): string => {
    const header = fieldToHeader.get(field);
    if (!header) return "";
    return str(row[header]);
  };

  const getNum = (row: Record<string, unknown>, field: CanonicalField): number => {
    const header = fieldToHeader.get(field);
    if (!header) return 0;
    return num(row[header]);
  };

  let unlinkedProducts = 0;
  let unlinkedCustomers = 0;
  let missingAddresses = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const productName = getValue(row, "product_name");
    const customerName = getValue(row, "customer_name");
    const sku = getValue(row, "sku") || undefined;
    const quantity = getNum(row, "quantity") || 1;

    // Validate required fields
    if (!productName) {
      warnings.push({ type: "missing_field", rowIndex: i, field: "product_name", message: `Row ${i + 1}: Missing product name` });
    }

    // Attempt DB enrichment
    const linkedProduct = productName ? findProduct(productName, sku, products) : undefined;
    const linkedCustomer = customerName ? findCustomer(customerName, customers) : undefined;

    if (productName && !linkedProduct) {
      unlinkedProducts++;
      warnings.push({ type: "unlinked_product", rowIndex: i, field: "product_name", message: `Row ${i + 1}: "${productName}" not found in database` });
    }
    if (customerName && !linkedCustomer) {
      unlinkedCustomers++;
      warnings.push({ type: "unlinked_customer", rowIndex: i, field: "customer_name", message: `Row ${i + 1}: "${customerName}" not found in database` });
    }

    const address = getValue(row, "shipping_address");
    if (!address && !linkedCustomer?.shippingAddress) {
      missingAddresses++;
    }

    const lineItem: CanonicalLineItem = {
      productName: productName || "Unknown Product",
      sku: sku || linkedProduct?.sku,
      partNumber: getValue(row, "part_number") || linkedProduct?.partNumber,
      quantity,
      unitPrice: getNum(row, "unit_price") || undefined,
      totalPrice: getNum(row, "total_price") || undefined,
      weight: getNum(row, "weight") || linkedProduct?.weight?.value,
      notes: getValue(row, "notes") || undefined,
      linkedProduct,
    };

    const orderNumber = getValue(row, "order_number") || `CSV-${String(i + 1).padStart(4, "0")}`;
    const shippingAddress = address || [
      linkedCustomer?.shippingAddress?.line1,
      linkedCustomer?.shippingAddress?.line2,
      linkedCustomer?.shippingAddress?.city,
      linkedCustomer?.shippingAddress?.state,
      linkedCustomer?.shippingAddress?.postalCode,
    ].filter(Boolean).join(", ");

    slips.push({
      orderNumber,
      invoiceNumber: getValue(row, "invoice_number") || undefined,
      date: getValue(row, "date") || new Date().toISOString(),
      customerName: customerName || linkedCustomer?.name || "Unknown Customer",
      contactPerson: getValue(row, "contact_person") || linkedCustomer?.contactPerson,
      shippingAddress: shippingAddress || undefined,
      city: getValue(row, "city") || linkedCustomer?.shippingAddress?.city,
      state: getValue(row, "state") || linkedCustomer?.shippingAddress?.state,
      postalCode: getValue(row, "postal_code") || linkedCustomer?.shippingAddress?.postalCode,
      country: getValue(row, "country") || linkedCustomer?.shippingAddress?.country,
      phone: getValue(row, "phone") || linkedCustomer?.phone,
      email: getValue(row, "email") || linkedCustomer?.email,
      lineItems: [lineItem],
      totals: lineItem.totalPrice ? { total: lineItem.totalPrice } : undefined,
      trackingId: getValue(row, "tracking_id") || undefined,
      shipmentId: getValue(row, "shipment_id") || undefined,
      notes: getValue(row, "notes") || undefined,
      metadata: {},
      importMeta: {
        sourceRows: [i],
        originalHeaders: options.originalHeaders,
        importedAt: new Date().toISOString(),
        presetName: options.presetName,
      },
      linkedCustomer,
    });
  }

  const autoMapped = mappings.filter((m) => m.confidence > 80 && m.canonicalField !== "ignore").length;
  const suggested = mappings.filter((m) => m.confidence >= 50 && m.confidence <= 80).length;
  const unknown = mappings.filter((m) => m.canonicalField === "ignore" || m.confidence < 50).length;

  const health: CsvHealthReport = {
    totalRows: rows.length,
    parsedRows: slips.length,
    fieldsDetected: mappings.filter((m) => m.canonicalField !== "ignore").length,
    autoMappedFields: autoMapped,
    suggestedFields: suggested,
    unknownFields: unknown,
    unlinkedProducts,
    unlinkedCustomers,
    missingAddresses,
    groupsFormed: slips.length,
    warnings,
  };

  return { slips, warnings, health };
}
