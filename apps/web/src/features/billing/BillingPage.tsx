import { Check, CreditCard, Lock, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { resources } from "@/lib/api";
import type { BillingSubscription } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

const plans = [
  { id: "free", name: "Free", price: 0, label: "50 slips/month", features: ["1 user", "2 companies", "10 products", "2 custom templates", "Browser printing"] },
  { id: "pro", name: "Pro", price: 699, label: "for growing teams", features: ["5 users", "3 active devices", "Bulk CSV", "Presets", "Reports", "Backups", "Logo import"] },
  { id: "enterprise", name: "Enterprise", price: 0, label: "custom contract", features: ["Users by contract", "Audit logs", "SSO-ready controls", "Dedicated restore", "Priority support"] }
] as const;

type PlanId = (typeof plans)[number]["id"];

export function BillingPage() {
  const notify = useNotificationStore((state) => state.push);
  const company = useAuthStore((state) => state.company);
  const [billing, setBilling] = useState<BillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingPlan, setPendingPlan] = useState<PlanId | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSetup = searchParams.get("setup") === "1";
  const next = searchParams.get("next") || "/app";
  const activePlan = (billing?.plan || company?.plan || "free") as PlanId;
  const activePlanDetails = useMemo(() => plans.find((plan) => plan.id === activePlan) || plans[0], [activePlan]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    resources.billing
      .get()
      .then((response) => {
        if (mounted) setBilling(response.data.billing);
      })
      .catch(() => {
        if (mounted) setBilling(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const beginCheckout = (planId: PlanId) => {
    const plan = plans.find((item) => item.id === planId) || plans[0];
    if (planId === activePlan) {
      if (isSetup) navigate(next, { replace: true });
      return;
    }

    setPendingPlan(planId);
    notify({
      tone: "info",
      title: planId === "enterprise" ? "Sales handoff required" : "Checkout required",
      body:
        planId === "enterprise"
          ? "Enterprise plans are activated after the contract is attached to billing."
          : "Paid plans are activated only after the payment provider confirms the subscription."
    });
    window.setTimeout(() => setPendingPlan(null), 400);
  };

  return (
    <>
      <PageHeader
        eyebrow="Subscription"
        title={isSetup ? "Subscription setup" : "Billing"}
        description={
          isSetup
            ? "Continue with the active workspace plan or start a checkout request for a paid plan."
            : "Review the active subscription, billing status, usage, invoices, and upgrade options."
        }
        actions={
          <Badge variant={billing?.status === "past_due" ? "danger" : "warning"}>
            {loading ? "Loading billing" : `${activePlanDetails.name} ${billing?.status || "active"}`}
          </Badge>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Current Subscription</CardTitle>
              <CardDescription>{company?.name || "Workspace"} billing state.</CardDescription>
            </div>
            <CreditCard className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-3xl font-black">{activePlanDetails.name}</div>
              <div className="mt-1 text-sm font-semibold text-muted-foreground">
                {billing?.provider ? `${billing.provider.toUpperCase()} provider` : "Workspace plan"}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Status</div>
                <div className="mt-1 font-bold capitalize">{billing?.status || "active"}</div>
              </div>
              <div className="rounded-md border bg-muted/30 p-3">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Slips</div>
                <div className="mt-1 font-bold">{billing?.usage?.slipsThisMonth ?? 0}</div>
              </div>
            </div>
            {billing?.currentPeriodEndsAt ? (
              <div className="rounded-md border bg-muted/30 p-3 text-sm">
                <div className="text-xs font-semibold uppercase text-muted-foreground">Renews</div>
                <div className="mt-1 font-bold">{new Date(billing.currentPeriodEndsAt).toLocaleDateString()}</div>
              </div>
            ) : null}
            {isSetup ? (
              <Button className="w-full" onClick={() => navigate(next, { replace: true })}>
                Continue
              </Button>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const isActive = activePlan === plan.id;
            const paidPlan = plan.price > 0 || plan.id === "enterprise";
            return (
              <Card key={plan.name} className={isActive ? "border-primary" : undefined}>
                <CardHeader>
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.label}</CardDescription>
                  </div>
                  {isActive ? <Check className="h-5 w-5 text-emerald-600" /> : <Lock className="h-5 w-5 text-primary" />}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-black">{plan.price ? `${formatCurrency(plan.price)}/mo` : plan.name === "Enterprise" ? "Custom" : "Free"}</div>
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-600" /> {feature}
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    variant={isActive ? "default" : "outline"}
                    disabled={pendingPlan === plan.id}
                    onClick={() => beginCheckout(plan.id)}
                  >
                    {isActive ? (isSetup ? "Continue With Plan" : "Active Plan") : paidPlan ? "Start Checkout" : "Use Free Plan"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Provider invoices attached to the current subscription.</CardDescription>
          </div>
          <ReceiptText className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          {billing?.invoices?.length ? (
            <div className="space-y-2">
              {billing.invoices.map((invoice, index) => (
                <div key={invoice.providerInvoiceId || index} className="flex items-center justify-between rounded-md border bg-muted/20 p-3 text-sm">
                  <div>
                    <div className="font-bold">{invoice.providerInvoiceId || `Invoice ${index + 1}`}</div>
                    <div className="text-muted-foreground">{invoice.status || "pending"}</div>
                  </div>
                  <div className="font-bold">{invoice.amount ? `${invoice.currency || "INR"} ${invoice.amount}` : "-"}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border bg-muted/30 p-4 text-sm font-semibold text-muted-foreground">No provider invoices attached yet.</div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
