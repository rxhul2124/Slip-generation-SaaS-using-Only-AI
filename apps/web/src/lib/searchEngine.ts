import type { LucideIcon } from "lucide-react";

// ── Levenshtein distance for fuzzy matching ──
export function levenshtein(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;

  const matrix: number[][] = [];
  for (let i = 0; i <= la; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= lb; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[la][lb];
}

// ── Result types ──
export type SearchCategory = "company" | "product" | "template" | "page" | "setting";

export interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  category: SearchCategory;
  icon?: LucideIcon;
  path: string;
  keywords: string[];
}

export interface SearchResult extends SearchItem {
  score: number;
  matchType: "exact" | "prefix" | "contains" | "fuzzy";
}

export interface SuggestionResult {
  original: string;
  suggestion: string;
  item: SearchItem;
}

// ── Scoring ──
function scoreMatch(query: string, text: string): { score: number; matchType: SearchResult["matchType"] } | null {
  const q = query.toLowerCase();
  const t = text.toLowerCase();

  // Exact match
  if (t === q) return { score: 100, matchType: "exact" };

  // Starts with query
  if (t.startsWith(q)) return { score: 80 + (q.length / t.length) * 15, matchType: "prefix" };

  // Word boundary match (query appears at start of a word)
  const words = t.split(/[\s\-_/]+/);
  for (const word of words) {
    if (word.startsWith(q)) return { score: 70 + (q.length / word.length) * 10, matchType: "prefix" };
  }

  // Contains
  if (t.includes(q)) return { score: 50 + (q.length / t.length) * 20, matchType: "contains" };

  // Fuzzy match: only for short queries (avoid expensive computation)
  if (q.length >= 3 && q.length <= 20) {
    // Check against each word
    for (const word of words) {
      const distance = levenshtein(q, word);
      const maxLen = Math.max(q.length, word.length);
      const similarity = 1 - distance / maxLen;
      if (similarity >= 0.55) {
        return { score: 20 + similarity * 30, matchType: "fuzzy" };
      }
    }
    // Check against full text
    const distance = levenshtein(q, t);
    const maxLen = Math.max(q.length, t.length);
    const similarity = 1 - distance / maxLen;
    if (similarity >= 0.5) {
      return { score: 15 + similarity * 25, matchType: "fuzzy" };
    }
  }

  return null;
}

// ── Search items against query ──
export function searchItems(query: string, items: SearchItem[]): SearchResult[] {
  if (!query.trim()) return [];

  const q = query.trim();
  const results: SearchResult[] = [];

  for (const item of items) {
    let bestScore = 0;
    let bestMatchType: SearchResult["matchType"] = "fuzzy";

    // Match against title
    const titleMatch = scoreMatch(q, item.title);
    if (titleMatch && titleMatch.score > bestScore) {
      bestScore = titleMatch.score;
      bestMatchType = titleMatch.matchType;
    }

    // Match against subtitle
    if (item.subtitle) {
      const subtitleMatch = scoreMatch(q, item.subtitle);
      if (subtitleMatch && subtitleMatch.score * 0.9 > bestScore) {
        bestScore = subtitleMatch.score * 0.9;
        bestMatchType = subtitleMatch.matchType;
      }
    }

    // Match against keywords
    for (const keyword of item.keywords) {
      const kwMatch = scoreMatch(q, keyword);
      if (kwMatch && kwMatch.score * 0.85 > bestScore) {
        bestScore = kwMatch.score * 0.85;
        bestMatchType = kwMatch.matchType;
      }
    }

    if (bestScore > 15) {
      results.push({ ...item, score: bestScore, matchType: bestMatchType });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ── "Did you mean?" suggestions ──
export function findSuggestions(query: string, items: SearchItem[]): SuggestionResult[] {
  if (!query.trim() || query.trim().length < 3) return [];

  const q = query.trim().toLowerCase();
  const suggestions: SuggestionResult[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const candidates = [item.title, ...(item.subtitle ? [item.subtitle] : []), ...item.keywords];

    for (const candidate of candidates) {
      const cl = candidate.toLowerCase();
      if (cl === q || seen.has(cl)) continue;

      const distance = levenshtein(q, cl);
      const maxLen = Math.max(q.length, cl.length);
      const similarity = 1 - distance / maxLen;

      // Only suggest if close but not an exact match
      if (similarity >= 0.5 && similarity < 1 && distance <= 3) {
        seen.add(cl);
        suggestions.push({ original: query, suggestion: candidate, item });
        if (suggestions.length >= 3) return suggestions;
      }
    }
  }

  return suggestions;
}

// ── Category display config ──
export const categoryLabels: Record<SearchCategory, string> = {
  company: "Companies",
  product: "Products",
  template: "Templates",
  page: "Pages",
  setting: "Settings",
};

export const categoryOrder: SearchCategory[] = ["company", "product", "template", "page", "setting"];

export function groupByCategory(results: SearchResult[]): Map<SearchCategory, SearchResult[]> {
  const groups = new Map<SearchCategory, SearchResult[]>();

  for (const category of categoryOrder) {
    const items = results.filter((r) => r.category === category);
    if (items.length > 0) {
      groups.set(category, items);
    }
  }

  return groups;
}
