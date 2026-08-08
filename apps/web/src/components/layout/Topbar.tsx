import { Bell, LogOut, Menu, Moon, Search, Sun, UserCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { useCustomers, useTemplates } from "@/lib/useWarehouseData";
import { SearchDropdown } from "./SearchDropdown";

export function Topbar() {
  const { company, user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, toggleSidebar } = useUiStore();
  const notify = useNotificationStore((state) => state.push);
  const { data: customerData } = useCustomers();
  const { data: templateData } = useTemplates();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const handleFocus = useCallback(() => {
    if (query.trim()) {
      setSearchOpen(true);
    }
  }, [query]);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        if (query.trim()) setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [query]);

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/74 px-3 backdrop-blur-xl sm:px-5">
      <Button className="md:hidden" variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open sidebar">
        <Menu className="h-4 w-4" />
      </Button>

      {/* Search with dropdown */}
      <div className="relative hidden min-w-[280px] max-w-[520px] flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="global-search-input"
          ref={inputRef}
          className="pl-9 pr-16"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={handleFocus}
          placeholder="Search everything…"
          autoComplete="off"
          aria-haspopup="listbox"
          aria-expanded={searchOpen}
        />
        {/* Keyboard shortcut hint */}
        <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-0.5 rounded border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 sm:inline-flex">
          ⌘K
        </kbd>

        <SearchDropdown
          query={query}
          isOpen={searchOpen}
          onClose={handleClose}
          onQueryChange={handleQueryChange}
          customers={customerData?.data}
          templates={templateData?.data}
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Badge variant="warning">{company?.plan || "pro"}</Badge>
        <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label="Toggle dark mode">
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          onClick={() => notify({ tone: "info", title: "Notifications", body: "Print, export, billing, and workflow alerts appear here." })}
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Logout"
          loading={isLoggingOut}
          onClick={async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              notify({ tone: "success", title: "Signed out", body: "You are back at the main website." });
              navigate("/");
            } finally {
              setIsLoggingOut(false);
            }
          }}
        >
          {!isLoggingOut && <LogOut className="h-4 w-4" />}
        </Button>
        <Link to="/profile" className="flex items-center gap-2 rounded-md border bg-card/70 px-3 py-2 transition hover:bg-muted/60 hover:shadow-sm">
          <UserCircle className="h-5 w-5 text-primary" />
          <div className="hidden leading-tight sm:block">
            <div className="text-xs font-semibold">{user?.name}</div>
            <div className="text-[11px] text-muted-foreground">{company?.name}</div>
          </div>
        </Link>
      </div>
    </header>
  );
}
