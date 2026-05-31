import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CornerDownLeft,
  SearchX,
  Sparkles,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  searchItems,
  findSuggestions,
  groupByCategory,
  categoryLabels,
  categoryOrder,
  type SearchResult,
  type SearchCategory,
} from "@/lib/searchEngine";
import type { SearchItem } from "@/lib/searchEngine";
import {
  pageItems,
  settingItems,
  buildCustomerItems,
  buildProductItems,
  buildTemplateItems,
} from "@/lib/searchIndex";
import type { Customer, SlipTemplate } from "@/lib/types";

// ── Hook: build all search items ──
function useSearchIndex(
  customers?: Customer[],
  templates?: SlipTemplate[]
) {
  return useMemo(() => {
    const items: SearchItem[] = [...pageItems, ...settingItems];

    if (customers?.length) {
      items.push(...buildCustomerItems(customers));
      items.push(...buildProductItems(customers));
    }

    if (templates?.length) {
      items.push(...buildTemplateItems(templates));
    }

    return items;
  }, [customers, templates]);
}

// ── Highlight matching text ──
function HighlightText({
  text,
  query,
}: {
  text: string;
  query: string;
}) {
  if (!query.trim()) return <>{text}</>;

  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-primary/20 px-0.5 text-foreground">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

// ── Category icon mapping ──
const categoryIcons: Partial<Record<SearchCategory, typeof Settings>> = {
  setting: Settings,
};

// ── Result item component ──
function ResultItem({
  result,
  query,
  isActive,
  onSelect,
  onMouseEnter,
}: {
  result: SearchResult;
  query: string;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}) {
  const Icon = result.icon;

  return (
    <button
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-150",
        isActive
          ? "bg-primary/10 text-foreground shadow-sm"
          : "text-foreground/80 hover:bg-muted/60"
      )}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      role="option"
      aria-selected={isActive}
    >
      {Icon && (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-colors",
            isActive
              ? "bg-primary/15 text-primary"
              : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">
          <HighlightText text={result.title} query={query} />
        </div>
        {result.subtitle && (
          <div className="truncate text-xs text-muted-foreground">
            <HighlightText text={result.subtitle} query={query} />
          </div>
        )}
      </div>
      <div
        className={cn(
          "flex shrink-0 items-center gap-1 text-xs transition-opacity",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
        )}
      >
        {result.matchType === "fuzzy" && (
          <Sparkles className="h-3 w-3 text-amber-500" />
        )}
        <CornerDownLeft className="h-3 w-3" />
      </div>
    </button>
  );
}

// ── Main SearchDropdown component ──
export interface SearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
  onQueryChange: (q: string) => void;
  customers?: Customer[];
  templates?: SlipTemplate[];
}

export function SearchDropdown({
  query,
  isOpen,
  onClose,
  onQueryChange,
  customers,
  templates,
}: SearchDropdownProps) {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const allItems = useSearchIndex(customers, templates);

  // Search results
  const results = useMemo(() => searchItems(query, allItems), [query, allItems]);

  // Group into "non-settings" and "settings"
  const grouped = useMemo(() => groupByCategory(results), [results]);

  // Flat list for keyboard navigation
  const flatResults = useMemo(() => {
    const flat: SearchResult[] = [];
    for (const category of categoryOrder) {
      const items = grouped.get(category);
      if (items) flat.push(...items);
    }
    return flat;
  }, [grouped]);

  // Did-you-mean suggestions (only when no results)
  const suggestions = useMemo(() => {
    if (results.length > 0 || !query.trim()) return [];
    return findSuggestions(query, allItems);
  }, [query, allItems, results.length]);

  // Reset active on results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Navigate to selected result
  const selectResult = useCallback(
    (result: SearchResult) => {
      navigate(result.path);
      onClose();
    },
    [navigate, onClose]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatResults[activeIndex]) {
            selectResult(flatResults[activeIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    },
    [isOpen, flatResults, activeIndex, selectResult, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        // Check if click is on the search input (parent controls that)
        const input = document.getElementById("global-search-input");
        if (input && input.contains(e.target as Node)) return;
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen) return;
    const el = dropdownRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, isOpen]);

  const hasResults = flatResults.length > 0;
  const hasQuery = query.trim().length > 0;

  // Separate settings from non-settings for display
  const nonSettingCategories = categoryOrder.filter((c) => c !== "setting");
  const settingsResults = grouped.get("setting");

  return (
    <AnimatePresence>
      {isOpen && hasQuery && (
        <motion.div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-2 w-full min-w-[380px] max-w-[560px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/15 ring-1 ring-black/5 dark:shadow-black/40 dark:ring-white/5"
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="listbox"
        >
          {hasResults ? (
            <div className="max-h-[420px] overflow-y-auto overscroll-contain py-2">
              {/* Non-settings results */}
              {nonSettingCategories.map((category) => {
                const items = grouped.get(category);
                if (!items) return null;
                return (
                  <div key={category} className="px-2">
                    <div className="flex items-center gap-2 px-3 pb-1 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                        {categoryLabels[category]}
                      </span>
                      <span className="text-[10px] text-muted-foreground/40">
                        {items.length}
                      </span>
                    </div>
                    {items.map((result) => {
                      const idx = flatResults.indexOf(result);
                      return (
                        <div key={result.id} data-index={idx}>
                          <ResultItem
                            result={result}
                            query={query}
                            isActive={idx === activeIndex}
                            onSelect={() => selectResult(result)}
                            onMouseEnter={() => setActiveIndex(idx)}
                          />
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Settings section — visually separated */}
              {settingsResults && settingsResults.length > 0 && (
                <div className="px-2">
                  <div className="mx-3 my-2 border-t border-border/50" />
                  <div className="flex items-center gap-2 px-3 pb-1 pt-1">
                    <Settings className="h-3 w-3 text-muted-foreground/60" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                      Settings
                    </span>
                    <span className="text-[10px] text-muted-foreground/40">
                      {settingsResults.length}
                    </span>
                  </div>
                  {settingsResults.map((result) => {
                    const idx = flatResults.indexOf(result);
                    return (
                      <div key={result.id} data-index={idx}>
                        <ResultItem
                          result={result}
                          query={query}
                          isActive={idx === activeIndex}
                          onSelect={() => selectResult(result)}
                          onMouseEnter={() => setActiveIndex(idx)}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* No results state */
            <div className="px-5 py-8 text-center">
              <SearchX className="mx-auto mb-3 h-10 w-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">
                No results for "{query}"
              </p>
              <p className="mt-1 text-xs text-muted-foreground/70">
                Try searching for companies, products, templates, or settings
              </p>

              {/* Did you mean? suggestions */}
              {suggestions.length > 0 && (
                <div className="mt-4 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground/60">
                    Did you mean?
                  </p>
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      className="group mx-auto flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-4 py-2 text-left transition-all hover:border-primary/30 hover:bg-primary/5"
                      onClick={() => {
                        onQueryChange(s.suggestion);
                      }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      <span className="text-sm font-medium text-primary">
                        {s.suggestion}
                      </span>
                      <ArrowRight className="ml-auto h-3 w-3 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border/40 bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border bg-background px-1 py-0.5 font-mono text-[9px]">esc</kbd>
                close
              </span>
            </div>
            {hasResults && (
              <span className="text-[10px] text-muted-foreground/50">
                {flatResults.length} result{flatResults.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
