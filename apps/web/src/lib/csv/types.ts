import type { Product, Customer } from "../types";

/** All canonical fields the system understands */
export type CanonicalField =
  | "order_number" | "invoice_number" | "customer_name" | "contact_person"
  | "shipping_address" | "city" | "state" | "postal_code" | "country"
  | "phone" | "email" | "product_name" | "sku" | "part_number"
  | "quantity" | "unit_price" | "total_price" | "weight"
  | "notes" | "tracking_id" | "shipment_id" | "date"
  | "ignore";

/** Human-readable labels for each canonical field */
export const CANONICAL_FIELD_LABELS: Record<CanonicalField, string> = {
  order_number: "Order Number",
  invoice_number: "Invoice Number",
  customer_name: "Customer Name",
  contact_person: "Contact Person",
  shipping_address: "Shipping Address",
  city: "City",
  state: "State",
  postal_code: "Postal Code",
  country: "Country",
  phone: "Phone",
  email: "Email",
  product_name: "Product Name",
  sku: "SKU",
  part_number: "Part Number",
  quantity: "Quantity",
  unit_price: "Unit Price",
  total_price: "Total Price",
  weight: "Weight",
  notes: "Notes",
  tracking_id: "Tracking ID",
  shipment_id: "Shipment ID",
  date: "Date",
  ignore: "Ignore",
};

/** Required fields that must be mapped before generation */
export const REQUIRED_FIELDS: CanonicalField[] = ["product_name", "quantity"];

/** Fields that are recommended but not strictly required */
export const RECOMMENDED_FIELDS: CanonicalField[] = ["order_number", "customer_name"];

/** Result of analyzing a single CSV column */
export interface FieldMapping {
  csvHeader: string;
  canonicalField: CanonicalField;
  confidence: number;
  sampleValues: unknown[];
}

/** A single line item in a canonical slip */
export interface CanonicalLineItem {
  productName: string;
  sku?: string;
  partNumber?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  weight?: number;
  notes?: string;
  linkedProduct?: Product;
}

/** The single normalized data format — renderers ONLY consume this */
export interface CanonicalSlip {
  orderNumber: string;
  invoiceNumber?: string;
  date?: string;
  customerName: string;
  contactPerson?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  lineItems: CanonicalLineItem[];
  totals?: {
    subtotal?: number;
    tax?: number;
    shipping?: number;
    total?: number;
  };
  trackingId?: string;
  shipmentId?: string;
  notes?: string;
  metadata: Record<string, unknown>;
  importMeta?: {
    sourceRows: number[];
    originalHeaders: string[];
    importedAt: string;
    presetName?: string;
  };
  linkedCustomer?: Customer;
}

/** Warning from the normalization process */
export interface NormalizationWarning {
  type: "unlinked_product" | "unlinked_customer" | "missing_field" | "invalid_value";
  rowIndex: number;
  field: string;
  message: string;
}

/** Result of the full normalization pipeline */
export interface NormalizationResult {
  slips: CanonicalSlip[];
  warnings: NormalizationWarning[];
  health: CsvHealthReport;
}

/** Smart summary of CSV analysis */
export interface CsvHealthReport {
  totalRows: number;
  parsedRows: number;
  fieldsDetected: number;
  autoMappedFields: number;
  suggestedFields: number;
  unknownFields: number;
  unlinkedProducts: number;
  unlinkedCustomers: number;
  missingAddresses: number;
  groupsFormed: number;
  warnings: NormalizationWarning[];
}

/** Supported grouping strategies */
export type GroupingStrategy = "order_number" | "invoice_number" | "shipment_id" | "tracking_id" | "none";

/** Reusable mapping preset */
export interface MappingPreset {
  id: string;
  name: string;
  mapping: Record<string, CanonicalField>;
  headerFingerprint: string;
  createdAt: string;
  lastUsedAt?: string;
}

/** Parsed CSV result */
export interface ParsedCsv {
  headers: string[];
  rows: Record<string, unknown>[];
  errors: Array<{ row?: number; message: string }>;
}

/** Rendering constraints to prevent broken layouts */
export interface RenderingConstraints {
  maxRowsPerPage: number;
  maxAddressLines: number;
  minFontSize: number;
  maxFontSize: number;
  overflowStrategy: "paginate" | "truncate" | "shrink";
}

export const DEFAULT_CONSTRAINTS: RenderingConstraints = {
  maxRowsPerPage: 15,
  maxAddressLines: 5,
  minFontSize: 7,
  maxFontSize: 14,
  overflowStrategy: "paginate",
};
