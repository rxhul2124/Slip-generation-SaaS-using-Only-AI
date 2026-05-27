import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { Select } from "./select";

export interface PaginationProps {
  page: number;
  pages: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

export function Pagination({ page, pages, limit, total, onPageChange, onLimitChange, className = "" }: PaginationProps) {
  // If there's no data and we're on page 1, don't show pagination
  if (total === 0 && page === 1) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  // Calculate visible page numbers
  const getVisiblePages = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);

    if (page <= 3) return [1, 2, 3, 4, '...', pages - 1, pages];
    if (page >= pages - 2) return [1, 2, '...', pages - 3, pages - 2, pages - 1, pages];

    return [1, '...', page - 1, page, page + 1, '...', pages];
  };

  return (
    <nav aria-label="Pagination" className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-muted-foreground w-full sm:w-auto text-center sm:text-left">
        <span>Showing {start > total ? 0 : start} to {end} of {total}</span>
        <div className="hidden sm:flex items-center gap-2 ml-4">
          <label htmlFor="limit-select">Rows per page:</label>
          <Select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 w-16 py-0 px-2"
            aria-label="Select rows per page"
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Go to previous page"
          aria-disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getVisiblePages().map((p, i) => (
          <React.Fragment key={i}>
            {p === '...' ? (
              <span className="px-2 w-8 text-center text-muted-foreground" aria-hidden="true">
                <MoreHorizontal className="h-4 w-4 inline-block" />
              </span>
            ) : (
              <Button
                variant={page === p ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 text-sm"
                onClick={() => typeof p === 'number' && onPageChange(p)}
                aria-label={`Go to page ${p}`}
                aria-current={page === p ? "page" : undefined}
              >
                {p}
              </Button>
            )}
          </React.Fragment>
        ))}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Go to next page"
          aria-disabled={page >= pages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
