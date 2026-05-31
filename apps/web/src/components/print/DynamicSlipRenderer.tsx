import type { CanonicalSlip } from "@/lib/csv/types";
import { mmToCssPx } from "@/lib/print/layoutEngine";

interface DynamicSlipRendererProps {
  slip: CanonicalSlip;
  template?: { width: number; height: number; units: "mm" | "cm" | "in" | "px" };
  pageIndex?: number;
  totalPages?: number;
  scale?: number;
}

const DEFAULT_TEMPLATE = { width: 210, height: 297, units: "mm" as const };

export function DynamicSlipRenderer({
  slip,
  template = DEFAULT_TEMPLATE,
  pageIndex = 0,
  totalPages = 1,
  scale = 1,
}: DynamicSlipRendererProps) {
  const w = mmToCssPx(template.width) * scale;
  const h = mmToCssPx(template.height) * scale;
  const fs = (base: number) => `${base * scale}px`;

  const address = [slip.shippingAddress, slip.city, slip.state, slip.postalCode, slip.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div
      className="relative shrink-0 overflow-hidden border bg-white text-black"
      style={{ width: w, height: h, fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: mmToCssPx(template.width), height: mmToCssPx(template.height) }}>
        {/* ── Fixed Header ── */}
        <div style={{ padding: "16px 20px 12px", borderBottom: "2px solid #111" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: fs(18), fontWeight: 800, letterSpacing: "-0.02em" }}>PACKING SLIP</div>
              <div style={{ fontSize: fs(10), color: "#666", marginTop: 2 }}>
                {slip.date ? new Date(slip.date).toLocaleDateString() : new Date().toLocaleDateString()}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: fs(11), fontWeight: 700 }}>#{slip.orderNumber}</div>
              {slip.invoiceNumber && (
                <div style={{ fontSize: fs(9), color: "#666" }}>INV: {slip.invoiceNumber}</div>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, fontSize: fs(9) }}>
            <div>
              <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: fs(8), color: "#888", marginBottom: 2 }}>Ship To</div>
              <div style={{ fontWeight: 700 }}>{slip.customerName}</div>
              {slip.contactPerson && <div>{slip.contactPerson}</div>}
              {address && <div style={{ color: "#444", lineHeight: 1.4 }}>{address}</div>}
            </div>
            <div>
              {slip.phone && (
                <div><span style={{ color: "#888" }}>Phone:</span> {slip.phone}</div>
              )}
              {slip.email && (
                <div><span style={{ color: "#888" }}>Email:</span> {slip.email}</div>
              )}
              {slip.trackingId && (
                <div><span style={{ color: "#888" }}>Tracking:</span> {slip.trackingId}</div>
              )}
            </div>
          </div>
        </div>

        {/* ── Dynamic Content: Line Items Table ── */}
        <div style={{ padding: "0 20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fs(9), marginTop: 8 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid #333" }}>
                <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>#</th>
                <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Product</th>
                <th style={{ textAlign: "left", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>SKU</th>
                <th style={{ textAlign: "right", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Qty</th>
                <th style={{ textAlign: "right", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Price</th>
                <th style={{ textAlign: "right", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {slip.lineItems.map((item, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e5e5e5" }}>
                  <td style={{ padding: "5px 4px", fontFamily: "monospace", color: "#888" }}>{i + 1}</td>
                  <td style={{ padding: "5px 4px", fontWeight: 600 }}>{item.productName}</td>
                  <td style={{ padding: "5px 4px", fontFamily: "monospace", color: "#666" }}>{item.sku || "—"}</td>
                  <td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{item.quantity}</td>
                  <td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "monospace" }}>
                    {item.unitPrice != null ? `₹${item.unitPrice.toFixed(2)}` : "—"}
                  </td>
                  <td style={{ padding: "5px 4px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>
                    {item.totalPrice != null ? `₹${item.totalPrice.toFixed(2)}` : item.unitPrice != null ? `₹${(item.unitPrice * item.quantity).toFixed(2)}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Fixed Footer ── */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 20px", borderTop: "1.5px solid #333" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: fs(9) }}>
            <div style={{ flex: 1 }}>
              {slip.notes && (
                <div style={{ color: "#555", maxWidth: 300 }}>
                  <span style={{ fontWeight: 700 }}>Notes: </span>{slip.notes}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              {slip.totals?.total != null && (
                <div style={{ fontSize: fs(13), fontWeight: 800 }}>
                  Total: ₹{slip.totals.total.toFixed(2)}
                </div>
              )}
              {totalPages > 1 && (
                <div style={{ fontSize: fs(8), color: "#888", marginTop: 2 }}>
                  Page {pageIndex + 1} of {totalPages}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
