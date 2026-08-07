import { useState, type ReactNode } from "react";
import { Star, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { hasFeature, type Plan } from "@/lib/planLimits";
import { UpgradeModal } from "./UpgradeModal";

export function UpgradeBadge({ label = "Pro" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
      <Star className="h-3 w-3 fill-current" /> {label}
    </span>
  );
}

export function FeatureGate({
  feature,
  children,
  title,
  body,
  minimum = "Pro"
}: {
  feature: Parameters<typeof hasFeature>[1];
  children: ReactNode;
  title: string;
  body: string;
  minimum?: "Pro" | "Enterprise";
}) {
  const plan = useAuthStore((state) => state.company?.plan as Plan | undefined);
  const [modalOpen, setModalOpen] = useState(false);

  if (hasFeature(plan, feature)) return <>{children}</>;

  const targetPlan = minimum.toLowerCase() === "enterprise" ? "enterprise" : "pro";

  return (
    <>
      <Card className="border-2 border-dashed border-amber-500/30 bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {title} <UpgradeBadge label={minimum} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{body}</p>
          <div className="flex gap-2">
            <Button size="sm" className="gap-2 font-semibold" onClick={() => setModalOpen(true)}>
              <Zap className="h-4 w-4 fill-current" /> Upgrade to {minimum}
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link to="/billing">View Plans & Billing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <UpgradeModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Upgrade to ${minimum}`}
        description={body}
        targetPlan={targetPlan}
      />
    </>
  );
}
