import { useCallback, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft, ArrowRight, CheckCircle2, FileSpreadsheet,
  Layers, Printer, RotateCcw, Upload, Wand2, LayoutTemplate
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { FeatureGate, UpgradeBadge } from "@/components/billing/FeatureGate";
import { useNotificationStore } from "@/stores/notificationStore";
import { useCustomers, useProducts, useTemplates } from "@/lib/useWarehouseData";
import { DynamicSlipRenderer } from "@/components/print/DynamicSlipRenderer";
import { SlipRenderer } from "@/components/print/SlipRenderer";
import { adaptCanonicalToGenerated } from "@/lib/csv/adapter";

import type {
  FieldMapping, GroupingStrategy, NormalizationResult, ParsedCsv, CanonicalField, MappingPreset
} from "@/lib/csv/types";
import { parseCsv } from "@/lib/csv/csvParser";
import { analyzeColumns } from "@/lib/csv/csvAnalyzer";
import { normalizeRows } from "@/lib/csv/normalizer";
import { groupSlips } from "@/lib/csv/grouping";
import {
  savePreset, loadPresets, autoDetectPreset, touchPreset, deletePreset, generateFingerprint
} from "@/lib/csv/mappingPresets";

import { UploadZone } from "./UploadZone";
import { FieldMapper } from "./FieldMapper";
import { DataPreview } from "./DataPreview";
import { CsvHealthReport as CsvHealthReportPanel } from "./CsvHealthReport";

/* ------------------------------------------------------------------ */
/*  Step indicator                                                     */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: 1, label: "Upload", icon: Upload },
  { id: 2, label: "Map", icon: Wand2 },
  { id: 3, label: "Review", icon: FileSpreadsheet },
  { id: 4, label: "Generate", icon: Printer },
] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-6 flex items-center justify-center gap-1">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`
                flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300
                ${active ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : ""}
                ${done ? "bg-emerald-500/10 text-emerald-600" : ""}
                ${!active && !done ? "text-muted-foreground" : ""}
              `}
            >
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-1 h-px w-6 ${done ? "bg-emerald-400" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export function BulkGenerationPage() {
  const notify = useNotificationStore((s) => s.push);
  const products = useProducts();
  const customers = useCustomers();
  const printRef = useRef<HTMLDivElement>(null);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);
  const [groupingStrategy, setGroupingStrategy] = useState<GroupingStrategy>("none");
  const [normResult, setNormResult] = useState<NormalizationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [presets, setPresets] = useState<MappingPreset[]>(() => loadPresets());
  const [previewIndex, setPreviewIndex] = useState(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("dynamic");
  const [pageBreak, setPageBreak] = useState(true);

  const print = useReactToPrint({ content: () => printRef.current, documentTitle: "slipora-csv-slips" });

  /* ── Step 1 → 2: Upload + Parse + Analyze ── */
  const handleFileAccepted = useCallback(
    async (file: File) => {
      setIsProcessing(true);
      try {
        const parsed = await parseCsv(file);

        if (parsed.rows.length === 0) {
          notify({ tone: "error", title: "Empty CSV", body: "The file contains no data rows." });
          setIsProcessing(false);
          return;
        }

        // Auto-detect preset
        const detected = autoDetectPreset(parsed.headers);
        let fieldMappings: FieldMapping[];

        if (detected) {
          // Apply preset mappings
          fieldMappings = parsed.headers.map((header) => ({
            csvHeader: header,
            canonicalField: detected.mapping[header] || ("ignore" as CanonicalField),
            confidence: detected.mapping[header] ? 100 : 0,
            sampleValues: parsed.rows.slice(0, 5).map((r) => r[header]),
          }));
          touchPreset(detected.id);
          notify({ tone: "info", title: "Preset detected", body: `Applied "${detected.name}" mapping preset.` });
        } else {
          fieldMappings = analyzeColumns(parsed.headers, parsed.rows);
        }

        setParsedCsv(parsed);
        setMappings(fieldMappings);
        setStep(2);
        notify({
          tone: "success",
          title: "CSV analyzed",
          body: `${parsed.rows.length} rows, ${parsed.headers.length} columns detected.`,
        });
      } catch {
        notify({ tone: "error", title: "Parse error", body: "Failed to parse the CSV file." });
      } finally {
        setIsProcessing(false);
      }
    },
    [notify]
  );

  /* ── Step 2 → 3: Normalize + Group ── */
  const handleAnalyze = useCallback(() => {
    if (!parsedCsv) return;

    const result = normalizeRows(parsedCsv.rows, mappings, {
      products: products.data?.data,
      customers: customers.data?.data,
      originalHeaders: parsedCsv.headers,
    });

    // Apply grouping
    const grouped = groupSlips(result.slips, groupingStrategy);
    result.slips = grouped;
    result.health.groupsFormed = grouped.length;

    setNormResult(result);
    setPreviewIndex(0);
    setStep(3);
    notify({
      tone: "success",
      title: "Normalization complete",
      body: `${grouped.length} slips generated from ${parsedCsv.rows.length} rows.`,
    });
  }, [parsedCsv, mappings, groupingStrategy, products.data, customers.data, notify]);

  /* ── Preset save ── */
  const handleSavePreset = useCallback(
    (name: string) => {
      if (!parsedCsv) return;
      const mapping: Record<string, CanonicalField> = {};
      for (const m of mappings) {
        mapping[m.csvHeader] = m.canonicalField;
      }
      savePreset({
        name,
        mapping,
        headerFingerprint: generateFingerprint(parsedCsv.headers),
      });
      setPresets(loadPresets());
      notify({ tone: "success", title: "Preset saved", body: `"${name}" can be reused for similar CSVs.` });
    },
    [parsedCsv, mappings, notify]
  );

  /* ── Preset load ── */
  const handleLoadPreset = useCallback(
    (preset: MappingPreset) => {
      if (!parsedCsv) return;
      const updated = mappings.map((m) => ({
        ...m,
        canonicalField: preset.mapping[m.csvHeader] || ("ignore" as CanonicalField),
        confidence: preset.mapping[m.csvHeader] ? 100 : 0,
      }));
      setMappings(updated);
      touchPreset(preset.id);
      notify({ tone: "info", title: "Preset loaded", body: `Applied "${preset.name}".` });
    },
    [parsedCsv, mappings, notify]
  );

  /* ── Reset ── */
  const reset = () => {
    setStep(1);
    setParsedCsv(null);
    setMappings([]);
    setGroupingStrategy("none");
    setNormResult(null);
    setPreviewIndex(0);
  };

  const slips = normResult?.slips || [];
  const currentSlip = slips[previewIndex];
  const templates = useTemplates();
  const selectedTemplate = templates.data?.data.find((t) => t._id === selectedTemplateId);

  return (
    <FeatureGate
      feature="bulk"
      title="Smart CSV Import"
      body="AI-powered CSV import is available on Pro and Enterprise plans."
      minimum="Pro"
    >
      <>
        <PageHeader
          eyebrow="Bulk Import"
          title="Smart CSV Import"
          description="Upload any CSV — fields are auto-detected and mapped to professional slips."
          actions={
            <>
              <UpgradeBadge label="Pro" />
              {step > 1 && (
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="h-4 w-4" /> Start Over
                </Button>
              )}
              {step === 4 && slips.length > 0 && (
                <Button onClick={print}>
                  <Printer className="h-4 w-4" /> Print All ({slips.length})
                </Button>
              )}
            </>
          }
        />

        <StepIndicator current={step} />

        <AnimatePresence mode="wait">
          {/* ═══════════════ STEP 1: Upload ═══════════════ */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <UploadZone onFileAccepted={handleFileAccepted} isProcessing={isProcessing} />
            </motion.div>
          )}

          {/* ═══════════════ STEP 2: Map Columns ═══════════════ */}
          {step === 2 && parsedCsv && (
            <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
                <div className="space-y-4">
                  <FieldMapper
                    mappings={mappings}
                    onMappingsChange={setMappings}
                    parsedCsv={parsedCsv}
                    onSavePreset={handleSavePreset}
                    existingPresets={presets}
                    onLoadPreset={handleLoadPreset}
                  />
                </div>

                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-base">Slip Template</CardTitle>
                        <CardDescription>Select a layout for generated slips</CardDescription>
                      </div>
                      <LayoutTemplate className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={selectedTemplateId}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                      >
                        <option value="dynamic">Dynamic Table (Auto-expanding)</option>
                        {templates.data?.data.map((t) => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Grouping selector */}
                  <Card>
                    <CardHeader>
                      <div>
                        <CardTitle className="text-base">Grouping Strategy</CardTitle>
                        <CardDescription>How to merge rows into orders</CardDescription>
                      </div>
                      <Layers className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent>
                      <Select
                        value={groupingStrategy}
                        onChange={(e) => setGroupingStrategy(e.target.value as GroupingStrategy)}
                        disabled={selectedTemplateId !== "dynamic"}
                      >
                        <option value="none">No grouping (1 row = 1 slip)</option>
                        <option value="order_number">Group by Order Number</option>
                        <option value="invoice_number">Group by Invoice Number</option>
                        <option value="shipment_id">Group by Shipment ID</option>
                        <option value="tracking_id">Group by Tracking ID</option>
                      </Select>
                      {selectedTemplateId !== "dynamic" && (
                        <p className="mt-2 text-xs text-amber-500">
                          Visual templates only support 1 item per slip. Grouping is disabled.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Data summary */}
                  <Card>
                    <CardContent className="pt-5">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total rows</span>
                          <span className="font-semibold">{parsedCsv.rows.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Columns</span>
                          <span className="font-semibold">{parsedCsv.headers.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mapped fields</span>
                          <span className="font-semibold">
                            {mappings.filter((m) => m.canonicalField !== "ignore").length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button className="flex-1" onClick={handleAnalyze}>
                      <Wand2 className="h-4 w-4" /> Analyze & Normalize
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ STEP 3: Review ═══════════════ */}
          {step === 3 && normResult && (
            <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <div className="space-y-4">
                <CsvHealthReportPanel report={normResult.health} />

                <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                  <DataPreview slips={slips} warnings={normResult.warnings} />

                  {/* Live preview */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Slip Preview</CardTitle>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPreviewIndex(Math.max(0, previewIndex - 1))}
                            disabled={previewIndex === 0}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Badge variant="muted">{previewIndex + 1} / {slips.length}</Badge>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPreviewIndex(Math.min(slips.length - 1, previewIndex + 1))}
                            disabled={previewIndex >= slips.length - 1}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-center overflow-auto rounded-lg border bg-muted/20 p-4">
                        {currentSlip && (
                          selectedTemplate ? (
                            <SlipRenderer slip={adaptCanonicalToGenerated(currentSlip, selectedTemplate)} scale={0.45} />
                          ) : (
                            <DynamicSlipRenderer slip={currentSlip} scale={0.45} />
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ArrowLeft className="h-4 w-4" /> Back to Mapping
                  </Button>
                  <Button onClick={() => { setStep(4); notify({ tone: "success", title: "Slips generated!", body: `${slips.length} professional slips ready for printing.` }); }}>
                    <Printer className="h-4 w-4" /> Generate {slips.length} Slips
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ STEP 4: Generate ═══════════════ */}
          {step === 4 && normResult && (
            <motion.div key="step4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <div>
                    <CardTitle>Generated Slips</CardTitle>
                    <CardDescription>{slips.length} slips ready for print or export</CardDescription>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch checked={pageBreak} onCheckedChange={setPageBreak} />
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        One slip per page
                      </label>
                    </div>
                    <Badge variant="success">{slips.length} ready</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Print-ready hidden container */}
                  <div className="hidden">
                    <div ref={printRef} className={pageBreak ? "" : "flex flex-wrap gap-4 p-4"}>
                      {slips.map((slip, i) => (
                        <div key={i} className={pageBreak ? "break-after-page" : "break-inside-avoid"}>
                          {selectedTemplate ? (
                            <SlipRenderer slip={adaptCanonicalToGenerated(slip, selectedTemplate)} scale={1} />
                          ) : (
                            <DynamicSlipRenderer slip={slip} scale={1} pageIndex={i} totalPages={slips.length} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual grid */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {slips.map((slip, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(i * 0.04, 0.5) }}
                        className="overflow-hidden rounded-lg border shadow-sm"
                      >
                        <div className="flex justify-center bg-muted/20 p-3">
                          {selectedTemplate ? (
                            <SlipRenderer slip={adaptCanonicalToGenerated(slip, selectedTemplate)} scale={0.28} />
                          ) : (
                            <DynamicSlipRenderer slip={slip} scale={0.28} />
                          )}
                        </div>
                        <div className="border-t bg-card px-3 py-2">
                          <p className="truncate text-sm font-semibold">#{slip.orderNumber}</p>
                          <p className="truncate text-xs text-muted-foreground">{slip.customerName} · {slip.lineItems.length} items</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    </FeatureGate>
  );
}
