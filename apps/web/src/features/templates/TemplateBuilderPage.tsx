import { DndContext, DragEndEvent, useDraggable } from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import {
  Copy,
  Grid3X3,
  ImageIcon,
  Lock,
  Maximize2,
  Minus,
  Palette,
  Plus,
  Redo2,
  RotateCw,
  Ruler,
  Save,
  Trash2,
  Type,
  Undo2,
  Upload,
  Wand2,
  ZoomIn
} from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { SlipRenderer } from "@/components/print/SlipRenderer";
import { sampleSlips, sampleTemplate, sampleTemplates } from "@/lib/sampleData";
import type { SlipTemplate, TemplateElement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { mmToCssPx } from "@/lib/print/layoutEngine";
import { useNotificationStore } from "@/stores/notificationStore";

const pixelsPerMm = 96 / 25.4;
const minElementWidth = 8;
const minElementHeight = 5;

const palette: Array<Pick<TemplateElement, "type" | "label" | "field" | "width" | "height">> = [
  { type: "field", label: "Product", field: "product.name", width: 68, height: 12 },
  { type: "field", label: "Quantity", field: "quantity", width: 28, height: 10 },
  { type: "barcode", label: "Barcode", field: "barcodeValue", width: 60, height: 26 },
  { type: "qr", label: "QR Code", field: "qrPayload", width: 24, height: 24 },
  { type: "logo", label: "Company Logo", field: "company.logo", width: 28, height: 16 },
  { type: "field", label: "Customer", field: "customer.name", width: 64, height: 10 },
  { type: "field", label: "Destination", field: "destination", width: 74, height: 10 },
  { type: "field", label: "Serial", field: "serialNumber", width: 48, height: 9 },
  { type: "field", label: "Date", field: "generatedDate", width: 30, height: 9 },
  { type: "field", label: "Notes", field: "notes", width: 82, height: 20 }
];

const highlightSwatches = ["#fef3c7", "#dbeafe", "#dcfce7", "#ffe4e6", "#f5f3ff"];
const textSwatches = ["#111827", "#0f766e", "#1d4ed8", "#b45309", "#be123c"];
const borderSwatches = ["#111827", "#0f766e", "#2563eb", "#f59e0b", "#e11d48"];
const resizeHandles = ["nw", "ne", "sw", "se"] as const;

type ResizeHandle = (typeof resizeHandles)[number];

const handleStyles: Record<ResizeHandle, CSSProperties> = {
  nw: { left: -6, top: -6, cursor: "nwse-resize" },
  ne: { right: -6, top: -6, cursor: "nesw-resize" },
  sw: { left: -6, bottom: -6, cursor: "nesw-resize" },
  se: { right: -6, bottom: -6, cursor: "nwse-resize" }
};

function numericStyle(element: TemplateElement, key: string, fallback: number) {
  const value = element.style?.[key];
  return typeof value === "number" ? value : fallback;
}

function stringStyle(element: TemplateElement, key: string, fallback: string) {
  const value = element.style?.[key];
  return typeof value === "string" ? value : fallback;
}

function boolStyle(element: TemplateElement, key: string) {
  return element.style?.[key] === true;
}

function snapValue(value: number, snap = 1) {
  return Math.round(value / snap) * snap;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampedElementPatch(template: SlipTemplate, patch: Partial<TemplateElement>) {
  const width = clamp(Number(patch.width ?? minElementWidth), minElementWidth, template.width);
  const height = clamp(Number(patch.height ?? minElementHeight), minElementHeight, template.height);
  return {
    ...patch,
    width,
    height,
    x: clamp(Number(patch.x ?? 0), 0, Math.max(template.width - width, 0)),
    y: clamp(Number(patch.y ?? 0), 0, Math.max(template.height - height, 0))
  };
}

function starterElements(width: number, height: number): TemplateElement[] {
  const pad = Math.max(5, Math.round(width * 0.08));
  const full = width - pad * 2;
  const row = Math.max(7, Math.round(height * 0.16));
  const lowerY = Math.max(height - pad - row * 2, pad + row * 4);

  return [
    {
      id: `company-${crypto.randomUUID().slice(0, 6)}`,
      type: "field",
      label: "Company",
      field: "companyName",
      x: pad,
      y: pad,
      width: full,
      height: row,
      zIndex: 1,
      style: { fontSize: 11, fontWeight: 800, highlight: true, backgroundColor: "#fef3c7", borderColor: "#f59e0b" }
    },
    {
      id: `product-${crypto.randomUUID().slice(0, 6)}`,
      type: "field",
      label: "Product",
      field: "product.name",
      x: pad,
      y: pad + row + 3,
      width: full,
      height: row + 2,
      zIndex: 2,
      style: { fontSize: 12, fontWeight: 800, highlight: true, backgroundColor: "#dbeafe", borderColor: "#2563eb" }
    },
    {
      id: `customer-${crypto.randomUUID().slice(0, 6)}`,
      type: "field",
      label: "Customer",
      field: "customer.name",
      x: pad,
      y: pad + row * 2 + 8,
      width: full,
      height: row,
      zIndex: 3,
      style: { fontSize: 9, fontWeight: 700 }
    },
    {
      id: `serial-${crypto.randomUUID().slice(0, 6)}`,
      type: "field",
      label: "Serial",
      field: "serialNumber",
      x: pad,
      y: pad + row * 3 + 12,
      width: Math.round(full * 0.48),
      height: row,
      zIndex: 4,
      style: { fontSize: 8, fontWeight: 700 }
    },
    {
      id: `qty-${crypto.randomUUID().slice(0, 6)}`,
      type: "field",
      label: "Quantity",
      field: "quantity",
      x: pad,
      y: lowerY,
      width: Math.round(full * 0.34),
      height: row,
      zIndex: 5,
      style: { fontSize: 10, fontWeight: 800, highlight: true, backgroundColor: "#dcfce7", borderColor: "#16a34a" }
    },
    {
      id: `barcode-${crypto.randomUUID().slice(0, 6)}`,
      type: "barcode",
      label: "Barcode",
      field: "barcodeValue",
      x: pad + Math.round(full * 0.4),
      y: lowerY,
      width: Math.round(full * 0.6),
      height: row * 2,
      zIndex: 6
    }
  ];
}

function editableTemplate(template: SlipTemplate, patch: Partial<SlipTemplate> = {}): SlipTemplate {
  const elements = patch.elements || (template.elements.length ? template.elements : starterElements(template.width, template.height));
  return {
    ...template,
    ...patch,
    renderer: "template",
    elements
  };
}

function DraggableElement({
  element,
  selected,
  onSelect,
  onResizeStart,
  zoom
}: {
  element: TemplateElement;
  selected: boolean;
  onSelect: () => void;
  onResizeStart: (event: ReactPointerEvent<HTMLButtonElement>, element: TemplateElement, handle: ResizeHandle) => void;
  zoom: number;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: element.id, disabled: element.locked });
  const highlighted = boolStyle(element, "highlight");
  const elementStyle: CSSProperties = {
    left: mmToCssPx(element.x) * zoom,
    top: mmToCssPx(element.y) * zoom,
    width: mmToCssPx(element.width) * zoom,
    height: mmToCssPx(element.height) * zoom,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0) rotate(${element.rotate || 0}deg)` : `rotate(${element.rotate || 0}deg)`,
    zIndex: element.zIndex || 1,
    backgroundColor: highlighted ? stringStyle(element, "backgroundColor", "#fef3c7") : "rgba(255,255,255,.94)",
    borderColor: stringStyle(element, "borderColor", selected ? "#0f766e" : "rgba(0,0,0,.3)"),
    color: stringStyle(element, "color", "#111827"),
    fontSize: numericStyle(element, "fontSize", 10) * zoom,
    fontWeight: numericStyle(element, "fontWeight", element.type === "field" ? 700 : 600)
  };

  return (
    <div
      ref={setNodeRef}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onSelect();
      }}
      className={cn(
        "absolute flex touch-none items-center justify-center overflow-visible border shadow-sm outline-none",
        selected ? "ring-2 ring-primary/30" : "",
        element.locked ? "cursor-not-allowed opacity-70" : "cursor-move"
      )}
      style={elementStyle}
      {...listeners}
      {...attributes}
    >
      <span className="block max-h-full max-w-full overflow-hidden px-1 text-center leading-tight">
        {element.type === "barcode" ? "CODE128" : element.type === "qr" ? "QR" : element.label || element.field}
      </span>
      {selected && !element.locked
        ? resizeHandles.map((handle) => (
            <button
              key={handle}
              type="button"
              aria-label={`Resize ${handle}`}
              className="absolute h-3 w-3 rounded-full border border-primary bg-background shadow-sm"
              style={handleStyles[handle]}
              onPointerDown={(event) => onResizeStart(event, element, handle)}
            />
          ))
        : null}
    </div>
  );
}

export function TemplateBuilderPage() {
  const [searchParams] = useSearchParams();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const initialTemplate = useMemo<SlipTemplate>(() => {
    const requestedTemplate = sampleTemplates.find((item) => item._id === searchParams.get("template")) || sampleTemplate;
    if (searchParams.get("duplicate") === "1") {
      return editableTemplate(requestedTemplate, {
        _id: `template-${crypto.randomUUID().slice(0, 8)}`,
        name: `${requestedTemplate.name} Copy`,
        elements: requestedTemplate.elements.length
          ? requestedTemplate.elements.map((element) => ({ ...element, id: `${element.id}-${crypto.randomUUID().slice(0, 4)}` }))
          : starterElements(requestedTemplate.width, requestedTemplate.height)
      });
    }
    if (!searchParams.get("template")) {
      return editableTemplate(sampleTemplate, {
        _id: `template-${crypto.randomUUID().slice(0, 8)}`,
        name: "New Design",
        elements: starterElements(sampleTemplate.width, sampleTemplate.height)
      });
    }
    return editableTemplate(requestedTemplate);
  }, [searchParams]);
  const [template, setTemplate] = useState<SlipTemplate>(initialTemplate);
  const [selectedId, setSelectedId] = useState(template.elements[0]?.id);
  const [zoom, setZoom] = useState(1.15);
  const [mode, setMode] = useState<"design" | "preview">("design");
  const [referenceImage, setReferenceImage] = useState<{ src: string; name: string; opacity: number } | null>(null);
  const notify = useNotificationStore((state) => state.push);
  const selected = useMemo(() => template.elements.find((element) => element.id === selectedId), [template, selectedId]);

  const updateElement = (id: string, patch: Partial<TemplateElement>) => {
    setTemplate((current) => ({
      ...current,
      elements: current.elements.map((element) => (element.id === id ? { ...element, ...patch } : element))
    }));
  };

  const updateSelectedStyle = (patch: NonNullable<TemplateElement["style"]>) => {
    if (!selected) return;
    updateElement(selected.id, { style: { ...(selected.style || {}), ...patch } });
  };

  const addElement = (item: (typeof palette)[number]) => {
    const id = `${item.type}-${crypto.randomUUID().slice(0, 8)}`;
    const element: TemplateElement = {
      id,
      type: item.type,
      label: item.label,
      field: item.field,
      x: 8,
      y: 12,
      width: item.width,
      height: item.height,
      zIndex: template.elements.length + 1,
      style: item.type === "field" ? { fontSize: 10, fontWeight: 700 } : undefined
    };
    setTemplate((current) => ({ ...current, renderer: "template", elements: [...current.elements, element] }));
    setSelectedId(id);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const element = template.elements.find((item) => item.id === event.active.id);
    if (!element || !event.delta) return;
    const dx = event.delta.x / zoom / pixelsPerMm;
    const dy = event.delta.y / zoom / pixelsPerMm;
    const snap = template.snapGrid || 1;
    updateElement(
      element.id,
      clampedElementPatch(template, {
        x: snapValue(element.x + dx, snap),
        y: snapValue(element.y + dy, snap),
        width: element.width,
        height: element.height
      })
    );
  };

  const onResizeStart = (event: ReactPointerEvent<HTMLButtonElement>, element: TemplateElement, handle: ResizeHandle) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedId(element.id);

    const origin = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height
    };

    const resize = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - origin.pointerX) / zoom / pixelsPerMm;
      const dy = (moveEvent.clientY - origin.pointerY) / zoom / pixelsPerMm;
      let nextX = origin.x;
      let nextY = origin.y;
      let nextWidth = origin.width;
      let nextHeight = origin.height;

      if (handle.includes("e")) nextWidth = origin.width + dx;
      if (handle.includes("s")) nextHeight = origin.height + dy;
      if (handle.includes("w")) {
        nextWidth = origin.width - dx;
        nextX = origin.x + dx;
      }
      if (handle.includes("n")) {
        nextHeight = origin.height - dy;
        nextY = origin.y + dy;
      }

      nextWidth = Math.max(minElementWidth, nextWidth);
      nextHeight = Math.max(minElementHeight, nextHeight);
      if (handle.includes("w")) nextX = origin.x + origin.width - nextWidth;
      if (handle.includes("n")) nextY = origin.y + origin.height - nextHeight;

      const snap = template.snapGrid || 1;
      updateElement(
        element.id,
        clampedElementPatch(template, {
          x: snapValue(nextX, snap),
          y: snapValue(nextY, snap),
          width: snapValue(nextWidth, snap),
          height: snapValue(nextHeight, snap)
        })
      );
    };

    const stop = () => {
      window.removeEventListener("pointermove", resize);
      window.removeEventListener("pointerup", stop);
    };

    window.addEventListener("pointermove", resize);
    window.addEventListener("pointerup", stop);
  };

  const resizeSelectedBox = (delta: number) => {
    if (!selected) return;
    const snap = template.snapGrid || 1;
    updateElement(
      selected.id,
      clampedElementPatch(template, {
        x: selected.x,
        y: selected.y,
        width: snapValue(selected.width + delta, snap),
        height: snapValue(selected.height + delta * 0.55, snap)
      })
    );
  };

  const changeSelectedFontSize = (delta: number) => {
    if (!selected) return;
    const current = numericStyle(selected, "fontSize", 10);
    updateSelectedStyle({ fontSize: clamp(current + delta, 6, 32) });
  };

  const createTemplateFromImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result || "");
      const image = new Image();
      image.onload = () => {
        const pad = Math.max(6, Math.round(template.width * 0.06));
        const full = template.width - pad * 2;
        const fieldHeight = Math.max(7, Math.round(template.height * 0.07));
        const lowerY = Math.max(template.height - pad - fieldHeight * 2, pad + fieldHeight * 4);
        const suggestions: TemplateElement[] = [
          {
            id: `company-${crypto.randomUUID().slice(0, 6)}`,
            type: "field",
            label: "Company",
            field: "companyName",
            x: pad,
            y: pad,
            width: full,
            height: fieldHeight,
            zIndex: 1,
            style: { fontSize: 11, fontWeight: 800, highlight: true, backgroundColor: "#fef3c7", borderColor: "#f59e0b" }
          },
          {
            id: `serial-${crypto.randomUUID().slice(0, 6)}`,
            type: "field",
            label: "Serial",
            field: "serialNumber",
            x: pad,
            y: pad + fieldHeight + 3,
            width: Math.round(full * 0.48),
            height: fieldHeight,
            zIndex: 2,
            style: { fontSize: 9, fontWeight: 700 }
          },
          {
            id: `date-${crypto.randomUUID().slice(0, 6)}`,
            type: "field",
            label: "Date",
            field: "generatedDate",
            x: pad + Math.round(full * 0.56),
            y: pad + fieldHeight + 3,
            width: Math.round(full * 0.44),
            height: fieldHeight,
            zIndex: 3,
            style: { fontSize: 9, fontWeight: 700 }
          },
          {
            id: `product-${crypto.randomUUID().slice(0, 6)}`,
            type: "field",
            label: "Product",
            field: "product.name",
            x: pad,
            y: pad + fieldHeight * 2 + 8,
            width: full,
            height: fieldHeight + 2,
            zIndex: 4,
            style: { fontSize: 12, fontWeight: 800, highlight: true, backgroundColor: "#dbeafe", borderColor: "#2563eb" }
          },
          {
            id: `customer-${crypto.randomUUID().slice(0, 6)}`,
            type: "field",
            label: "Customer",
            field: "customer.name",
            x: pad,
            y: pad + fieldHeight * 3 + 14,
            width: full,
            height: fieldHeight,
            zIndex: 5,
            style: { fontSize: 9, fontWeight: 700 }
          },
          {
            id: `qty-${crypto.randomUUID().slice(0, 6)}`,
            type: "field",
            label: "Quantity",
            field: "quantity",
            x: pad,
            y: lowerY,
            width: Math.round(full * 0.32),
            height: fieldHeight,
            zIndex: 6,
            style: { fontSize: 10, fontWeight: 800, highlight: true, backgroundColor: "#dcfce7", borderColor: "#16a34a" }
          },
          {
            id: `barcode-${crypto.randomUUID().slice(0, 6)}`,
            type: "barcode",
            label: "Barcode",
            field: "barcodeValue",
            x: pad + Math.round(full * 0.38),
            y: lowerY,
            width: Math.round(full * 0.62),
            height: fieldHeight * 2 + 3,
            zIndex: 7
          }
        ];

        setReferenceImage({ src, name: file.name, opacity: 0.28 });
        setTemplate((current) => ({
          ...current,
          name: `${file.name.replace(/\.[^.]+$/, "")} template`,
          renderer: "template",
          elements: suggestions
        }));
        setSelectedId(suggestions[0]?.id);
        notify({
          tone: "success",
          title: "Template drafted from image",
          body: "The image is fitted as a reference over the current paper size; edit or resize the generated fields."
        });
      };
      image.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <PageHeader
        eyebrow="Templates"
        title={searchParams.get("template") ? "Edit slip design" : "New slip design"}
        description="Design reusable packing slips with draggable fields, resize handles, field highlighting, image references, print preview, thermal dimensions, and locked elements."
        actions={
          <>
            <SegmentedControl
              value={mode}
              onChange={setMode}
              options={[
                { value: "design", label: "Design" },
                { value: "preview", label: "Preview" }
              ]}
            />
            <Button variant="outline" onClick={() => notify({ tone: "info", title: "Undo", body: "Undo history starts after the next saved edit checkpoint." })}>
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => notify({ tone: "info", title: "Redo", body: "Redo history starts after the next saved edit checkpoint." })}>
              <Redo2 className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => {
                localStorage.setItem("packslip.templateDraft", JSON.stringify(template));
                notify({ tone: "success", title: "Template saved", body: `${template.name} was saved locally.` });
              }}
            >
              <Save className="h-4 w-4" /> Save
            </Button>
          </>
        }
      />

      <Card className="mb-4">
        <CardHeader className="flex-col gap-2 sm:flex-row sm:items-start">
          <div>
            <CardTitle>Elements</CardTitle>
            <CardDescription>Add fields horizontally, then tune the selected field in the inspector.</CardDescription>
          </div>
          {referenceImage ? (
            <Badge variant="muted">
              <Wand2 className="mr-1 h-3 w-3" /> Image reference
            </Badge>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) createTemplateFromImage(file);
              event.currentTarget.value = "";
            }}
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Button variant="outline" className="shrink-0" onClick={() => imageInputRef.current?.click()}>
              <ImageIcon className="h-4 w-4" /> Import slip image
            </Button>
            {palette.map((item) => (
              <Button key={`${item.type}-${item.label}`} variant="outline" className="shrink-0" onClick={() => addElement(item)}>
                <Plus className="h-4 w-4" /> {item.label}
              </Button>
            ))}
          </div>
          {referenceImage ? (
            <div className="grid gap-3 rounded-md border bg-muted/40 p-3 text-xs font-semibold text-muted-foreground sm:grid-cols-[220px_1fr]">
              <div className="flex min-w-0 items-center gap-2 text-foreground">
                <Wand2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{referenceImage.name}</span>
              </div>
              <label className="flex items-center gap-3">
                <span className="shrink-0">Reference opacity</span>
                <input
                  className="w-full accent-[hsl(var(--primary))]"
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.05"
                  value={referenceImage.opacity}
                  onChange={(event) => setReferenceImage({ ...referenceImage, opacity: Number(event.target.value) })}
                />
              </label>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
        <Card className="self-start xl:sticky xl:top-4">
          <CardHeader>
            <div>
              <CardTitle>Inspector</CardTitle>
              <CardDescription>Field size, highlight, paper, and print behavior.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Template name</span>
              <Input value={template.name} onChange={(event) => setTemplate({ ...template, name: event.target.value })} placeholder="Example: Small Template" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Paper width</span>
                <Input type="number" value={template.width} onChange={(event) => setTemplate({ ...template, width: Number(event.target.value) })} placeholder="Width in mm" />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Paper height</span>
                <Input type="number" value={template.height} onChange={(event) => setTemplate({ ...template, height: Number(event.target.value) })} placeholder="Height in mm" />
              </label>
            </div>
            <Select value={template.format} onChange={(event) => setTemplate({ ...template, format: event.target.value as SlipTemplate["format"] })}>
              <option value="4x6">4x6 Thermal</option>
              <option value="2x4">2x4 Label</option>
              <option value="a4">A4 Sheet</option>
              <option value="letter">Letter Sheet</option>
              <option value="custom">Custom</option>
            </Select>
            <Select value={template.renderer || "template"} onChange={(event) => setTemplate({ ...template, renderer: event.target.value as SlipTemplate["renderer"] })}>
              <option value="industrial">Industrial bordered renderer</option>
              <option value="template">Freeform template renderer</option>
            </Select>
            <Switch checked={template.thermalMode} onCheckedChange={(thermalMode) => setTemplate({ ...template, thermalMode })} label="Thermal mode" />
            <label className="block space-y-1 text-sm">
              <span className="flex items-center gap-2 font-semibold">
                <ZoomIn className="h-4 w-4" /> Canvas zoom
              </span>
              <input className="w-full accent-[hsl(var(--primary))]" type="range" min="0.7" max="2.2" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} />
            </label>

            {selected ? (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 text-sm font-bold">{selected.label || selected.field}</div>
                  <Badge variant="default">{selected.type}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(["x", "y", "width", "height"] as const).map((key) => (
                    <label key={key} className="space-y-1 text-xs font-semibold uppercase text-muted-foreground">
                      {key}
                      <Input
                        type="number"
                        value={selected[key]}
                        placeholder={key}
                        onChange={(event) =>
                          updateElement(
                            selected.id,
                            clampedElementPatch(template, {
                              x: key === "x" ? Number(event.target.value) : selected.x,
                              y: key === "y" ? Number(event.target.value) : selected.y,
                              width: key === "width" ? Number(event.target.value) : selected.width,
                              height: key === "height" ? Number(event.target.value) : selected.height
                            })
                          )
                        }
                      />
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => resizeSelectedBox(-3)}>
                    <Minus className="h-4 w-4" /> Box
                  </Button>
                  <Button variant="outline" onClick={() => resizeSelectedBox(3)}>
                    <Plus className="h-4 w-4" /> Box
                  </Button>
                  <Button variant="outline" onClick={() => changeSelectedFontSize(-1)}>
                    <Minus className="h-4 w-4" /> Text
                  </Button>
                  <Button variant="outline" onClick={() => changeSelectedFontSize(1)}>
                    <Plus className="h-4 w-4" /> Text
                  </Button>
                </div>

                <label className="block space-y-1 text-sm">
                  <span className="flex items-center gap-2 font-semibold">
                    <Type className="h-4 w-4" /> Font size
                  </span>
                  <input
                    className="w-full accent-[hsl(var(--primary))]"
                    type="range"
                    min="6"
                    max="32"
                    step="1"
                    value={numericStyle(selected, "fontSize", 10)}
                    onChange={(event) => updateSelectedStyle({ fontSize: Number(event.target.value) })}
                  />
                </label>

                <div className="space-y-2">
                  <Switch checked={boolStyle(selected, "highlight")} onCheckedChange={(highlight) => updateSelectedStyle({ highlight })} label="Highlight field" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                      <Palette className="h-3.5 w-3.5" /> Highlight
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {highlightSwatches.map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Highlight ${color}`}
                          className="h-7 w-7 rounded border shadow-sm"
                          style={{ backgroundColor: color }}
                          onClick={() => updateSelectedStyle({ highlight: true, backgroundColor: color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Text</div>
                    <div className="flex flex-wrap gap-2">
                      {textSwatches.map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Text ${color}`}
                          className="h-7 w-7 rounded border shadow-sm"
                          style={{ backgroundColor: color }}
                          onClick={() => updateSelectedStyle({ color })}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-semibold uppercase text-muted-foreground">Border</div>
                    <div className="flex flex-wrap gap-2">
                      {borderSwatches.map((color) => (
                        <button
                          key={color}
                          type="button"
                          aria-label={`Border ${color}`}
                          className="h-7 w-7 rounded border shadow-sm"
                          style={{ backgroundColor: color }}
                          onClick={() => updateSelectedStyle({ borderColor: color })}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => updateElement(selected.id, { rotate: (selected.rotate || 0) + 15 })}>
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => updateElement(selected.id, { locked: !selected.locked })}>
                    <Lock className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const duplicate = { ...selected, id: `${selected.id}-copy`, x: selected.x + 4, y: selected.y + 4 };
                      setTemplate((current) => ({ ...current, elements: [...current.elements, duplicate] }));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      resizeSelectedBox(4);
                      changeSelectedFontSize(1);
                    }}
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setTemplate((current) => ({ ...current, elements: current.elements.filter((item) => item.id !== selected.id) }))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-md border bg-muted/40 p-3 text-sm font-semibold text-muted-foreground">
                <Upload className="mb-2 h-4 w-4" />
                Select or import a field to edit its size and highlight.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader>
            <div>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>
                {template.width} x {template.height} {template.units} - {template.thermalMode ? "Thermal" : "Sheet"} - Snap {template.snapGrid}
                {template.units}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="muted">
                <Ruler className="mr-1 h-3 w-3" /> Rulers
              </Badge>
              <Badge variant="muted">
                <Grid3X3 className="mr-1 h-3 w-3" /> Grid
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border bg-muted/30 p-4 lg:p-6">
              {mode === "preview" ? (
                <div className="flex min-w-max justify-center">
                  <SlipRenderer slip={{ ...sampleSlips[0], template }} scale={1.8} />
                </div>
              ) : (
                <DndContext modifiers={[restrictToParentElement]} onDragEnd={onDragEnd}>
                  <div
                    className="relative mx-auto overflow-hidden bg-white shadow-panel"
                    style={{
                      width: mmToCssPx(template.width) * zoom,
                      height: mmToCssPx(template.height) * zoom,
                      backgroundImage:
                        "linear-gradient(rgba(15,118,110,.11) 1px, transparent 1px), linear-gradient(90deg, rgba(15,118,110,.11) 1px, transparent 1px)",
                      backgroundSize: `${mmToCssPx(template.snapGrid) * zoom}px ${mmToCssPx(template.snapGrid) * zoom}px`
                    }}
                  >
                    {referenceImage ? (
                      <img
                        src={referenceImage.src}
                        alt=""
                        className="absolute inset-0 h-full w-full object-fill"
                        style={{ opacity: referenceImage.opacity, mixBlendMode: "multiply" }}
                      />
                    ) : null}
                    {template.elements.map((element) => (
                      <DraggableElement
                        key={element.id}
                        element={element}
                        selected={element.id === selectedId}
                        onSelect={() => setSelectedId(element.id)}
                        onResizeStart={onResizeStart}
                        zoom={zoom}
                      />
                    ))}
                  </div>
                </DndContext>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
