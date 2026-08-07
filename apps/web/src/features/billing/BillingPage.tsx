import { Check, CreditCard, Crown, Lock, ReceiptText, ShieldAlert, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      subscription_id?: string;
      amount?: number;
      currency?: string;
      name: string;
      description: string;
      handler: (response: any) => void;
      prefill?: { name?: string; email?: string };
      theme?: { color: string };
      modal?: { ondismiss?: () => void };
    }) => { open: () => void };
  }
}

interface LiveBillingData {
  plan: string;
  subscriptionStatus: string;
  paymentStatus: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: string;
  usage: {
    slipsThisMonth: number;
    templates: number;
    customers: number;
    teamMembers: number;
  };
  invoices: Array<{
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    plan: string;
  }>;
}

const planCards = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Essential tools for small volume packing slips",
    limits: { slips: 50, templates: 3, customers: 25, team: 1 },
    features: ["50 packing slips / mo", "3 custom templates", "25 customer records", "Standard browser printing"]
  },
  {
    id: "pro",
    name: "Professional",
    price: 999,
    period: "/month",
    popular: true,
    description: "High volume workflows, bulk generation & analytics",
    limits: { slips: 2000, templates: 25, customers: 500, team: 10 },
    features: [
      "2,000 packing slips / mo",
      "25 custom templates",
      "500 customer records",
      "CSV Bulk Slip Import",
      "Analytics Dashboard",
      "Cloud Backups"
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 4999,
    period: "/month",
    description: "Unlimited operations, custom SLA & audit logs",
    limits: { slips: "Unlimited", templates: "Unlimited", customers: "Unlimited", team: "Unlimited" },
    features: [
      "Unlimited packing slips",
      "Unlimited templates",
      "Unlimited customers",
      "Audit Log History",
      "Priority SLA Support",
      "Custom Integrations"
    ]
  }
];

