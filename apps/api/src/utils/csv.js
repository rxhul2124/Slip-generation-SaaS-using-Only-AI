import { parse } from "csv-parse/sync";

export function parseCsv(buffer) {
  return parse(buffer.toString("utf8"), {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}
