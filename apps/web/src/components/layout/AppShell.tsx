import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/uiStore";

export function AppShell() {
  const { sidebarCollapsed, darkMode, setSidebarCollapsed } = useUiStore();
  const location = useLocation();

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarCollapsed(true);
    }
  }, [setSidebarCollapsed]);

  return (
    <div className={cn("min-h-screen bg-background text-foreground", darkMode && "dark")}>
      <Sidebar />
      {!sidebarCollapsed ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="no-print fixed inset-0 z-20 bg-slate-950/35 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      ) : null}
      <div className={cn("min-h-screen transition-all duration-300", sidebarCollapsed ? "md:pl-[74px]" : "md:pl-[272px]")}>
        <Topbar />
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            className="mx-auto w-full max-w-[1680px] px-3 py-4 sm:px-5 sm:py-6"
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}
