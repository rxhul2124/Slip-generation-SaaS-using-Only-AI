import Papa from "papaparse";
import type { ParsedCsv } from "./types";

/**
 * Parse a CSV file or string into structured data.
 * Handles: quoted commas, multiline text, UTF-8 BOM, \r\n vs \n
 */
export function parseCsv(input: File | string): Promise<ParsedCsv> {
  return new Promise((resolve) => {
    Papa.parse(input, {
      header: true,
      skipEmptyLines: "greedy",
      dynamicTyping: true,
      transformHeader: (header: string) => header.trim(),
      complete(results) {
        const headers = results.meta.fields || [];
        const rows = (results.data || []) as Record<string, unknown>[];
        const errors = (results.errors || []).map((e) => ({
          row: e.row,
          message: e.message,
        }));
        resolve({ headers, rows, errors });
      },
      error(err: Error) {
        resolve({ headers: [], rows: [], errors: [{ message: err.message }] });
      },
    });
  });
}

/**
 * Validate a file before parsing.
 */
export function validateCsvFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024;
  const allowedExtensions = [".csv", ".txt"];

  if (file.size > maxSize) {
    return { valid: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.` };
  }

  const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
  if (!allowedExtensions.includes(ext) && !file.type.includes("csv") && !file.type.includes("text")) {
    return { valid: false, error: "Invalid file type. Please upload a .csv file." };
  }

  return { valid: true };
}
