import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomers, useProducts, useSlips, useTemplates } from "@/lib/useWarehouseData";
import { FeatureGate } from "@/components/billing/FeatureGate";

export function AnalyticsPage() {
  const products = useProducts();
  const customers = useCustomers();
  const templates = useTemplates();
  const slips = useSlips();
  const daily = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((label) => {
    const hour = Number(label.slice(0, 2));
    return {
      label,
      slips: slips.data?.filter((slip) => new Date(slip.createdAt).getHours() === hour).length || 0
    };
  });
  const usage =
    products.data?.map((product) => ({
      name: product.name,
      value: slips.data?.filter((slip) => slip.product._id === product._id || slip.product.sku === product.sku).length || 0
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
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Peak Usage Times</CardTitle>
              <CardDescription>Slip generation activity by hour.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="slips" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Product Usage</CardTitle>
              <CardDescription>Share of slips by product.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={usage.filter((item) => item.value > 0)} dataKey="value" nameKey="name" outerRadius={108} label>
                    {usage.map((entry, index) => (
                      <Cell key={entry.name} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Most Shipped Product</CardTitle>
            <CardDescription>{products.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Busiest Customer</CardTitle>
            <CardDescription>{customers.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Template</CardTitle>
            <CardDescription>{templates.data?.[0]?.name}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
    </FeatureGate>
  );
}
