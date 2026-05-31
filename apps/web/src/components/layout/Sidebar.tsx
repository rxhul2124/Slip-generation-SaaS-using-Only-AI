import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, PackageCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/uiStore";
import { navigation } from "./navigation";
import { SidebarProfileSection } from "./SidebarProfileSection";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "no-print fixed inset-y-0 left-0 z-30 flex border-r bg-card/86 backdrop-blur-xl transition-all duration-300",
        sidebarCollapsed ? "w-[74px] max-md:-translate-x-full" : "w-[272px] max-md:translate-x-0"
      )}
    >
      <div className="flex w-full flex-col">
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <Link to="/app" className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <PackageCheck className="h-5 w-5" />
            </span>
            {!sidebarCollapsed && (
              <span className="min-w-0">
                <span className="block truncate text-base font-black">Slipora</span>
                <span className="block truncate text-xs text-muted-foreground">Simple slip printing</span>
              </span>
            )}
          </Link>
          <Button className="ml-auto" variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4 relative">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors z-10",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  sidebarCollapsed && "justify-center px-0"
                )}
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute inset-0 -z-10 rounded-md bg-primary shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className="h-4 w-4 shrink-0 relative z-10" />
                {!sidebarCollapsed && <span className="truncate relative z-10">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        <SidebarProfileSection collapsed={sidebarCollapsed} />
      </div>
    </aside>
  );
}

