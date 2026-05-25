import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { hasFeature, type Plan } from "@/lib/planLimits";

export function UpgradeBadge({ label = "Pro" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-1 text-xs font-black text-black">
      <Star className="h-3 w-3 fill-amber-400 text-amber-600" /> {label}
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
  if (hasFeature(plan, feature)) return <>{children}</>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title} <UpgradeBadge label={minimum} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{body}</p>
        <Button asChild>
          <Link to="/billing">View plans</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
