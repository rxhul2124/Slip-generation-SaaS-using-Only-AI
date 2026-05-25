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

function ElementView({ element, slip }: { element: TemplateElement; slip: GeneratedSlip }) {
  const highlighted = boolStyle(element, "highlight");
  const borderColor = stringStyle(element, "borderColor", highlighted ? "#f59e0b" : "#111827");
  const style: CSSProperties = {
    left: mmToCssPx(element.x),
    top: mmToCssPx(element.y),
    width: mmToCssPx(element.width),
    height: mmToCssPx(element.height),
    transform: `rotate(${element.rotate || 0}deg)`,
    zIndex: element.zIndex || 1,
    fontSize: numericStyle(element, "fontSize", 10),
    fontWeight: numericStyle(element, "fontWeight", 700),
    color: stringStyle(element, "color", "#000000"),
    backgroundColor: highlighted ? stringStyle(element, "backgroundColor", "#fef3c7") : undefined,
    border: `1px solid ${borderColor}`,
    padding: "2px 3px",
    boxSizing: "border-box"
  };
  const value = formatElementValue(element, slip);

  if (element.type === "barcode") {
    return (
      <div className="absolute flex items-center justify-center" style={style}>
        <Barcode value={value || slip.barcodeValue} height={mmToCssPx(element.height) - 14} />
      </div>
    );
  }

  if (element.type === "qr") {
    return (
      <div className="absolute grid place-items-center bg-white" style={style}>
        <QRCodeSVG value={value || JSON.stringify(slip.qrPayload || {})} size={Math.min(mmToCssPx(element.width), mmToCssPx(element.height))} />
      </div>
    );
  }

  if (element.type === "line") {
    return <div className="absolute border-t" style={{ ...style, borderColor: stringStyle(element, "borderColor", "#000000") }} />;
  }

  if (element.type === "box") {
    return <div className="absolute border" style={{ ...style, borderColor: stringStyle(element, "borderColor", "#000000") }} />;
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

export function SlipRenderer({ slip, scale = 1 }: { slip: GeneratedSlip; scale?: number }) {
  const template = slip.template;
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
        className="absolute inset-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: mmToCssPx(template.width),
          height: mmToCssPx(template.height)
        }}
      >
        {template.renderer === "industrial" ? (
          <IndustrialSlipView slip={slip} />
        ) : (
          template.elements.map((element) => <ElementView key={element.id} element={element} slip={slip} />)
        )}
      </div>
    </div>
  );
}
