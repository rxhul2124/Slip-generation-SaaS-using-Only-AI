import { Edit3, Crown, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn, initials } from "@/lib/utils";

const planConfig: Record<string, { label: string; variant: "default" | "success" | "warning" | "muted" | "danger"; icon: React.ReactNode }> = {
  free: { label: "Free", variant: "muted", icon: null },
  pro: { label: "Pro", variant: "default", icon: <Sparkles className="h-3 w-3" /> },
  enterprise: { label: "Enterprise", variant: "warning", icon: <Crown className="h-3 w-3" /> },
};

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function ProfileHeader({ loading, onEdit }: { loading?: boolean; onEdit?: () => void }) {
  const user = useAuthStore((state) => state.user);
  const company = useAuthStore((state) => state.company);
  const role = useAuthStore((state) => state.role);

  const plan = planConfig[company?.plan || "free"] || planConfig.free;
  const userInitials = user?.name ? initials(user.name) : "?";

  if (loading) {
    return (
      <Card className="bg-card/70 backdrop-blur">
        <CardContent className="flex flex-col items-center gap-4 p-6">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-14 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <Skeleton className="mt-2 h-10 w-28 rounded-md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="bg-card/70 backdrop-blur">
        <CardContent className="flex flex-col items-center gap-4 p-6 pt-6">
          {/* Avatar */}
          <div className="relative">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary via-primary/80 to-accent text-2xl font-bold text-primary-foreground ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                {userInitials}
              </div>
            )}
            {/* Online indicator */}
            <span className="absolute bottom-0.5 right-0.5 h-4 w-4 rounded-full border-2 border-background bg-emerald-500" />
          </div>

          {/* Name */}
          <div className="text-center">
            <h2 className="text-lg font-semibold leading-tight">{user?.name || "Unknown User"}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{user?.email || "—"}</p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant={plan.variant}>
              {plan.icon}
              {plan.label}
            </Badge>
            {role && (
              <Badge variant="muted" className="capitalize">
                {role}
              </Badge>
            )}
          </div>

          {/* Edit button */}
          {onEdit && (
            <Button variant="outline" size="sm" className="mt-1" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