export function BillingPage() {
  const notify = useNotificationStore((state) => state.push);
  const company = useAuthStore((state) => state.company);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);

  const [data, setData] = useState<LiveBillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isSetup = searchParams.get("setup") === "1";
  const next = searchParams.get("next") || "/app";

  const fetchBilling = async () => {
    try {
      setLoading(true);
      const res = await api.get<{ data: LiveBillingData }>("/billing");
      setData(res.data);
    } catch {
      notify({ tone: "error", title: "Billing Error", body: "Failed to load live billing metadata." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const activePlan = data?.plan || company?.plan || "free";

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleUpgrade = async (planKey: string) => {
    if (planKey === activePlan) return;
    if (planKey === "free") return;

    setUpgradingPlan(planKey);
    try {
      const res = await api.post<{
        data: {
          subscriptionId?: string;
          orderId?: string;
          keyId: string;
          amount: number;
          currency: string;
          type?: string;
          isMock?: boolean;
        };
      }>("/billing/create-subscription", { plan: planKey });
      
      const sub = res.data;

      if (sub.isMock) {
        notify({
          tone: "info",
          title: "Razorpay Keys Missing",
          body: "RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are not set in Render environment variables. Activated plan in Demo Mode."
        });
        if (company) {
          useAuthStore.setState((prev) => ({
            company: prev.company ? { ...prev.company, plan: planKey as any } : null
          }));
        }
        await fetchBilling();
        setUpgradingPlan(null);
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        notify({ tone: "error", title: "Checkout Error", body: "Failed to load Razorpay SDK. Please check your internet connection or adblocker." });
        setUpgradingPlan(null);
        return;
      }

      const options: any = {
        key: sub.keyId,
        name: "Slipora SaaS",
        description: `${planKey.toUpperCase()} Plan Subscription`,
        amount: sub.amount,
        currency: sub.currency || "INR",
        prefill: { name: user?.name, email: user?.email },
        theme: { color: "#0f766e" },
        handler: async function (response: any) {
          try {
            if (sub.orderId) {
              await api.post("/billing/razorpay/verify", {
                razorpayOrderId: response.razorpay_order_id || sub.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                plan: planKey
              });
            }
            await fetchBilling();
            if (company) {
              setSession({
                user: user!,
                company: { ...company, plan: planKey as any },
                accessToken: useAuthStore.getState().accessToken!
              });
            }
            notify({ tone: "success", title: "Payment Successful!", body: `Your workspace has been upgraded to ${planKey.toUpperCase()}.` });
          } catch {
            notify({ tone: "error", title: "Verification Failed", body: "Payment recorded but server verification failed. Please contact support." });
          } finally {
            setUpgradingPlan(null);
          }
        },
        modal: {
          ondismiss: () => setUpgradingPlan(null)
        }
      };

      if (sub.subscriptionId) {
        options.subscription_id = sub.subscriptionId;
      } else if (sub.orderId) {
        options.order_id = sub.orderId;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      notify({ tone: "error", title: "Checkout Failed", body: "Could not initiate Razorpay payment session." });
      setUpgradingPlan(null);
    }
  };

  const handleCancelSubscription = async () => {
    setCancelling(true);
    try {
      await api.post("/billing/cancel-subscription");
      await fetchBilling();
      notify({ tone: "info", title: "Subscription Cancelled", body: "Your subscription will revert to Free at the end of the period." });
    } catch {
      notify({ tone: "error", title: "Action Failed", body: "Could not cancel subscription." });
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Workspace Plan"
        title={isSetup ? "Subscription Setup" : "Billing & Subscription"}
        description="Manage your current plan, live usage limits, and provider invoices."
        actions={
          <Badge variant={data?.subscriptionStatus === "paused" ? "danger" : "warning"}>
            {loading ? "Syncing..." : `${activePlan.toUpperCase()} · ${data?.subscriptionStatus || "active"}`}
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        {/* Active Subscription Summary */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>{company?.name || "Workspace"} overview</CardDescription>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="text-3xl font-black capitalize text-foreground">{activePlan} Plan</div>
              <div className="mt-1 text-xs font-semibold text-muted-foreground">
                Status: <span className="capitalize text-foreground">{data?.subscriptionStatus || "active"}</span>
              </div>
            </div>

            {/* Live Usage Meters */}
            <div className="space-y-3 rounded-xl border bg-muted/40 p-4 text-xs">
              <div className="font-semibold text-foreground">Live Monthly Usage</div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between">
                    <span>Slips this month</span>
                    <span className="font-bold">{data?.usage?.slipsThisMonth || 0} / {activePlan === "pro" ? "2,000" : activePlan === "enterprise" ? "∞" : "50"}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Slip Templates</span>
                    <span className="font-bold">{data?.usage?.templates || 0} / {activePlan === "pro" ? "25" : activePlan === "enterprise" ? "∞" : "3"}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <span>Customers</span>
                    <span className="font-bold">{data?.usage?.customers || 0} / {activePlan === "pro" ? "500" : activePlan === "enterprise" ? "∞" : "25"}</span>
                  </div>
                </div>
              </div>
            </div>

            {data?.cancelAtPeriodEnd ? (
              <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Plan will revert to Free on period end.</span>
              </div>
            ) : activePlan !== "free" ? (
              <Button variant="outline" size="sm" className="w-full text-xs text-destructive hover:bg-destructive/10" disabled={cancelling} onClick={handleCancelSubscription}>
                {cancelling ? "Processing..." : "Cancel Subscription"}
              </Button>
            ) : null}

            {isSetup && (
              <Button className="w-full" onClick={() => navigate(next, { replace: true })}>
                Continue to Dashboard
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Plan Selection Cards */}
        <div className="grid gap-4 lg:grid-cols-3">
          {planCards.map((plan) => {
            const isActive = activePlan === plan.id;
            return (
              <Card key={plan.id} className={isActive ? "border-2 border-primary shadow-md" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {plan.id === "pro" && <Crown className="h-4 w-4 text-amber-500" />}
                      {plan.name}
                    </CardTitle>
                    {isActive ? <Check className="h-5 w-5 text-emerald-500" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-black">
                    {plan.price ? `₹${plan.price}` : "Free"}
                    <span className="text-xs font-normal text-muted-foreground">{plan.period}</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full gap-2 font-semibold"
                    variant={isActive ? "secondary" : "default"}
                    disabled={isActive || upgradingPlan === plan.id}
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    <Zap className="h-4 w-4 fill-current" />
                    {upgradingPlan === plan.id ? "Initializing..." : isActive ? "Active Plan" : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Real Invoice Receipts History */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Billing History & Receipts</CardTitle>
              <CardDescription>Official transaction records and payment status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {data?.invoices?.length ? (
            <div className="space-y-2">
              {data.invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between rounded-lg border bg-muted/20 p-3 text-xs">
                  <div>
                    <div className="font-bold">{inv.id}</div>
                    <div className="text-muted-foreground">{inv.date} · Plan: {inv.plan.toUpperCase()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{inv.amount}</div>
                    <Badge variant={inv.status === "paid" ? "success" : "warning"}>{inv.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-6 text-center text-xs font-semibold text-muted-foreground">
              No transactions recorded yet. Upgrade to Professional or Enterprise to view invoices.
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
