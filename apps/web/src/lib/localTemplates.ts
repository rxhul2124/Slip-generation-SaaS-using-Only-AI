import type { SlipTemplate } from "./types";

const savedTemplatesKey = "slipora.savedTemplates";
const draftTemplateKey = "slipora.templateDraft";

function currentScopeId() {
  try {
    const raw = localStorage.getItem("slipora.auth");
    const parsed = raw ? JSON.parse(raw) : null;
    const state = parsed?.state || parsed;
    return state?.company?.id || state?.company?._id || state?.user?.id || state?.user?._id || "anonymous";
  } catch {
    return "anonymous";
  }
}

function scopedKey(key: string) {
  return `${key}:${currentScopeId()}`;
}

function isTemplate(value: unknown): value is SlipTemplate {
  const template = value as Partial<SlipTemplate> | null;
  return Boolean(template?._id && template?.name && Array.isArray(template?.elements));
}

export function readLocalTemplates() {
  const templates: SlipTemplate[] = [];

  try {
    const raw = localStorage.getItem(scopedKey(savedTemplatesKey));
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) {
      templates.push(...parsed.filter(isTemplate));
    }
  } catch {
    // Ignore broken local drafts.
  }

  try {
    const rawDraft = localStorage.getItem(scopedKey(draftTemplateKey));
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
  localStorage.setItem(scopedKey(savedTemplatesKey), JSON.stringify(next));
  localStorage.setItem(scopedKey(draftTemplateKey), JSON.stringify(template));
  window.dispatchEvent(new Event("slipora:templates-updated"));
  return next;
}

export function deleteLocalTemplate(id: string) {
  const saved = readLocalTemplates();
  const next = saved.filter((item) => item._id !== id);
  localStorage.setItem(scopedKey(savedTemplatesKey), JSON.stringify(next));
  
  // Clear draft if it's the one being deleted
  try {
    const rawDraft = localStorage.getItem(scopedKey(draftTemplateKey));
    const draft = rawDraft ? JSON.parse(rawDraft) : null;
    if (draft?._id === id) {
      localStorage.removeItem(scopedKey(draftTemplateKey));
    }
  } catch {}
  
  window.dispatchEvent(new Event("slipora:templates-updated"));
  return next;
}
