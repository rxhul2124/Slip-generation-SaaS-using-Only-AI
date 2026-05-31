import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function usePagination(defaultLimit = 25) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Try to read limit from localStorage, fallback to defaultLimit
  const initialLimit = parseInt(localStorage.getItem("slipora.pageSize") || String(defaultLimit), 10);
  const urlLimit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : initialLimit;
  const urlPage = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;

  const [page, setPageState] = useState(urlPage);
  const [limit, setLimitState] = useState(urlLimit);

  // Sync to URL and localStorage when state changes
  useEffect(() => {
    const currentParams = new URLSearchParams(searchParams);
    let changed = false;

    if (currentParams.get("page") !== String(page)) {
      currentParams.set("page", String(page));
      changed = true;
    }
    if (currentParams.get("limit") !== String(limit)) {
      currentParams.set("limit", String(limit));
      localStorage.setItem("slipora.pageSize", String(limit));
      changed = true;
    }

    if (changed) {
      setSearchParams(currentParams, { replace: true });
    }
  }, [page, limit, searchParams, setSearchParams]);

  // Sync from URL to state if URL changes externally (e.g. back button)
  useEffect(() => {
    const p = searchParams.get("page");
    const l = searchParams.get("limit");
    
    if (p && parseInt(p, 10) !== page) {
      setPageState(parseInt(p, 10));
    }
    if (l && parseInt(l, 10) !== limit) {
      setLimitState(parseInt(l, 10));
    }
  }, [searchParams]);

  const setPage = (newPage: number) => {
    if (newPage > 0) setPageState(newPage);
  };

  const setLimit = (newLimit: number) => {
    if (newLimit > 0) {
      setLimitState(newLimit);
      setPageState(1); // Reset to page 1 when limit changes
    }
  };

  const reset = () => {
    setPageState(1);
  };

  return {
    page,
    limit,
    setPage,
    setLimit,
    reset
  };
}
