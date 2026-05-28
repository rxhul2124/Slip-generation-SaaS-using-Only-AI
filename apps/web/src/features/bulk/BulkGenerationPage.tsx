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

type BulkValidationRow = {
  id: string;
  originalProductName: string;
  originalCustomerName: string;
  quantity: string;
  status: "valid" | "invalid";
  error?: string;
  slip?: GeneratedSlip;
};

export function BulkGenerationPage() {
  const [csv, setCsv] = useState("");
  const printRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notify = useNotificationStore((state) => state.push);
  const products = useProducts();
  const customers = useCustomers();
  const rows = useMemo(() => csv.split(/\r?\n/).slice(1).filter(Boolean), [csv]);
  
  const validationRows = useMemo<BulkValidationRow[]>(
    () =>
      rows.map((row, index) => {
        const parts = row.split(",");
        const productName = parts[0]?.trim() || "";
        const qty = parts[1]?.trim() || "1";
        const customerName = parts[2]?.trim() || "";
        const orderReference = parts[3]?.trim() || "";

        const product = products.data?.data?.find((item) => item.name.toLowerCase() === productName.toLowerCase());
        const customer = customers.data?.data?.find((item) => item.name.toLowerCase() === customerName.toLowerCase());

        let error: string | undefined;
        if (!product && !customer) error = "Unknown product and customer";
        else if (!product) error = "Unknown product";
        else if (!customer) error = "Unknown customer";

        const isValid = !!product && !!customer;

        let slip: GeneratedSlip | undefined;
        if (isValid) {
          slip = {
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
        }

        return {
          id: `row-${index}`,
          originalProductName: productName,
          originalCustomerName: customerName,
          quantity: qty,
          status: isValid ? "valid" : "invalid",
          error,
          slip
        };
      }),
    [customers.data, products.data, rows]
  );

  const validSlips = useMemo(() => validationRows.filter(r => r.status === "valid").map(r => r.slip!), [validationRows]);

  const print = useReactToPrint({ content: () => printRef.current, documentTitle: "slipora-bulk" });

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
            <Badge variant="success">{validSlips.length} ready</Badge>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Upload CSV
            </Button>
            <Button onClick={print} disabled={validSlips.length === 0}>
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
                {validationRows.map((row) => (
                  <tr key={row.id}>
                    <Td className="font-mono text-muted-foreground">{row.slip?.serialNumber || "—"}</Td>
                    <Td>{row.originalProductName}</Td>
                    <Td>{row.originalCustomerName}</Td>
                    <Td>{row.quantity}</Td>
                    <Td>
                      {row.status === "valid" ? (
                        <Badge variant="success">Valid</Badge>
                      ) : (
                        <Badge variant="danger" title={row.error}>{row.error}</Badge>
                      )}
                    </Td>
                  </tr>
                ))}
                {validationRows.length === 0 && (
                  <tr>
                    <Td colSpan={5} className="text-center py-8 text-muted-foreground">
                      Paste or upload CSV data to see validation results.
                    </Td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="hidden">
              <div ref={printRef}>
                <PrintSheet slips={validSlips} paper="a4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
    </FeatureGate>
  );
}
