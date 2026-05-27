import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, FileSignature, Image as ImageIcon, PenLine, Printer, RotateCcw, Save, Upload } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ComponentLoader } from "@/components/ui/ComponentLoader";

const SlipPreviewArea = lazy(() => import("./SlipPreviewArea").then((m) => ({ default: m.SlipPreviewArea })));
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/tabs";
import { resources } from "@/lib/api";
import { sampleTemplate, sampleTemplates } from "@/lib/sampleData";
import { readLocalTemplates } from "@/lib/localTemplates";
import { formatDimensions, formatQuantityWeight, getSlipTypeDefinition, slipTypeDefinitions } from "@/lib/slipTypes";
import type { GeneratedSlip, Product, QuantityUnit, SignatureMode, SlipTemplate, SlipType, WeightUnit } from "@/lib/types";
import { saveLocalSlip, useCustomers, useSlips, useTemplates } from "@/lib/useWarehouseData";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";
import { limitsFor } from "@/lib/planLimits";
import { UpgradeBadge } from "@/components/billing/FeatureGate";

const quantityUnits: QuantityUnit[] = ["NOS", "PCS", "BOX", "KG", "SET"];
const weightUnits: WeightUnit[] = ["KG", "G", "TON", "LB"];
const slipCountOptions = [
  { value: "18", label: "18 slips - Small 3 x 6" },
  { value: "10", label: "10 slips - Medium 2 x 5" },
  { value: "12", label: "12 slips" },
  { value: "custom", label: "Custom" }
];

const emptyProduct: Product = {
  _id: "no-customer-product",
  name: "Add a product first",
  sku: "",
  partName: "Add a product first",
  partNumber: "",
  quantityDefault: 1,
  quantityUnit: "NOS",
  weight: { value: 0, unit: "KG" }
};

const emptyCustomer = {
  _id: "no-company-selected",
  name: "Select a company",
  products: []
};

function defaultSlipCountForTemplate(template?: SlipTemplate) {
  return template?._id === "t-medium-template" ? 10 : 18;
}

function normalizeWeightUnit(unit?: string): WeightUnit {
  const normalized = (unit || "KG").toUpperCase();
  return weightUnits.includes(normalized as WeightUnit) ? (normalized as WeightUnit) : "KG";
}

function SignaturePad({ value, onChange }: { value?: string; onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  const point = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const updateValue = () => {
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  const start = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    drawing.current = true;
    canvas.setPointerCapture(event.pointerId);
    const next = point(event);
    ctx.beginPath();
    ctx.moveTo(next.x, next.y);
  };

  const move = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const next = point(event);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    updateValue();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  useEffect(() => {
    if (!value || !canvasRef.current) return;
    const image = new Image();
    image.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    image.src = value;
  }, [value]);

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={420}
        height={120}
        className="h-24 w-full touch-none rounded-md border bg-white shadow-inner"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      />
      <Button type="button" variant="outline" size="sm" onClick={clear}>
        Clear Pad
      </Button>
    </div>
  );
}

