import type { CanonicalField, MappingPreset } from "./types";

const STORAGE_KEY = "slipora.csvMappingPresets";

/** Generate a fingerprint from CSV headers for auto-detection */
export function generateFingerprint(headers: string[]): string {
  return headers.map((h) => h.toLowerCase().trim()).sort().join("|");
}

function readStore(): MappingPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MappingPreset[]) : [];
  } catch {
    return [];
  }
}

function writeStore(presets: MappingPreset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

/** Save a new preset or update existing by fingerprint */
export function savePreset(
  preset: Omit<MappingPreset, "id" | "createdAt">
): MappingPreset {
  const presets = readStore();
  const existing = presets.find((p) => p.headerFingerprint === preset.headerFingerprint);

  if (existing) {
    existing.name = preset.name;
    existing.mapping = preset.mapping;
    existing.lastUsedAt = new Date().toISOString();
    writeStore(presets);
    return existing;
  }

  const newPreset: MappingPreset = {
    ...preset,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  presets.push(newPreset);
  writeStore(presets);
  return newPreset;
}

/** Load all saved presets */
export function loadPresets(): MappingPreset[] {
  return readStore();
}

/** Delete a preset by ID */
export function deletePreset(id: string): void {
  const presets = readStore().filter((p) => p.id !== id);
  writeStore(presets);
}

/** Find a matching preset by header fingerprint */
export function autoDetectPreset(headers: string[]): MappingPreset | null {
  const fingerprint = generateFingerprint(headers);
  const presets = readStore();
  return presets.find((p) => p.headerFingerprint === fingerprint) || null;
}

/** Update last-used timestamp */
export function touchPreset(id: string): void {
  const presets = readStore();
  const preset = presets.find((p) => p.id === id);
  if (preset) {
    preset.lastUsedAt = new Date().toISOString();
    writeStore(presets);
  }
}
