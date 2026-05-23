import type { GeneratedSlip } from "@/lib/types";
import { calculatePrintLayout, mmToCssPx, paperSizes } from "@/lib/print/layoutEngine";
import { SlipRenderer } from "./SlipRenderer";

export function PrintSheet({
  slips,
  paper = "a4",
  cutGuides = true
}: {
  slips: GeneratedSlip[];
  paper?: keyof typeof paperSizes;
  cutGuides?: boolean;
}) {
  const template = slips[0]?.template;
  const layout =
    template &&
    calculatePrintLayout({
      page: paperSizes[paper],
      slip: { width: template.width, height: template.height, unit: template.units },
      margins: { top: 8, right: 8, bottom: 8, left: 8 },
      spacing: template.spacing || 3,
      count: slips.length,
      allowScaleDown: !["t-small-template", "t-medium-template"].includes(template._id)
    });

  if (!layout || !template) return null;

  return (
    <div className="print-root space-y-5">
      {Array.from({ length: layout.pages }).map((_, pageIndex) => (
        <div
          key={pageIndex}
          className="print-page relative mx-auto bg-white shadow-panel"
          style={{ width: mmToCssPx(layout.pageWidth), height: mmToCssPx(layout.pageHeight) }}
        >
          {layout.placements
            .filter((placement) => placement.pageIndex === pageIndex)
            .map((placement) => {
              const slip = slips[placement.index];
              return (
                <div
                  key={slip._id}
                  className="absolute print-placement"
                  style={{ left: mmToCssPx(placement.x), top: mmToCssPx(placement.y) }}
                >
                  {cutGuides ? <div className="pointer-events-none absolute -inset-1 border border-dashed border-black/35" /> : null}
                  <SlipRenderer slip={slip} scale={placement.scale} />
                </div>
              );
            })}
        </div>
      ))}
    </div>
  );
}
