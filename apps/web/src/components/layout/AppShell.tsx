import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/stores/uiStore";

export function AppShell() {
  const { sidebarCollapsed, darkMode, setSidebarCollapsed } = useUiStore();

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
        <motion.main
          className="mx-auto w-full max-w-[1680px] px-3 py-4 sm:px-5 sm:py-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
