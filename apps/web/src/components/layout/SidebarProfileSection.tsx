import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

export function SidebarProfileSection({ collapsed }: { collapsed: boolean }) {
  const user = useAuthStore((state) => state.user);
  const company = useAuthStore((state) => state.company);

  const userInitials = user?.name ? initials(user.name) : "??";

  return (
    <div className="border-t px-3 py-3">
      {collapsed ? (
        <div className="flex flex-col items-center gap-2">
          <Link
            to="/profile"
            title={user?.name || "Profile"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-bold text-primary-foreground transition hover:shadow-md hover:shadow-primary/25"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              userInitials
            )}
          </Link>
          <Link
            to="/settings"
            title="Settings"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Link
            to="/profile"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/80 to-primary text-xs font-bold text-primary-foreground transition hover:shadow-md hover:shadow-primary/25"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-9 w-9 rounded-full object-cover" />
            ) : (
              userInitials
            )}
          </Link>
          <Link to="/profile" className="min-w-0 flex-1 group">
            <div className="truncate text-sm font-semibold transition group-hover:text-primary">
              {user?.name || "User"}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {company?.name || "Workspace"}
            </div>
          </Link>
          <Link
            to="/settings"
            title="Settings"
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition",
              "hover:bg-muted hover:text-foreground"
            )}
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
