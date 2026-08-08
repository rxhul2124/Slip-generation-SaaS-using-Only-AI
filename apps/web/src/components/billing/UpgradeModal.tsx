import { useState } from "react";
import { Check, Crown, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { api } from "@/lib/api";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  targetPlan?: "pro" | "enterprise";
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = "Upgrade Required",
  description = "Unlock higher limits, bulk workflows, advanced analytics, and custom branding.",
  targetPlan = "pro"
}: UpgradeModalProps) {
  const { company, setSession } = useAuthStore();
  const notify = useNotificationStore((state) => state.push);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpgradeClick = async (planKey: "pro" | "enterprise") => {
    setLoading(true);
    try {
      // 1. Request subscription order from API
      const res = await api.post<{ data: { subscriptionId: string; keyId: string; amount: number; isMock?: boolean } }>(
        "/billing/create-subscription",
        { plan: planKey }
      );

      const subData = res.data;

      // Check if Razorpay JS SDK is loaded on window
      if (typeof window !== "undefined" && (window as any).Razorpay && !subData.isMock) {
        const options = {
          key: subData.keyId,
          subscription_id: subData.subscriptionId,
          name: "Slipora SaaS",
          description: `${planKey.toUpperCase()} Plan Subscription`,
          handler: async function (_response: any) {
            // Refetch session / update auth store
            if (company) {
              setSession({
                user: useAuthStore.getState().user!,
                company: { ...company, plan: planKey },
                accessToken: useAuthStore.getState().accessToken!
              });
            }
            notify({ tone: "success", title: "Subscription Active", body: `Successfully upgraded to ${planKey.toUpperCase()}!` });
            setLoading(false);
            onClose();
          },
          prefill: {
            name: useAuthStore.getState().user?.name || "",
            email: useAuthStore.getState().user?.email || ""
          },
          theme: { color: "#1d4ed8" }
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Fallback for dev / mock
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (company) {
          useAuthStore.setState((prev) => ({
            company: prev.company ? { ...prev.company, plan: planKey } : null
          }));
        }
        notify({ tone: "success", title: "Plan Upgraded", body: `Successfully upgraded to ${planKey.toUpperCase()}!` });
        setLoading(false);
        onClose();
      }
    } catch {
      notify({ tone: "error", title: "Upgrade Error", body: "Could not initialize checkout. Please try again." });
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border bg-card p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-5 rounded-xl border bg-muted/40 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="warning">Recommended</Badge>
              <span className="font-semibold text-sm">Professional Plan</span>
            </div>
            <span className="text-lg font-extrabold text-primary">₹699<span className="text-xs font-normal text-muted-foreground">/mo</span></span>
          </div>

          <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
            <li className="flex items-center gap-2 text-foreground">
              <Check className="h-4 w-4 text-emerald-500" />
              <span><strong>2,000 packing slips</strong> per month</span>
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>Up to <strong>25 custom slip templates</strong></span>
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <Check className="h-4 w-4 text-emerald-500" />
              <span><strong>CSV Bulk Import & Batch Print Queue</strong></span>
            </li>
            <li className="flex items-center gap-2 text-foreground">
              <Check className="h-4 w-4 text-emerald-500" />
              <span><strong>Analytics Dashboard & Backup Export</strong></span>
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button
            size="default"
            className="w-full gap-2 font-semibold shadow-md"
            disabled={loading}
            onClick={() => handleUpgradeClick(targetPlan)}
          >
            <Zap className="h-4 w-4 fill-current" />
            {loading ? "Processing..." : `Upgrade to ${targetPlan === "enterprise" ? "Enterprise (₹4,999/mo)" : "Professional (₹699/mo)"}`}
          </Button>

          <Button variant="ghost" size="sm" onClick={onClose} className="w-full text-muted-foreground">
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  );
}
