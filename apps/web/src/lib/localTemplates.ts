import type { SlipTemplate } from "./types";

const savedTemplatesKey = "packslip.savedTemplates";
const draftTemplateKey = "packslip.templateDraft";

function isTemplate(value: unknown): value is SlipTemplate {
  const template = value as Partial<SlipTemplate> | null;
  return Boolean(template?._id && template?.name && Array.isArray(template?.elements));
}

export function readLocalTemplates() {
  const templates: SlipTemplate[] = [];

  try {
    const raw = localStorage.getItem(savedTemplatesKey);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      templates.push(...parsed.filter(isTemplate));
    }
  } catch {
    // Ignore broken local drafts.
  }

  try {
    const rawDraft = localStorage.getItem(draftTemplateKey);
    const draft = rawDraft ? JSON.parse(rawDraft) : null;
    if (isTemplate(draft) && !templates.some((template) => template._id === draft._id)) {
      templates.unshift(draft);
    }
  } catch {
    // Ignore broken local drafts.
  }

  return templates;
}

export function getLocalTemplate(id?: string | null) {
  if (!id) return undefined;
  return readLocalTemplates().find((template) => template._id === id);
}

export function saveLocalTemplate(template: SlipTemplate) {
  const saved = readLocalTemplates();
  const next = [template, ...saved.filter((item) => item._id !== template._id)];
  localStorage.setItem(savedTemplatesKey, JSON.stringify(next));
  localStorage.setItem(draftTemplateKey, JSON.stringify(template));
  window.dispatchEvent(new Event("packslip:templates-updated"));
  return next;
}
