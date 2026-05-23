export type Role = "owner" | "admin" | "manager" | "staff";
export type SlipType = "packing" | "dispatch" | "delivery" | "warehouse" | "qc";
export type QuantityUnit = "NOS" | "PCS" | "BOX" | "KG" | "SET";
export type WeightUnit = "KG" | "G" | "TON" | "LB";
export type SignatureMode = "text" | "image" | "pad";

export interface Product {
  _id: string;
  name: string;
  sku?: string;
  partName?: string;
  partNumber?: string;
  barcode?: string;
  qrReference?: string;
  category?: string;
  packagingType?: string;
  dimensions?: { length?: number; width?: number; height?: number; unit?: string };
  weight?: { value?: number; unit?: WeightUnit | string };
  quantityDefault?: number;
  quantityUnit?: QuantityUnit;
  notes?: string;
  preferredTemplateId?: string;
  preferredTemplate?: string | { _id: string };
  assignedCustomerIds?: string[];
  assignedCustomers?: Array<string | { _id: string }>;
  fragile?: boolean;
  hazardous?: boolean;
  favorite?: boolean;
  archivedAt?: string;
}

export interface Customer {
  _id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
  shippingAddress?: Address;
  shippingInstructions?: string;
  products?: Product[];
  favorite?: boolean;
}

export interface Address {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface TemplateElement {
  id: string;
  type: "text" | "field" | "barcode" | "qr" | "logo" | "line" | "box" | "icon";
  label?: string;
  field?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
  zIndex?: number;
  locked?: boolean;
  style?: Record<string, string | number | boolean>;
  value?: unknown;
}

export interface SlipTemplate {
  _id: string;
  name: string;
  format: "2x4" | "4x6" | "a4" | "letter" | "custom";
  renderer?: "template" | "industrial";
  units: "mm" | "cm" | "in" | "px";
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  pageSize: "label" | "a4" | "letter" | "custom";
  thermalMode: boolean;
  margins: { top: number; right: number; bottom: number; left: number };
  padding: number;
  spacing: number;
  fontSize: number;
  borderThickness: number;
  bleed: number;
  cropMarks: boolean;
  snapGrid: number;
  elements: TemplateElement[];
}

export interface GeneratedSlip {
  _id: string;
  serialNumber: string;
  slipType?: SlipType;
  orderReference?: string;
  product: Product;
  customer: Customer;
  template: SlipTemplate;
  companyName?: string;
  company?: { name?: string };
  quantity: number;
  quantityUnit?: QuantityUnit;
  displayWeight?: { value?: number; unit?: WeightUnit | string };
  destination?: string;
  notes?: string;
  barcodeValue?: string;
  qrPayload?: Record<string, unknown>;
  signature?: {
    fullName: string;
    role?: string;
    employeeId?: string;
    text?: string;
    imageDataUrl?: string;
    padDataUrl?: string;
    mode: SignatureMode;
  };
  printSettings?: Record<string, unknown>;
  status: "draft" | "generated" | "queued" | "printed" | "exported" | "void";
  printedCount: number;
  exportedCount: number;
  createdAt: string;
}

export interface Preset {
  _id: string;
  name: string;
  description?: string;
  template: SlipTemplate;
  customer?: Customer;
  product?: Product;
  dimensions?: Record<string, unknown>;
  printSettings?: Record<string, unknown>;
  tags?: string[];
  createdAt?: string;
}

export interface PrintJob {
  _id: string;
  slips: Pick<GeneratedSlip, "_id" | "serialNumber" | "status">[];
  status: "queued" | "rendering" | "ready" | "printing" | "completed" | "failed";
  printer?: string;
  format: "browser" | "pdf" | "thermal";
  copies: number;
  queuedBy?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Backup {
  _id: string;
  type: "manual" | "automatic" | "import" | "export";
  status: "queued" | "running" | "completed" | "failed";
  sizeBytes?: number;
  checksum?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BillingSubscription {
  _id: string;
  plan: "free" | "pro" | "enterprise";
  status: "trialing" | "active" | "past_due" | "cancelled";
  provider: "stripe" | "razorpay" | "manual";
  customerId?: string;
  subscriptionId?: string;
  currentPeriodEndsAt?: string;
  usage?: {
    slipsThisMonth?: number;
    storageBytes?: number;
    teamSeats?: number;
  };
  invoices?: Array<{
    providerInvoiceId?: string;
    amount?: number;
    currency?: string;
    status?: string;
    hostedUrl?: string;
    paidAt?: string;
  }>;
}

export interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  user?: { name?: string; email?: string };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface SearchResults {
  products: Product[];
  customers: Customer[];
  templates: SlipTemplate[];
  slips: GeneratedSlip[];
}

export interface ApiList<T> {
  status: "success";
  data: T[];
  meta?: { page: number; limit: number; total: number; pages: number };
}

export interface ApiItem<T> {
  status: "success";
  data: T;
}
