import { AlertCircle, CheckCircle2, Info, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotificationStore, type NotificationTone } from "@/stores/notificationStore";

const toneStyles: Record<NotificationTone, string> = {
  success: "border-emerald-500/25 bg-white text-slate-950 dark:border-emerald-400/30 dark:bg-[#14171f] dark:text-slate-50",
  warning: "border-amber-500/25 bg-white text-slate-950 dark:border-amber-400/30 dark:bg-[#14171f] dark:text-slate-50",
  error: "border-red-500/25 bg-white text-slate-950 dark:border-red-400/30 dark:bg-[#14171f] dark:text-slate-50",
  info: "border-slate-900/10 bg-white text-slate-950 dark:border-white/10 dark:bg-[#14171f] dark:text-slate-50"
};

const icons = {
  success: CheckCircle2,
  warning: AlertCircle,
  error: AlertCircle,
  info: Info
};

export function Toaster() {
  const { notifications, dismiss } = useNotificationStore();

  return (
    <div className="no-print fixed right-4 top-20 z-50 flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {notifications.map((notification) => {
        const Icon = icons[notification.tone] || Zap;
        return (
          <div key={notification.id} className={cn("rounded-lg border p-4 shadow-[0_18px_48px_rgba(15,23,42,0.14)] backdrop-blur-xl", toneStyles[notification.tone])}>
            <div className="flex gap-3">
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold">{notification.title}</div>
                {notification.body ? <div className="mt-1 text-sm opacity-80">{notification.body}</div> : null}
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => dismiss(notification.id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
