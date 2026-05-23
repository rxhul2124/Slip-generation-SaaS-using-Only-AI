import { describe, expect, it } from "vitest";
import { calculatePrintLayout, paperSizes } from "@/lib/print/layoutEngine";

describe("print layout engine", () => {
  it("paginates multiple 4x6 thermal slips on A4 without clipping", () => {
    const layout = calculatePrintLayout({
      page: paperSizes.a4,
      slip: paperSizes["4x6"],
      margins: { top: 8, right: 8, bottom: 8, left: 8 },
      spacing: 3,
      count: 6,
      allowScaleDown: true
    });

    expect(layout.slipsPerPage).toBeGreaterThanOrEqual(2);
    for (const placement of layout.placements) {
      expect(placement.x).toBeGreaterThanOrEqual(8);
      expect(placement.y).toBeGreaterThanOrEqual(8);
      expect(placement.x + placement.width).toBeLessThanOrEqual(layout.pageWidth - 8 + 0.001);
      expect(placement.y + placement.height).toBeLessThanOrEqual(layout.pageHeight - 8 + 0.001);
    }
  });

  it("fits compact industrial slips at 10 and 12 per A4 page", () => {
    for (const count of [10, 12]) {
      const layout = calculatePrintLayout({
        page: paperSizes.a4,
        slip: { width: 90, height: 52, unit: "mm" },
        margins: { top: 8, right: 8, bottom: 8, left: 8 },
        spacing: 4,
        count,
        allowScaleDown: true
      });

      expect(layout.slipsPerPage).toBeGreaterThanOrEqual(count);
      expect(layout.pages).toBe(1);
    }
  });
});