export function GenerateSlipPage() {
  const customers = useCustomers();
  const templates = useTemplates();
  const slips = useSlips();
  const notify = useNotificationStore((state) => state.push);
  const { user, company } = useAuthStore();
  const queryClient = useQueryClient();
  const customerOptions = useMemo(() => customers.data?.data || [], [customers.data?.data]);
  const [localTemplates, setLocalTemplates] = useState<SlipTemplate[]>(() => readLocalTemplates());
  const templateOptions = useMemo(() => {
    const baseTemplates = templates.data?.data || sampleTemplates;
    return [...localTemplates, ...baseTemplates.filter((template) => !localTemplates.some((local) => local._id === template._id))];
  }, [localTemplates, templates.data]);
  const fileRef = useRef<HTMLInputElement>(null);

  const signatureProfile = user?.signatureProfile;
  const loggedInName = signatureProfile?.fullName || user?.name || "Tarun";

  const [slipType, setSlipType] = useState<SlipType>("packing");
  const [customerId, setCustomerId] = useState("");
  const [productId, setProductId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit>("NOS");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("KG");
  const [orderReference, setOrderReference] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  const [slipsPerPage, setSlipsPerPage] = useState(18);
  const [slipCountMode, setSlipCountMode] = useState("18");
  const [previewScale, setPreviewScale] = useState(1.65);
  const [signatureMode, setSignatureMode] = useState<SignatureMode>("text");
  const [signatureText, setSignatureText] = useState(signatureProfile?.signatureText || "");
  const [signatureRole, setSignatureRole] = useState(signatureProfile?.role || "");
  const [employeeId, setEmployeeId] = useState(signatureProfile?.employeeId || "");
  const [signatureImage, setSignatureImage] = useState("");
  const [padSignature, setPadSignature] = useState("");
  const [generated, setGenerated] = useState<GeneratedSlip | null>(null);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectedCustomer = customerOptions.find((item) => item._id === customerId);
  const customerProducts = useMemo(() => {
    const customer = customerOptions.find((item: any) => item._id === customerId);
    return customer?.products || [];
  }, [customers.data?.data, customerId]);
  const selectedProduct = customerProducts.find((item: any) => item._id === productId);
  const selectedTemplate = templateOptions.find((item) => item._id === templateId);
  const slipTypeDefinition = getSlipTypeDefinition(slipType);
  const slipLimit = limitsFor(company?.plan).slipsPerMonth;
  const slipLimitReached = slipLimit !== Infinity && (slips.data?.data?.length || 0) >= slipLimit;
  const canCreateSlip = Boolean(selectedCustomer && selectedProduct && selectedTemplate && quantity > 0 && !slipLimitReached);
  const weightPerPiece = selectedProduct?.weight?.value || 0;
  const totalWeightValue = Number((weightPerPiece * quantity).toFixed(3));

  useEffect(() => {
    if (productId && !customerProducts.some((product: any) => product._id === productId)) setProductId("");
  }, [customerProducts, productId]);

  useEffect(() => {
    setDestination(selectedCustomer?.shippingAddress?.city || "");
  }, [selectedCustomer?._id, selectedCustomer?.shippingAddress?.city]);

  useEffect(() => {
    const refreshTemplates = () => setLocalTemplates(readLocalTemplates());
    window.addEventListener("focus", refreshTemplates);
    window.addEventListener("storage", refreshTemplates);
    window.addEventListener("packslip:templates-updated", refreshTemplates);
    return () => {
      window.removeEventListener("focus", refreshTemplates);
      window.removeEventListener("storage", refreshTemplates);
      window.removeEventListener("packslip:templates-updated", refreshTemplates);
    };
  }, []);

  useEffect(() => {
    if (!templateId && localTemplates[0]) setTemplateId(localTemplates[0]._id);
  }, [localTemplates, templateId]);

  useEffect(() => {
    if (!selectedProduct) return;
    setQuantity(selectedProduct.quantityDefault || 1);
    setQuantityUnit(selectedProduct.quantityUnit || "NOS");
    setWeightUnit(normalizeWeightUnit(selectedProduct.weight?.unit));
    if (!templateId && selectedProduct.preferredTemplateId && templateOptions.some((template) => template._id === selectedProduct.preferredTemplateId)) {
      setTemplateId(selectedProduct.preferredTemplateId);
    }
  }, [selectedProduct?._id, selectedProduct, templateId, templateOptions]);

  useEffect(() => {
    if (!selectedTemplate) return;
    const defaultCount = defaultSlipCountForTemplate(selectedTemplate);
    setSlipCountMode(String(defaultCount));
    setSlipsPerPage(defaultCount);
  }, [selectedTemplate?._id]);

  useEffect(() => {
    setSignatureText((current) => current || signatureProfile?.signatureText || "");
    setSignatureRole((current) => current || signatureProfile?.role || "");
    setEmployeeId((current) => current || signatureProfile?.employeeId || "");
    setSignatureImage((current) => current || signatureProfile?.signatureImageUrl || "");
  }, [signatureProfile]);

  const draftSlip = useMemo<GeneratedSlip>(() => {
    return {
      _id: "draft-slip",
      serialNumber: generated?.serialNumber || "DRAFT",
      slipType,
      companyName: company?.name || "",
      product: selectedProduct || emptyProduct,
      customer: selectedCustomer || emptyCustomer,
      template: selectedTemplate || sampleTemplate,
      company: company || undefined,
      quantity,
      quantityUnit,
      displayWeight: { value: totalWeightValue, unit: weightUnit },
      orderReference,
      destination,
      notes,
      signature: {
        fullName: loggedInName,
        role: signatureRole,
        employeeId,
        text: signatureText || loggedInName,
        imageDataUrl: signatureImage,
        padDataUrl: padSignature,
        mode: signatureMode
      },
      printSettings: { slipsPerPage, generatedCopies: slipsPerPage, cutGuides: true, thermalSafe: true },
      barcodeValue: selectedProduct?.barcode || selectedProduct?.sku || selectedProduct?.partNumber,
      qrPayload: {
        slipType,
        orderReference,
        product: selectedProduct?.sku || selectedProduct?.partNumber,
        customer: selectedCustomer?.name
      },
      status: "generated",
      printedCount: 0,
      exportedCount: 0,
      createdAt: new Date().toISOString()
    };
  }, [
    company?.name,
    company,
    destination,
    employeeId,
    generated?.serialNumber,
    loggedInName,
    notes,
    orderReference,
    padSignature,
    quantity,
    quantityUnit,
    selectedCustomer,
    selectedProduct,
    selectedTemplate,
    signatureImage,
    signatureMode,
    signatureRole,
    signatureText,
    slipType,
    slipsPerPage,
    totalWeightValue,
    weightUnit,
  ]);

  const printSlips = useMemo(() => {
    const source = draftSlip;
    return Array.from({ length: slipsPerPage }, (_, index) => ({
      ...source,
      _id: `${source._id}-copy-${index}`,
      printedCount: source.printedCount,
      exportedCount: source.exportedCount
    }));
  }, [draftSlip, slipsPerPage]);

  const createSlip = useMutation({
    mutationFn: async () => {
      if (!canCreateSlip) throw new Error("Add a product to this company before creating a slip.");
      if (localStorage.getItem("packslip.accessToken") === "demo-local-session") {
        const localSlip: GeneratedSlip = {
          ...draftSlip,
          _id: `local-slip-${Date.now()}`,
          serialNumber: `SLIP-2026-${String(Date.now()).slice(-6)}`
        };
        return { status: "success" as const, data: localSlip };
      }

      return resources.slips.create({
        product: productId,
        customer: customerId,
        template: templateId,
        slipType,
        quantity,
        quantityUnit,
        displayWeight: { value: totalWeightValue, unit: weightUnit },
        orderReference,
        notes,
        destination,
        signature: draftSlip.signature,
        printSettings: draftSlip.printSettings
      });
    },
    onSuccess: (response) => {
      const savedSlip: GeneratedSlip = {
        ...response.data,
        status: response.data.status || "generated",
        printedCount: response.data.printedCount || 0,
        exportedCount: response.data.exportedCount || 0,
        printSettings: { ...(response.data.printSettings || {}), slipsPerPage, generatedCopies: slipsPerPage }
      };
      setGenerated(savedSlip);
      saveLocalSlip(savedSlip);
      queryClient.setQueryData<GeneratedSlip[]>(["slips"], (current) => [savedSlip, ...(current || [])]);
      notify({ tone: "success", title: `${slipTypeDefinition.title} generated`, body: `${savedSlip.serialNumber} - ${slipsPerPage} slips stored.` });
    },
    onError: (error) => {
      setGenerated(draftSlip);
      saveLocalSlip(draftSlip);
      queryClient.setQueryData<GeneratedSlip[]>(["slips"], (current) => [draftSlip, ...(current || [])]);
      notify({ tone: "warning", title: "Slip generated locally", body: "The API is offline, so this slip was saved in the browser session." });
      void error;
    }
  });



  const reset = () => {
    setSlipType("packing");
    setCustomerId("");
    setProductId("");
    setTemplateId("");
    setQuantity(0);
    setQuantityUnit("NOS");
    setWeightUnit("KG");
    setOrderReference("");
    setDestination("");
    setNotes("");
    setSlipsPerPage(18);
    setSlipCountMode("18");
    setGenerated(null);
    setExportNotice(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Create Slip"
        title="Create Slip"
        description="Select a company, pick one of its products, enter quantity, preview, and print."
        actions={
          <>
            <Badge variant="success">{slipTypeDefinition.printLabel}</Badge>
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
            <Button onClick={() => createSlip.mutate()} disabled={createSlip.isPending || !canCreateSlip}>
              <Save className="h-4 w-4" /> Create Slip {slipLimitReached ? <UpgradeBadge label="Pro" /> : null}
            </Button>
          </>
        }
      />

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(320px,460px)_1fr]">
        <div className="min-w-0 space-y-4">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Step-by-Step</CardTitle>
                <CardDescription>
                  {selectedCustomer ? `${customerProducts.length} products for ${selectedCustomer.name}` : "Choose a company to load its products."}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Slip Type</span>
                <Select value={slipType} onChange={(event) => setSlipType(event.target.value as SlipType)}>
                  {slipTypeDefinitions.map((definition) => (
                    <option key={definition.id} value={definition.id}>
                      {definition.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Company</span>
                <Select
                  value={customerId}
                  onChange={(event) => {
                    setCustomerId(event.target.value);
                    setProductId("");
                  }}
                >
                  <option value="" disabled>
                    Select company
                  </option>
                  {customers.data?.data?.map((customer: any) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Product From This Company</span>
                <Select value={productId} onChange={(event) => setProductId(event.target.value)} disabled={!customerProducts.length}>
                  <option value="" disabled>
                    Select product
                  </option>
                  {customerProducts.map((product: any) => (
                    <option key={product._id} value={product._id}>
                      {product.partName || product.name} - {product.partNumber || product.sku}
                    </option>
                  ))}
                </Select>
                {!customerProducts.length ? <span className="text-xs text-muted-foreground">No products added yet. Add products inside the company page first.</span> : null}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Quantity</span>
                  <Input type="number" min={1} value={quantity || ""} onChange={(event) => setQuantity(Number(event.target.value || 0))} placeholder="Enter quantity" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Quantity Unit</span>
                  <Select value={quantityUnit} onChange={(event) => setQuantityUnit(event.target.value as QuantityUnit)}>
                    {quantityUnits.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Weight Per Piece</span>
                  <Input value={selectedProduct ? `${weightPerPiece || 0} ${weightUnit}` : ""} readOnly placeholder="Auto-filled from product" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Total Weight</span>
                  <Input value={selectedProduct ? `${totalWeightValue.toFixed(3)} ${weightUnit}` : ""} readOnly placeholder="Calculated after quantity" />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Order Ref</span>
                  <Input value={orderReference} onChange={(event) => setOrderReference(event.target.value)} placeholder="Example: SO-98241" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Template</span>
                  <Select value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
                    <option value="" disabled>
                      Select slip template
                    </option>
                    {templateOptions.map((template) => (
                      <option key={template._id} value={template._id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                </label>
              </div>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Destination</span>
                <Input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Destination shown on slip" />
              </label>
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Simple notes for this slip" />
              {selectedCustomer && selectedProduct ? (
                <div className="grid gap-3 rounded-md border bg-muted/40 p-3 text-sm sm:grid-cols-3">
                  <div>
                    <div className="text-muted-foreground">Part Name</div>
                    <div className="font-semibold">{selectedProduct.partName || selectedProduct.name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Part No.</div>
                    <div className="font-semibold">{selectedProduct.partNumber || selectedProduct.sku}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Qty + Weight</div>
                    <div className="font-semibold">{formatQuantityWeight(draftSlip)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Dimensions</div>
                    <div className="font-semibold">{formatDimensions(draftSlip)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Customer</div>
                    <div className="font-semibold">{selectedCustomer.name}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Visible Fields</div>
                    <div className="font-semibold">{slipTypeDefinition.visibleFields.length}</div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardTitle>Signature</CardTitle>
                <CardDescription>{employeeId ? `${loggedInName} - ${employeeId}` : loggedInName}</CardDescription>
              </div>
              <FileSignature className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <SegmentedControl
                value={signatureMode}
                onChange={setSignatureMode}
                className="w-full overflow-x-auto"
                options={[
                  { value: "text", label: "Text" },
                  { value: "image", label: "Image" },
                  { value: "pad", label: "Pad" }
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Signature Text</span>
                  <Input value={signatureText} onChange={(event) => setSignatureText(event.target.value)} placeholder="Name shown on slip" />
                </label>
                <label className="space-y-1 text-sm">
                  <span className="font-semibold">Employee ID</span>
                  <Input value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} placeholder="Example: EMP-104" />
                </label>
              </div>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">Role / Designation</span>
                <Input value={signatureRole} onChange={(event) => setSignatureRole(event.target.value)} placeholder="Example: Dispatch Executive" />
              </label>
              {signatureMode === "image" ? (
                <div className="space-y-3">
                  <input
                    ref={fileRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setSignatureImage(String(reader.result || ""));
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Button variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" /> Upload Signature
                  </Button>
                  {signatureImage ? (
                    <div className="grid h-20 place-items-center rounded-md border bg-white p-2">
                      <img src={signatureImage} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : null}
                </div>
              ) : null}
              {signatureMode === "pad" ? <SignaturePad value={padSignature} onChange={setPadSignature} /> : null}
            </CardContent>
          </Card>
        </div>

        <Suspense fallback={<ComponentLoader className="min-h-[400px]" />}>
          <SlipPreviewArea 
            canCreateSlip={canCreateSlip}
            draftSlip={draftSlip}
            selectedTemplate={selectedTemplate}
            slipsPerPage={slipsPerPage}
            setSlipsPerPage={setSlipsPerPage}
            slipCountMode={slipCountMode}
            setSlipCountMode={setSlipCountMode}
            slipTypeDefinition={slipTypeDefinition}
            printSlips={printSlips}
            notify={notify}
          />
        </Suspense>
      </div>
    </>
  );
}
