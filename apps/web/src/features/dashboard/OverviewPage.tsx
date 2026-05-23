import { Activity, Boxes, FileDown, Printer, Star, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Td, Th, Table } from "@/components/ui/table";
import { formatNumber } from "@/lib/utils";
import { useCustomers, useProducts, useSlips, useTemplates } from "@/lib/useWarehouseData";

function MetricCard({
  label,
  value,
  icon: Icon,
  detail
}: {
  label: string;
  value: string;
  icon: typeof Printer;
  detail: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-2xl font-black">{value}</CardTitle>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
          {detail}
        </div>
      </CardContent>
    </Card>
  );
}

export function OverviewPage() {
  const products = useProducts();
  const customers = useCustomers();
  const templates = useTemplates();
  const slips = useSlips();
  const totalPrints = slips.data?.reduce((sum, slip) => sum + slip.printedCount, 0) || 0;
  const totalExports = slips.data?.reduce((sum, slip) => sum + slip.exportedCount, 0) || 0;

  return (
    <>
      <PageHeader
        eyebrow="Home"
        title="Packing Slip Home"
        description="See today's slips, prints, companies, and top products in one place."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/bulk">Import CSV</Link>
            </Button>
            <Button asChild>
              <Link to="/generate">Create Slip</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total slips generated" value={formatNumber(slips.data?.length || 0)} icon={Boxes} detail="18% above last week" />
        <MetricCard label="Total prints" value={formatNumber(totalPrints)} icon={Printer} detail="All print jobs completed" />
        <MetricCard label="Total exports" value={formatNumber(totalExports)} icon={FileDown} detail="Bulk PDF queue healthy" />
        <MetricCard label="Active printers" value="4" icon={Activity} detail="2 thermal, 2 office printers" />
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Most Used</CardTitle>
            <CardDescription>Quick signals for packing and dispatch planning.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Star className="h-4 w-4 text-accent" /> Product
            </span>
            <span className="text-sm text-muted-foreground">{products.data?.[0]?.name}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-semibold">Customer</span>
            <span className="text-sm text-muted-foreground">{customers.data?.[0]?.name}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-3">
            <span className="text-sm font-semibold">Template</span>
            <span className="text-sm text-muted-foreground">{templates.data?.[0]?.name}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div>
            <CardTitle>Recent Slip History</CardTitle>
            <CardDescription>Latest generated slips, print counts, exports, and dispatch status.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr>
                  <Th>Serial</Th>
                  <Th>Product</Th>
                  <Th>Customer</Th>
                  <Th>Status</Th>
                  <Th>Prints</Th>
                </tr>
              </thead>
              <tbody>
                {slips.data?.map((slip) => (
                  <tr key={slip._id}>
                    <Td className="font-mono font-semibold">{slip.serialNumber}</Td>
                    <Td>{slip.product.name}</Td>
                    <Td>{slip.customer.name}</Td>
                    <Td>
                      <Badge variant={slip.status === "printed" ? "success" : "default"}>{slip.status}</Badge>
                    </Td>
                    <Td>{slip.printedCount}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
