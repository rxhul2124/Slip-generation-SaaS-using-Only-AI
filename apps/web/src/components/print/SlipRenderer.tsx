import { QRCodeSVG } from "qrcode.react";
import type { CSSProperties } from "react";
import type { GeneratedSlip, TemplateElement } from "@/lib/types";
import { mmToCssPx } from "@/lib/print/layoutEngine";
import { getIndustrialFieldLabel, getIndustrialFieldValue, getSlipTypeDefinition } from "@/lib/slipTypes";
import { cn } from "@/lib/utils";
import { Barcode } from "./Barcode";

function valueAt(source: Record<string, unknown>, path?: string) {
  if (!path) return "";
  return path.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
    return undefined;
  }, source);
}

function formatElementValue(element: TemplateElement, slip: GeneratedSlip) {
  if (slip._id === "template-preview-placeholder") {
    return element.label || element.field || element.type.toUpperCase();
  }

  const source = {
    ...slip,
    generatedDate: new Date(slip.createdAt).toLocaleDateString(),
    "product.name": slip.product.name
  };
  const raw = valueAt(source, element.field) ?? element.value ?? element.label ?? "";
  if (typeof raw === "object") return JSON.stringify(raw);
  return String(raw);
}

function stringStyle(element: TemplateElement, key: string, fallback: string) {
  const value = element.style?.[key];
  return typeof value === "string" ? value : fallback;
}

function numericStyle(element: TemplateElement, key: string, fallback: number) {
  const value = element.style?.[key];
  return typeof value === "number" ? value : fallback;
}

function boolStyle(element: TemplateElement, key: string) {
  return element.style?.[key] === true;
}

function imageUrl(value: unknown) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  const source = value as Record<string, unknown>;
  return String(source.secureUrl || source.url || source.imageDataUrl || "");
}

function watermarkSource(slip: GeneratedSlip) {
  return slip.template.watermark?.imageDataUrl || imageUrl(slip.company?.logo);
}

function ElementView({ element, slip }: { element: TemplateElement; slip: GeneratedSlip }) {
  if (element.type === "logo") {
    const logoUrl = watermarkSource(slip);
    if (!logoUrl) return null;
    return (
      <div
        className="absolute flex items-center justify-center overflow-hidden"
        style={{
          left: mmToCssPx(element.x),
          top: mmToCssPx(element.y),
          width: mmToCssPx(element.width),
          height: mmToCssPx(element.height),
          transform: `rotate(${element.rotate || 0}deg)`,
          zIndex: element.zIndex || 1
        }}
      >
        <img src={logoUrl} alt="" className="max-h-full max-w-full object-contain" />
      </div>
    );
  }

  const highlighted = boolStyle(element, "highlight");
  const explicitBg = element.style?.backgroundColor as string | undefined;
  const explicitBorder = element.style?.borderColor as string | undefined;
  const alignment = (element.style?.alignment as string) || "left";

  const style: CSSProperties = {
    position: "absolute",
    left: mmToCssPx(element.x),
    top: mmToCssPx(element.y),
    width: mmToCssPx(element.width),
    height: mmToCssPx(element.height),
    transform: `rotate(${element.rotate || 0}deg)`,
    zIndex: element.zIndex || 1,
    fontSize: numericStyle(element, "fontSize", 10),
    fontWeight: numericStyle(element, "fontWeight", 700),
    color: stringStyle(element, "color", "#000000"),
    backgroundColor: explicitBg || (highlighted ? "#fef3c7" : "transparent"),
    border: explicitBorder ? `1px solid ${explicitBorder}` : highlighted ? "1px solid #f59e0b" : "none",
    padding: "2px 4px",
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: alignment === "center" ? "center" : alignment === "right" ? "flex-end" : "flex-start",
    textAlign: alignment as any
  };
  const value = formatElementValue(element, slip);

  if (element.type === "barcode") {
    return (
      <div className="absolute flex items-center justify-center overflow-hidden" style={style}>
        <Barcode value={value || slip.barcodeValue || "SLIP123456"} height={Math.max(12, mmToCssPx(element.height) - 4)} />
      </div>
    );
  }

  if (element.type === "qr") {
    return (
      <div className="absolute flex items-center justify-center overflow-hidden bg-white" style={style}>
        <QRCodeSVG value={value || JSON.stringify(slip.qrPayload || {})} size={Math.min(mmToCssPx(element.width) - 2, mmToCssPx(element.height) - 2)} />
      </div>
    );
  }

  if (element.type === "line") {
    return <div className="absolute border-t" style={{ ...style, borderTop: `1px solid ${explicitBorder || "#000000"}` }} />;
  }

  if (element.type === "box") {
    return <div className="absolute border" style={{ ...style, border: `1px solid ${explicitBorder || "#000000"}` }} />;
  }

  return (
    <div className="absolute overflow-hidden text-ellipsis whitespace-pre-wrap leading-tight" style={style}>
      {value}
    </div>
  );
}

