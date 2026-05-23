import type { GeneratedSlip, SlipType } from "./types";

export type IndustrialSlipField =
  | "date"
  | "partName"
  | "partNumber"
  | "dimensions"
  | "quantityWeight"
  | "destination"
  | "orderReference"
  | "notes"
  | "signature"
  | "customerCompany";

export interface SlipTypeDefinition {
  id: SlipType;
  title: string;
  label: string;
  printLabel: string;
  visibleFields: IndustrialSlipField[];
  titleClassName: string;
}

export const slipTypeDefinitions: SlipTypeDefinition[] = [
  {
    id: "packing",
    title: "Packing Slip",
    label: "Packing Slip",
    printLabel: "Packing",
    visibleFields: ["date", "partName", "partNumber", "quantityWeight", "customerCompany"],
    titleClassName: ""
  },
  {
    id: "dispatch",
    title: "Dispatch Slip",
    label: "Dispatch Slip",
    printLabel: "Dispatch",
    visibleFields: ["date", "partName", "partNumber", "quantityWeight", "customerCompany"],
    titleClassName: "uppercase"
  },
  {
    id: "delivery",
    title: "Delivery Slip",
    label: "Delivery Slip",
    printLabel: "Delivery",
    visibleFields: ["date", "partName", "partNumber", "quantityWeight", "customerCompany", "orderReference"],
    titleClassName: ""
  },
  {
    id: "warehouse",
    title: "Warehouse Slip",
    label: "Warehouse Slip",
    printLabel: "Warehouse",
    visibleFields: ["date", "partName", "partNumber", "dimensions", "quantityWeight", "customerCompany"],
    titleClassName: "uppercase"
  },
  {
    id: "qc",
    title: "QC Slip",
    label: "QC Slip",
    printLabel: "QC",
    visibleFields: ["date", "partName", "partNumber", "dimensions", "quantityWeight", "customerCompany"],
    titleClassName: "uppercase"
  }
];

export function getSlipTypeDefinition(slipType?: SlipType) {
  return slipTypeDefinitions.find((definition) => definition.id === slipType) || slipTypeDefinitions[0];
}

export function formatIndustrialDate(value: string | Date) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDimensions(slip: GeneratedSlip) {
  const dimensions = slip.product.dimensions;
  if (!dimensions) return "";
  const values = [dimensions.length, dimensions.width, dimensions.height].filter((value) => typeof value === "number");
  if (!values.length) return "";
  return `${values.map((value) => Number(value).toFixed(value && value % 1 ? 2 : 1)).join("X")} ${(dimensions.unit || "").toUpperCase()}`.trim();
}

export function formatWeight(value?: number, unit?: string) {
  if (typeof value !== "number") return "";
  const normalizedUnit = (unit || "KG").toUpperCase();
  const precision = normalizedUnit === "KG" || normalizedUnit === "TON" ? 3 : normalizedUnit === "LB" ? 2 : 0;
  return `${value.toFixed(precision)} ${normalizedUnit}`;
}

export function formatQuantityWeight(slip: GeneratedSlip) {
  const quantityUnit = slip.quantityUnit || slip.product.quantityUnit || "NOS";
  const weight = slip.displayWeight || slip.product.weight;
  const weightText = formatWeight(weight?.value, weight?.unit);
  return `${slip.quantity} ${quantityUnit}${weightText ? ` (${weightText})` : ""}`;
}

export function getIndustrialFieldValue(field: IndustrialSlipField, slip: GeneratedSlip) {
  switch (field) {
    case "date":
      return formatIndustrialDate(slip.createdAt);
    case "partName":
      return slip.product.partName || slip.product.name;
    case "partNumber":
      return slip.product.partNumber || slip.product.sku;
    case "dimensions":
      return formatDimensions(slip);
    case "quantityWeight":
      return formatQuantityWeight(slip);
    case "customerCompany":
      return slip.customer.name;
    case "destination":
      return slip.destination || slip.customer.shippingAddress?.city || "";
    case "orderReference":
      return slip.orderReference || "";
    case "notes":
      return slip.notes || "";
    case "signature":
      return slip.signature?.text || slip.signature?.fullName || "";
    default:
      return "";
  }
}

export function getIndustrialFieldLabel(field: IndustrialSlipField) {
  const labels: Record<IndustrialSlipField, string> = {
    date: "DATE",
    partName: "Part Name",
    partNumber: "Part No.",
    dimensions: "Dimensions",
    quantityWeight: "Qty",
    destination: "Destination",
    orderReference: "Order Ref.",
    notes: "Remarks",
    signature: "Signature",
    customerCompany: "Customer"
  };
  return labels[field];
}
