import { ArrowRight, Bookmark, Save } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { getConfidenceLevel } from "@/lib/csv/csvAnalyzer";
import { CANONICAL_FIELD_LABELS, type CanonicalField, type FieldMapping, type MappingPreset, type ParsedCsv } from "@/lib/csv/types";

interface FieldMapperProps {
  mappings: FieldMapping[];
  onMappingsChange: (mappings: FieldMapping[]) => void;
  parsedCsv: ParsedCsv;
  onSavePreset: (name: string) => void;
  existingPresets: MappingPreset[];
  onLoadPreset: (preset: MappingPreset) => void;
}

const confidenceColors: Record<string, string> = {
  high: "success",
  medium: "warning",
  low: "danger",
} as const;

const allFields = Object.entries(CANONICAL_FIELD_LABELS) as [CanonicalField, string][];

export function FieldMapper({
  mappings,
  onMappingsChange,
  parsedCsv,
  onSavePreset,
  existingPresets,
  onLoadPreset,
}: FieldMapperProps) {
  const [presetName, setPresetName] = useState("");

  const updateMapping = (index: number, field: CanonicalField) => {
    const updated = mappings.map((m, i) =>
      i === index ? { ...m, canonicalField: field, confidence: field === "ignore" ? 0 : Math.max(m.confidence, 100) } : m
    );
    onMappingsChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Column Mapping</CardTitle>
          <CardDescription>
            Map your CSV columns to slip fields. Auto-detected mappings are pre-selected.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mapping rows */}
        <div className="space-y-2">
          {mappings.map((mapping, index) => {
            const level = getConfidenceLevel(mapping.confidence);
            return (
              <div
                key={mapping.csvHeader}
                className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30"
              >
                {/* CSV column name */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{mapping.csvHeader}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {mapping.sampleValues
                      .slice(0, 3)
                      .map((v) => (v === null || v === undefined ? "—" : String(v)))
                      .join(", ")}
                  </p>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                {/* Canonical field dropdown */}
                <Select
                  value={mapping.canonicalField}
                  onChange={(e) => updateMapping(index, e.target.value as CanonicalField)}
                  className="w-44"
                >
                  {allFields.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>

                {/* Confidence badge */}
                <Badge variant={confidenceColors[level] as "success" | "warning" | "danger"} className="w-16 justify-center text-xs">
                  {mapping.confidence}%
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Preset controls */}
        <div className="flex items-end gap-2 border-t pt-4">
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Save as preset</label>
            <Input
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              placeholder="e.g. Amazon CSV, Shopify Export"
              className="h-9"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!presetName.trim()}
            onClick={() => {
              onSavePreset(presetName.trim());
              setPresetName("");
            }}
          >
            <Save className="h-3.5 w-3.5" /> Save
          </Button>
        </div>

        {existingPresets.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Load preset</p>
            <div className="flex flex-wrap gap-1.5">
              {existingPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLoadPreset(preset)}
                  className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <Bookmark className="h-3 w-3" /> {preset.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
