import { lazy, Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers, useProducts, useSlips, useTemplates } from "@/lib/useWarehouseData";
import { FeatureGate } from "@/components/billing/FeatureGate";
import { ComponentLoader } from "@/components/ui/ComponentLoader";

const AnalyticsCharts = lazy(() => import("./AnalyticsCharts").then((m) => ({ default: m.AnalyticsCharts })));

export function AnalyticsPage() {
  const products = useProducts();
  const customers = useCustomers();
  const templates = useTemplates();
  const slips = useSlips();
  const daily = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((label) => {
    const hour = Number(label.slice(0, 2));
    return {
      label,
      slips: slips.data?.data?.filter((slip) => new Date(slip.createdAt).getHours() === hour).length || 0
    };
  });
  const usage =
    products.data?.data?.map((product) => ({
      name: product.name,
      value: slips.data?.data?.filter((slip) => slip.product._id === product._id || slip.product.sku === product.sku).length || 0
    })) || [];
  const colors = ["#0f766e", "#f59e0b", "#64748b"];

  return (
    <FeatureGate feature="analytics" title="Reports" body="Reports and analytics are available on Pro and Enterprise plans." minimum="Pro">
    <>
      <PageHeader
        eyebrow="Reports"
        title="Reports"
        description="See daily slips, top products, busy companies, and peak print times."
        actions={<Badge variant="success">Ready</Badge>}
      />
      <Suspense fallback={<ComponentLoader className="min-h-[400px]" />}>
        <AnalyticsCharts daily={daily} usage={usage} colors={colors} />
      </Suspense>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Most Shipped Product</CardTitle>
            <CardDescription>{products.data?.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Busiest Customer</CardTitle>
            <CardDescription>{customers.data?.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Template</CardTitle>
            <CardDescription>{templates.data?.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
    </FeatureGate>
  );
}
