import { useRef, useState } from "react";
import { Download, PenLine, Printer, Image as ImageIcon } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SlipRenderer } from "@/components/print/SlipRenderer";
import { PrintSheet } from "@/components/print/PrintSheet";
import { cn } from "@/lib/utils";
import type { GeneratedSlip, SlipTemplate } from "@/lib/types";

const slipCountOptions = [
  { value: "18", label: "18 slips - Small 3 x 6" },
  { value: "10", label: "10 slips - Medium 2 x 5" },
  { value: "12", label: "12 slips" },
  { value: "custom", label: "Custom" }
];

export function SlipPreviewArea({
  canCreateSlip,
  draftSlip,
  selectedTemplate,
  slipsPerPage,
  setSlipsPerPage,
  slipCountMode,
  setSlipCountMode,
  slipTypeDefinition,
  printSlips,
  notify
}: any) {
  const printRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1.65);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const print = useReactToPrint({
    content: () => printRef.current,
    documentTitle: draftSlip.serialNumber
  });

  return (
    <Card className="min-w-0">
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-start">
        <div>
          <CardTitle>Live Print Preview</CardTitle>
          <CardDescription>
            {selectedTemplate
              ? `${selectedTemplate.width} x ${selectedTemplate.height} ${selectedTemplate.units} - ${slipsPerPage} slips per A4`
              : "Select a template to preview the print layout."}
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedTemplate ? <Badge variant="muted">{selectedTemplate.thermalMode ? "Thermal" : "Sheet"}</Badge> : null}
          <Badge variant="muted">Cut guides</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-md border bg-muted/35 p-3 md:grid-cols-[1fr_auto]">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">No. of slips</span>
              <Select
                value={slipCountMode}
                onChange={(event) => {
                  const value = event.target.value;
                  setSlipCountMode(value);
                  if (value !== "custom") setSlipsPerPage(Number(value));
                }}
              >
                {slipCountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </label>
            {slipCountMode === "custom" ? (
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Custom no. of slips</span>
                <Input type="number" min={1} max={24} value={slipsPerPage} onChange={(event) => setSlipsPerPage(Number(event.target.value || 1))} placeholder="Enter slip count" />
              </label>
            ) : null}
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Preview Zoom</span>
              <Input type="number" min={0.8} max={2.2} step={0.05} value={previewScale} onChange={(event) => setPreviewScale(Number(event.target.value))} placeholder="1.65" />
            </label>
          </div>
          <div className="flex items-end gap-2">
            <Button className="flex-1 md:flex-none" onClick={print} disabled={!canCreateSlip}>
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              className="flex-1 md:flex-none"
              variant="outline"
              disabled={!canCreateSlip}
              onClick={() => {
                const serial = draftSlip.serialNumber;
                setExportNotice(`${serial} PDF export prepared`);
                notify({ tone: "success", title: "PDF export prepared", body: `${serial} is ready for PDF rendering.` });
              }}
            >
              <Download className="h-4 w-4" /> PDF
            </Button>
          </div>
        </div>

        <div className="overflow-auto rounded-md border bg-muted/40 p-3 sm:p-6">
          {canCreateSlip ? (
            <div className="flex min-w-max justify-center">
              <SlipRenderer slip={draftSlip} scale={previewScale} />
            </div>
          ) : (
            <div className="grid min-h-64 place-items-center text-center text-sm text-muted-foreground">
              Select a company, product, template, and quantity to preview the slip.
            </div>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border bg-muted/35 p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <PenLine className="h-4 w-4 text-primary" /> Slip Type Fields
            </div>
            <div className="flex flex-wrap gap-2">
              {slipTypeDefinition.visibleFields.map((field: string) => (
                <Badge key={field} variant="muted" className={cn(field === "signature" && "border-primary text-primary")}>
                  {field}
                </Badge>
              ))}
            </div>
          </div>
          <div className="rounded-md border bg-muted/35 p-3 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold">
              <ImageIcon className="h-4 w-4 text-primary" /> Page Batch
            </div>
            <div className="text-muted-foreground">
              A4 layout will render {canCreateSlip ? printSlips.length : 0} bordered slips with dashed cut guides.
            </div>
          </div>
        </div>

        {exportNotice ? <div className="rounded-md border bg-muted/40 p-3 text-sm font-semibold">{exportNotice}</div> : null}
        {canCreateSlip ? (
          <div className="hidden">
            <div ref={printRef}>
              <PrintSheet slips={printSlips} paper="a4" cutGuides />
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
