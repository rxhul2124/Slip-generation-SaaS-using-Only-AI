import { FileSpreadsheet, Printer, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { PageHeader } from "@/components/layout/PageHeader";
import { PrintSheet } from "@/components/print/PrintSheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/input";
import { Table, Td, Th } from "@/components/ui/table";
import { sampleTemplate } from "@/lib/sampleData";
import type { GeneratedSlip } from "@/lib/types";
import { useCustomers, useProducts } from "@/lib/useWarehouseData";
import { useNotificationStore } from "@/stores/notificationStore";
import { FeatureGate, UpgradeBadge } from "@/components/billing/FeatureGate";

export function BulkGenerationPage() {
  const [csv, setCsv] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notify = useNotificationStore((state) => state.push);
  const products = useProducts();
  const customers = useCustomers();
  const rows = useMemo(() => csv.split("\n").slice(1).filter(Boolean), [csv]);
  const slips = useMemo<GeneratedSlip[]>(
    () =>
      rows.flatMap((row, index) => {
        const [productName, qty, customerName, orderReference] = row.split(",");
        const product = products.data?.data?.find((item) => item.name === productName);
        const customer = customers.data?.data?.find((item) => item.name === customerName);
        if (!product || !customer) return [];
        return {
          _id: `bulk-${index}`,
          serialNumber: `SLIP-2026-${String(index + 12).padStart(6, "0")}`,
          product,
          customer,
          template: sampleTemplate,
          slipType: "packing",
          quantity: Number(qty || 1),
          quantityUnit: product.quantityUnit,
          displayWeight: product.weight,
          orderReference,
          destination: customer.shippingAddress?.city,
          barcodeValue: product.barcode,
          qrPayload: { product: product.name, customer: customer.name, orderReference },
          status: "draft",
          printedCount: 0,
          exportedCount: 0,
          createdAt: new Date().toISOString()
        };
      }),
    [customers.data, products.data, rows]
  );
  const print = useReactToPrint({ content: () => printRef.current, documentTitle: "packslip-bulk" });

  return (
    <FeatureGate feature="bulk" title="Bulk generation" body="Bulk CSV generation is available on Pro and Enterprise plans." minimum="Pro">
    <>
      <PageHeader
        eyebrow="Bulk"
        title="Bulk generation"
        description="Upload CSV rows, validate hundreds of packing slips, paginate intelligently, and send to PDF or print queue."
        actions={
          <>
            <UpgradeBadge label="Pro" />
            <Badge variant="success">{slips.length} ready</Badge>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload CSV
            </Button>
            <Button onClick={print}>
              <Printer className="h-4 w-4" /> Print Batch
            </Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[430px_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>CSV Input</CardTitle>
              <CardDescription>Expected columns: Product, Quantity, Customer, OrderReference.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <input
              ref={fileRef}
              className="hidden"
              type="file"
              accept=".csv,text/csv"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setCsv(await file.text());
                notify({ tone: "success", title: "CSV loaded", body: `${file.name} is ready for validation.` });
              }}
            />
            <Textarea
              className="min-h-[340px] font-mono text-xs"
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              placeholder="Product,Quantity,Customer,OrderReference"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Validation Queue</CardTitle>
              <CardDescription>Rows are matched against known products, customers, and the selected default template.</CardDescription>
            </div>
            <FileSpreadsheet className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <Table>
              <thead>
                <tr>
                  <Th>Serial</Th>
                  <Th>Product</Th>
                  <Th>Customer</Th>
                  <Th>Qty</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {slips.map((slip) => (
                  <tr key={slip._id}>
                    <Td className="font-mono">{slip.serialNumber}</Td>
                    <Td>{slip.product.name}</Td>
                    <Td>{slip.customer.name}</Td>
                    <Td>{slip.quantity}</Td>
                    <Td>
                      <Badge variant="success">Valid</Badge>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="hidden">
              <div ref={printRef}>
                <PrintSheet slips={slips} paper="a4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
    </FeatureGate>
  );
}