function IndustrialFieldRow({ field, slip }: { field: ReturnType<typeof getSlipTypeDefinition>["visibleFields"][number]; slip: GeneratedSlip }) {
  const value = getIndustrialFieldValue(field, slip) || "";
  const label = getIndustrialFieldLabel(field);
  const isSignature = field === "signature";
  const signatureImage = slip.signature?.mode === "image" ? slip.signature.imageDataUrl : slip.signature?.mode === "pad" ? slip.signature.padDataUrl : undefined;

  return (
    <div className="flex min-h-0 flex-1 border-t border-black">
      <div className="flex w-[30%] items-center border-r border-black px-1 text-[8px] font-black uppercase leading-none">{label}:</div>
      <div className="flex min-w-0 flex-1 items-center px-1.5 py-0.5 text-[10px] font-extrabold leading-tight">
        {isSignature && signatureImage ? (
          <img src={signatureImage} alt="" className="max-h-[18px] max-w-full object-contain" />
        ) : (
          <span className={cn("block min-w-0 break-words", value.length > 28 ? "text-[8.5px]" : "text-[10px]")}>{value}</span>
        )}
      </div>
    </div>
  );
}


function IndustrialSlipView({ slip }: { slip: GeneratedSlip }) {
  const slipType = getSlipTypeDefinition(slip.slipType);
  const userCompanyName = slip.companyName || slip.company?.name || "Your Company";

  return (
    <div className="industrial-slip flex h-full w-full flex-col border border-black bg-white font-mono text-black">
      <div className={cn("grid h-[14%] place-items-center border-b border-black text-[12px] font-black leading-none", slipType.titleClassName)}>
        {slipType.title}
      </div>
      <div className="grid h-[13%] place-items-center border-b border-black px-1 text-center text-[10px] font-black uppercase leading-none">
        {userCompanyName}
      </div>
      <div className="min-h-0 flex-1">
        <div className="flex h-full flex-col">
          {slipType.visibleFields.map((field) => (
            <IndustrialFieldRow key={field} field={field} slip={slip} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StructuredSlipView({ slip }: { slip: GeneratedSlip }) {
  const blocks = slip.template.blocks || {};
  const header = blocks.header || { showLogo: true, showDate: true, showSlipId: true, showInvoiceId: true, align: "left" };
  const customer = blocks.customer || { showPhone: true, showEmail: true, showAddress: true, showContactPerson: true };
  const table = blocks.table || { columns: ["index", "product", "sku", "qty", "price", "total"] as const };
  const footer = blocks.footer || { showNotes: true, showTotals: true, showSignatures: true };

  const fs = (base: number) => `${base}px`;
  
  const address = slip.customer?.shippingAddress 
    ? [slip.customer.shippingAddress.line1, slip.customer.shippingAddress.city, slip.customer.shippingAddress.state, slip.customer.shippingAddress.postalCode, slip.customer.shippingAddress.country].filter(Boolean).join(", ")
    : "";

  const lineItems = slip.lineItems && slip.lineItems.length > 0 
    ? slip.lineItems 
    : [{ productName: slip.product?.name || "Unknown Product", sku: slip.product?.sku, quantity: slip.quantity, unitPrice: undefined, totalPrice: undefined }];

  return (
    <div className="relative flex h-full w-full flex-col font-sans text-black">
      {/* ── Fixed Header ── */}
      <div style={{ padding: "16px 20px 12px", borderBottom: "2px solid #111" }}>
        <div style={{ display: "flex", justifyContent: header.align === "left" ? "space-between" : header.align === "center" ? "center" : "flex-end", alignItems: "flex-start", textAlign: header.align }}>
          {header.align === "left" && (
            <div>
              {header.showLogo && !!slip.company?.logo && <img src={imageUrl(slip.company.logo)} alt="" style={{ maxHeight: 32, marginBottom: 8 }} />}
              <div style={{ fontSize: fs(18), fontWeight: 800, letterSpacing: "-0.02em" }}>PACKING SLIP</div>
              {header.showDate && <div style={{ fontSize: fs(10), color: "#666", marginTop: 2 }}>{new Date(slip.createdAt).toLocaleDateString()}</div>}
            </div>
          )}
          {header.align === "left" && (
            <div style={{ textAlign: "right" }}>
              {header.showSlipId && <div style={{ fontSize: fs(11), fontWeight: 700 }}>#{slip.serialNumber}</div>}
              {header.showInvoiceId && slip.orderReference && <div style={{ fontSize: fs(9), color: "#666" }}>REF: {slip.orderReference}</div>}
            </div>
          )}
          {header.align !== "left" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: header.align === "center" ? "center" : "flex-end" }}>
              {header.showLogo && !!slip.company?.logo && <img src={imageUrl(slip.company.logo)} alt="" style={{ maxHeight: 32 }} />}
              <div style={{ fontSize: fs(18), fontWeight: 800, letterSpacing: "-0.02em" }}>PACKING SLIP</div>
              {header.showDate && <div style={{ fontSize: fs(10), color: "#666", marginTop: 2 }}>{new Date(slip.createdAt).toLocaleDateString()}</div>}
              {header.showSlipId && <div style={{ fontSize: fs(11), fontWeight: 700 }}>#{slip.serialNumber}</div>}
              {header.showInvoiceId && slip.orderReference && <div style={{ fontSize: fs(9), color: "#666" }}>REF: {slip.orderReference}</div>}
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12, fontSize: fs(9) }}>
          <div>
            <div style={{ fontWeight: 700, textTransform: "uppercase", fontSize: fs(8), color: "#888", marginBottom: 2 }}>Ship To</div>
            <div style={{ fontWeight: 700 }}>{slip.customer?.name}</div>
            {customer.showContactPerson && slip.customer?.contactPerson && <div>{slip.customer.contactPerson}</div>}
            {customer.showAddress && address && <div style={{ color: "#444", lineHeight: 1.4 }}>{address}</div>}
          </div>
          <div>
            {customer.showPhone && slip.customer?.phone && <div><span style={{ color: "#888" }}>Phone:</span> {slip.customer.phone}</div>}
            {customer.showEmail && slip.customer?.email && <div><span style={{ color: "#888" }}>Email:</span> {slip.customer.email}</div>}
          </div>
        </div>
      </div>

      {/* ── Dynamic Content: Line Items Table ── */}
      <div style={{ padding: "0 20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fs(9), marginTop: 8 }}>
          <thead>
            <tr style={{ borderBottom: "1.5px solid #333" }}>
              {table.columns.map(col => {
                if (col === "index") return <th key={col} style={{ textAlign: "left", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>#</th>;
                if (col === "product") return <th key={col} style={{ textAlign: "left", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Product</th>;
                if (col === "sku") return <th key={col} style={{ textAlign: "left", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>SKU</th>;
                if (col === "qty") return <th key={col} style={{ textAlign: "right", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Qty</th>;
                if (col === "price") return <th key={col} style={{ textAlign: "right", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Price</th>;
                if (col === "total") return <th key={col} style={{ textAlign: "right", padding: "6px 4px", fontWeight: 800, fontSize: fs(8), textTransform: "uppercase", color: "#555" }}>Total</th>;
                return null;
              })}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #e5e5e5" }}>
                {table.columns.map(col => {
                  if (col === "index") return <td key={col} style={{ padding: "5px 4px", fontFamily: "monospace", color: "#888" }}>{i + 1}</td>;
                  if (col === "product") return <td key={col} style={{ padding: "5px 4px", fontWeight: 600 }}>{item.productName}</td>;
                  if (col === "sku") return <td key={col} style={{ padding: "5px 4px", fontFamily: "monospace", color: "#666" }}>{item.sku || "—"}</td>;
                  if (col === "qty") return <td key={col} style={{ padding: "5px 4px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{item.quantity}</td>;
                  if (col === "price") return <td key={col} style={{ padding: "5px 4px", textAlign: "right", fontFamily: "monospace" }}>{item.unitPrice != null ? `₹${item.unitPrice.toFixed(2)}` : "—"}</td>;
                  if (col === "total") return <td key={col} style={{ padding: "5px 4px", textAlign: "right", fontFamily: "monospace", fontWeight: 700 }}>{item.totalPrice != null ? `₹${item.totalPrice.toFixed(2)}` : item.unitPrice != null ? `₹${(item.unitPrice * item.quantity).toFixed(2)}` : "—"}</td>;
                  return null;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: "auto", width: "100%", padding: "12px 20px", borderTop: "1.5px solid #333", backgroundColor: "transparent" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: fs(9) }}>
          <div style={{ flex: 1 }}>
            {footer.showNotes && slip.notes && (
              <div style={{ color: "#555", maxWidth: 300 }}>
                <span style={{ fontWeight: 700 }}>Notes: </span>{slip.notes}
              </div>
            )}
          </div>
          {footer.showSignatures && slip.signature?.text && (
            <div style={{ textAlign: "center", marginRight: 20 }}>
              <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: fs(14) }}>{slip.signature.text}</div>
              <div style={{ borderTop: "1px solid #333", fontSize: fs(8), marginTop: 4, paddingTop: 2 }}>Authorized Signatory</div>
            </div>
          )}
          {footer.showTotals && (
            <div style={{ textAlign: "right", minWidth: 100 }}>
              {/* Future: Render totals if available */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SlipRenderer({ slip, scale = 1 }: { slip: GeneratedSlip; scale?: number }) {
  const template = slip.template;
  const watermark = template.watermark;
  const watermarkImage = watermark?.enabled ? watermarkSource(slip) : "";
  const watermarkOpacity = watermark?.opacity ?? 0.12;
  const watermarkSize = watermark?.size ?? 55;
  const width = mmToCssPx(template.width) * scale;
  const height = mmToCssPx(template.height) * scale;

  return (
    <div
      className="print-slip relative shrink-0 overflow-hidden border bg-white text-black"
      style={{
        width,
        height,
        transformOrigin: "top left",
        borderWidth: Math.max(template.borderThickness, 0.2)
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: mmToCssPx(template.width),
          height: mmToCssPx(template.height)
        }}
      >
        {watermark?.enabled && watermarkImage ? (
          <img
            src={watermarkImage}
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 object-contain"
            style={{
              width: mmToCssPx(template.width) * (watermarkSize / 100),
              height: mmToCssPx(template.height) * (watermarkSize / 100),
              opacity: watermarkOpacity,
              transform: "translate(-50%, -50%)",
              zIndex: 0
            }}
          />
        ) : null}
        <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
          {template.elements && template.elements.length > 0 ? (
            template.elements.map((element) => <ElementView key={element.id} element={element} slip={slip} />)
          ) : template.layoutMode === "blocks" ? (
            <StructuredSlipView slip={slip} />
          ) : (
            <IndustrialSlipView slip={slip} />
          )}
        </div>
      </div>
    </div>
  );
}
