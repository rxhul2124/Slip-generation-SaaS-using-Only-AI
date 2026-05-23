export type Unit = "mm" | "cm" | "in" | "px";

export interface Size {
  width: number;
  height: number;
  unit?: Unit;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface LayoutRequest {
  page: Size;
  slip: Size;
  margins: Margins;
  spacing: number;
  count: number;
  allowScaleDown?: boolean;
  minScale?: number;
}

export interface SlipPlacement {
  pageIndex: number;
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
}

export interface PageLayout {
  pageWidth: number;
  pageHeight: number;
  columns: number;
  rows: number;
  scale: number;
  slipsPerPage: number;
  pages: number;
  placements: SlipPlacement[];
}

const unitToMm: Record<Unit, number> = {
  mm: 1,
  cm: 10,
  in: 25.4,
  px: 25.4 / 96
};

export const paperSizes = {
  a4: { width: 210, height: 297, unit: "mm" as Unit },
  letter: { width: 215.9, height: 279.4, unit: "mm" as Unit },
  "4x6": { width: 101.6, height: 152.4, unit: "mm" as Unit },
  "2x4": { width: 50.8, height: 101.6, unit: "mm" as Unit }
};

export function toMm(value: number, unit: Unit = "mm") {
  return value * unitToMm[unit];
}

function normalize(size: Size) {
  return {
    width: toMm(size.width, size.unit || "mm"),
    height: toMm(size.height, size.unit || "mm")
  };
}

export function calculatePrintLayout(request: LayoutRequest): PageLayout {
  const page = normalize(request.page);
  const slip = normalize(request.slip);
  const margins = request.margins;
  const printableWidth = Math.max(page.width - margins.left - margins.right, 1);
  const printableHeight = Math.max(page.height - margins.top - margins.bottom, 1);
  const minScale = request.minScale || 0.72;

  let best = { columns: 1, rows: 1, scale: 1, score: 0 };

  for (let columns = 1; columns <= 12; columns += 1) {
    for (let rows = 1; rows <= 20; rows += 1) {
      const cellWidth = (printableWidth - request.spacing * (columns - 1)) / columns;
      const cellHeight = (printableHeight - request.spacing * (rows - 1)) / rows;
      const scale = Math.min(cellWidth / slip.width, cellHeight / slip.height, 1);

      if ((!request.allowScaleDown && scale < 1) || scale < minScale) continue;

      const capacity = columns * rows;
      const usedArea = capacity * slip.width * slip.height * scale * scale;
      const requestedCountFit = capacity >= request.count ? 100_000 : 0;
      const wastePenalty = Math.abs(request.count - capacity) / Math.max(request.count, capacity, 1);
      const score = requestedCountFit + capacity * 1000 + usedArea - wastePenalty * 100;

      if (score > best.score) {
        best = { columns, rows, scale, score };
      }
    }
  }

  const slipWidth = slip.width * best.scale;
  const slipHeight = slip.height * best.scale;
  const slipsPerPage = best.columns * best.rows;
  const pages = Math.ceil(request.count / slipsPerPage);
  const gridWidth = best.columns * slipWidth + (best.columns - 1) * request.spacing;
  const gridHeight = best.rows * slipHeight + (best.rows - 1) * request.spacing;
  const startX = margins.left + Math.max((printableWidth - gridWidth) / 2, 0);
  const startY = margins.top + Math.max((printableHeight - gridHeight) / 2, 0);

  const placements: SlipPlacement[] = [];
  for (let index = 0; index < request.count; index += 1) {
    const pageIndex = Math.floor(index / slipsPerPage);
    const localIndex = index % slipsPerPage;
    const column = localIndex % best.columns;
    const row = Math.floor(localIndex / best.columns);
    placements.push({
      pageIndex,
      index,
      x: startX + column * (slipWidth + request.spacing),
      y: startY + row * (slipHeight + request.spacing),
      width: slipWidth,
      height: slipHeight,
      scale: best.scale
    });
  }

  return {
    pageWidth: page.width,
    pageHeight: page.height,
    columns: best.columns,
    rows: best.rows,
    scale: best.scale,
    slipsPerPage,
    pages,
    placements
  };
}

export function mmToCssPx(mm: number) {
  return (mm / 25.4) * 96;
}
