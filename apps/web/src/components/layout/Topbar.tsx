import { Bell, LogOut, Menu, Moon, Search, Sun, UserCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { useNotificationStore } from "@/stores/notificationStore";

export function Topbar() {
  const { company, user, logout } = useAuthStore();
  const { darkMode, toggleDarkMode, toggleSidebar } = useUiStore();
  const notify = useNotificationStore((state) => state.push);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="no-print sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/74 px-3 backdrop-blur-xl sm:px-5">
      <Button className="md:hidden" variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Open sidebar">
        <Menu className="h-4 w-4" />
      </Button>
      <form className="relative hidden min-w-[280px] max-w-[520px] flex-1 md:block" onSubmit={submitSearch}>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search companies, products, or slip numbers" />
      </form>
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
          onClick={async () => {
            await logout();
            notify({ tone: "success", title: "Signed out", body: "You are back at the main website." });
            navigate("/");
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 rounded-md border bg-card/70 px-3 py-2">
          <UserCircle className="h-5 w-5 text-primary" />
          <div className="hidden leading-tight sm:block">
            <div className="text-xs font-semibold">{user?.name}</div>
            <div className="text-[11px] text-muted-foreground">{company?.name}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
