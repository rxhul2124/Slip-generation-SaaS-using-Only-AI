import { AlertTriangle, ArrowLeft, ArrowRight, ClipboardCopy, Package } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CanonicalSlip, NormalizationWarning } from "@/lib/csv/types";

interface DataPreviewProps {
  slips: CanonicalSlip[];
  warnings: NormalizationWarning[];
}

export function DataPreview({ slips, warnings }: DataPreviewProps) {
  const [index, setIndex] = useState(0);
  const slip = slips[index];
  const [copied, setCopied] = useState(false);

  if (!slip) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No slips to preview.
        </CardContent>
      </Card>
    );
  }

  const copyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(slip, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const slipWarnings = warnings.filter((w) =>
    slip.importMeta?.sourceRows.includes(w.rowIndex)
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Slip {index + 1} of {slips.length}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setIndex(Math.min(slips.length - 1, index + 1))} disabled={index >= slips.length - 1}>
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={copyJson}>
                <ClipboardCopy className="h-3.5 w-3.5" />
                {copied ? "Copied!" : "Copy JSON"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="max-h-[400px] overflow-auto rounded-lg border bg-muted/30 p-4 text-xs leading-relaxed">
            {JSON.stringify(slip, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {slipWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-500">
              <AlertTriangle className="h-4 w-4" />
              Warnings ({slipWarnings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {slipWarnings.map((w, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                {w.type === "unlinked_product" ? (
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                )}
                <div>
                  <span className="font-medium">{w.message}</span>
                  <Badge variant="muted" className="ml-2 text-xs">{w.type.replace(/_/g, " ")}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
