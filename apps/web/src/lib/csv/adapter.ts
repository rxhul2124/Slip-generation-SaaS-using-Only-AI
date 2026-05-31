import type { GeneratedSlip, SlipTemplate } from "@/lib/types";
import type { CanonicalSlip } from "./types";

/**
 * Converts a CSV CanonicalSlip into a GeneratedSlip
 * so it can be consumed by the existing SlipRenderer.
 * 
 * Note: Visual templates are currently designed for a single product.
 * This adapter uses the first line item for the product data.
 */
export function adaptCanonicalToGenerated(
  canonical: CanonicalSlip,
  template: SlipTemplate
): GeneratedSlip {
  const lineItem = canonical.lineItems[0];
  
  return {
    _id: `temp_${crypto.randomUUID()}`,
    serialNumber: canonical.orderNumber || `CSV-${Date.now()}`,
    createdAt: canonical.date || new Date().toISOString(),
    status: "generated",
    printedCount: 0,
    exportedCount: 0,
    template,
    customer: {
      _id: canonical.linkedCustomer?._id || "temp_customer",
      name: canonical.customerName,
      contactPerson: canonical.contactPerson,
      email: canonical.email,
      phone: canonical.phone,
      shippingAddress: {
        line1: canonical.shippingAddress,
        city: canonical.city,
        state: canonical.state,
        postalCode: canonical.postalCode,
        country: canonical.country,
      }
    },
    product: {
      _id: lineItem?.linkedProduct?._id || "temp_product",
      name: lineItem?.productName || "Unknown Product",
      sku: lineItem?.sku,
      partNumber: lineItem?.partNumber,
      weight: lineItem?.weight ? { value: lineItem.weight } : undefined,
      notes: lineItem?.notes,
    },
    lineItems: canonical.lineItems,
    quantity: lineItem?.quantity || 1,
    notes: canonical.notes,
    barcodeValue: canonical.trackingId || canonical.orderNumber,
    companyName: "Your Company",
  };
}
