export const paperSizes = {
  a4: { width: 210, height: 297, unit: "mm" },
  letter: { width: 215.9, height: 279.4, unit: "mm" },
  "4x6": { width: 101.6, height: 152.4, unit: "mm" },
  "2x4": { width: 50.8, height: 101.6, unit: "mm" }
};

const unitToMm = { mm: 1, cm: 10, in: 25.4, px: 25.4 / 96 };

export function toMm(value, unit = "mm") {
  return value * unitToMm[unit];
}

export function calculatePrintLayout({ page, slip, margins, spacing, count, allowScaleDown = true, minScale = 0.72 }) {
  const pageWidth = toMm(page.width, page.unit);
  const pageHeight = toMm(page.height, page.unit);
  const slipWidthRaw = toMm(slip.width, slip.unit);
  const slipHeightRaw = toMm(slip.height, slip.unit);
  const printableWidth = pageWidth - margins.left - margins.right;
  const printableHeight = pageHeight - margins.top - margins.bottom;
  let best = { columns: 1, rows: 1, scale: 1, score: 0 };

  for (let columns = 1; columns <= 12; columns += 1) {
    for (let rows = 1; rows <= 20; rows += 1) {
      const cellWidth = (printableWidth - spacing * (columns - 1)) / columns;
      const cellHeight = (printableHeight - spacing * (rows - 1)) / rows;
      const scale = Math.min(cellWidth / slipWidthRaw, cellHeight / slipHeightRaw, 1);
      if ((!allowScaleDown && scale < 1) || scale < minScale) continue;
      const capacity = columns * rows;
      const score = capacity * 1000 + scale * 100;
      if (score > best.score) best = { columns, rows, scale, score };
    }
  }

  const slipWidth = slipWidthRaw * best.scale;
  const slipHeight = slipHeightRaw * best.scale;
  const slipsPerPage = best.columns * best.rows;
  const pages = Math.ceil(count / slipsPerPage);
  const placements = [];

  for (let index = 0; index < count; index += 1) {
    const pageIndex = Math.floor(index / slipsPerPage);
    const localIndex = index % slipsPerPage;
    placements.push({
      pageIndex,
      index,
      x: margins.left + (localIndex % best.columns) * (slipWidth + spacing),
      y: margins.top + Math.floor(localIndex / best.columns) * (slipHeight + spacing),
      width: slipWidth,
      height: slipHeight,
      scale: best.scale
    });
  }

  return { pageWidth, pageHeight, slipsPerPage, pages, placements, ...best };
}
