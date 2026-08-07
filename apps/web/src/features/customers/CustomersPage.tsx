import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, ChevronDown, ChevronRight, Copy, Pencil, Plus, Save, Trash2, UserPlus, X } from "lucide-react";
import { Fragment, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState, Table, Td, Th } from "@/components/ui/table";
import { resources } from "@/lib/api";
import type { Customer, Product, QuantityUnit, WeightUnit } from "@/lib/types";
import { useCustomers } from "@/lib/useWarehouseData";
import { useNotificationStore } from "@/stores/notificationStore";
import { useAuthStore } from "@/stores/authStore";
import { limitsFor } from "@/lib/planLimits";
import { UpgradeBadge } from "@/components/billing/FeatureGate";

const quantityUnits: QuantityUnit[] = ["NOS", "PCS", "BOX", "KG", "SET"];
const weightUnits: WeightUnit[] = ["KG", "G", "TON", "LB"];

const schema = z.object({
  name: z.string().min(2, "Enter the company name."),
  contactPerson: z.string().optional(),
  email: z.string().email("Enter a valid email.").optional().or(z.literal("")),
  phone: z.string().optional(),
  taxNumber: z.string().optional(),
  shippingInstructions: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

interface ProductForm {
  _id?: string;
  partName: string;
  partNumber: string;
  dimensions: string;
  weightPerPiece: string;
  weightUnit: WeightUnit;
  quantityUnit: QuantityUnit;
  notes: string;
  barcode: string;
  qrReference: string;
  quantityDefault: string;
}

const emptyProduct = (): ProductForm => ({
  partName: "",
  partNumber: "",
  dimensions: "",
  weightPerPiece: "",
  weightUnit: "KG",
  quantityUnit: "NOS",
  notes: "",
  barcode: "",
  qrReference: "",
  quantityDefault: "100"
});

function newId() {
  const time = Date.now().toString(16).padStart(12, "0").slice(-12);
  const random = Math.floor(Math.random() * 0xffffffffffff).toString(16).padStart(12, "0");
  return `${time}${random}`;
}

function parseDimensions(value: string): Product["dimensions"] | undefined {
  const numbers = value.match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
  if (!numbers.length) return undefined;
  const unit = (value.match(/\b(mm|cm|in)\b/i)?.[1] || "mm").toLowerCase();
  return {
    length: numbers[0],
    width: numbers[1],
    height: numbers[2],
    unit
  };
}

function dimensionsText(product: Product) {
  const dimensions = product.dimensions;
  if (!dimensions) return "";
  return [dimensions.length, dimensions.width, dimensions.height].filter((value) => typeof value === "number").join(" x ") + ` ${dimensions.unit || "mm"}`;
}

function formFromProduct(product: Product): ProductForm {
  return {
    _id: product._id,
    partName: product.partName || product.name || "",
    partNumber: product.partNumber || product.sku || "",
    dimensions: dimensionsText(product),
    weightPerPiece: product.weight?.value ? String(product.weight.value) : "",
    weightUnit: (String(product.weight?.unit || "KG").toUpperCase() as WeightUnit) || "KG",
    quantityUnit: product.quantityUnit || "NOS",
    notes: product.notes || "",
    barcode: product.barcode || "",
    qrReference: product.qrReference || "",
    quantityDefault: String(product.quantityDefault || 100)
  };
}

function productFromForm(form: ProductForm): Product {
  const partName = form.partName.trim();
  const partNumber = form.partNumber.trim();
  return {
    _id: form._id || newId(),
    name: partName || partNumber || "Product",
    sku: partNumber || form.barcode || form._id || newId(),
    partName,
    partNumber,
    dimensions: parseDimensions(form.dimensions),
    weight: form.weightPerPiece ? { value: Number(form.weightPerPiece), unit: form.weightUnit } : undefined,
    quantityUnit: form.quantityUnit,
    quantityDefault: Number(form.quantityDefault || 1),
    notes: form.notes,
    barcode: form.barcode,
    qrReference: form.qrReference || form.barcode
  };
}

function ProductEditor({
  value,
  onChange,
  onSave,
  saveLabel = "Save Product"
}: {
  value: ProductForm;
  onChange: (value: ProductForm) => void;
  onSave: () => void;
  saveLabel?: string;
}) {
  const set = (patch: Partial<ProductForm>) => onChange({ ...value, ...patch });
  const [errors, setErrors] = useState<{ partName?: string; partNumber?: string; quantityDefault?: string }>({});

  const validateField = (name: string, val: string) => {
    let err = "";
    if (name === "partName") {
      if (!val || val.trim().length < 2) {
        err = "Part name must be at least 2 characters.";
      }
    } else if (name === "partNumber") {
      if (!val || val.trim().length < 2) {
        err = "Part number (SKU) must be at least 2 characters.";
      }
    } else if (name === "quantityDefault") {
      const num = Number(val);
      if (!val || isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        err = "Default quantity must be a positive integer.";
      }
    }
    setErrors(prev => ({ ...prev, [name]: err }));
    return !err;
  };

  const handleSave = () => {
    const isNameValid = validateField("partName", value.partName);
    const isNumberValid = validateField("partNumber", value.partNumber);
    const isQtyValid = validateField("quantityDefault", value.quantityDefault);

    if (isNameValid && isNumberValid && isQtyValid) {
      setErrors({});
      onSave();
    }
  };

  return (
    <div className="space-y-3 rounded-md border bg-muted/30 p-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Part Name</span>
          <Input 
            value={value.partName} 
            onChange={(event) => {
              const val = event.target.value;
              set({ partName: val });
              validateField("partName", val);
            }} 
            placeholder="Example: ADAPTER RH 14 HEX" 
          />
          {errors.partName && (
            <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
              {errors.partName}
            </span>
          )}
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Part Number</span>
          <Input 
            value={value.partNumber} 
            onChange={(event) => {
              const val = event.target.value;
              set({ partNumber: val });
              validateField("partNumber", val);
            }} 
            placeholder="Example: S-09B-02020" 
          />
          {errors.partNumber && (
            <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
              {errors.partNumber}
            </span>
          )}
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Dimensions</span>
          <Input value={value.dimensions} onChange={(event) => set({ dimensions: event.target.value })} placeholder="29.5 x 25.5 x 17 mm" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Weight Per Piece</span>
          <Input value={value.weightPerPiece} onChange={(event) => set({ weightPerPiece: event.target.value })} placeholder="0.018" type="number" min="0" step="0.001" />
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Weight Unit</span>
          <Select value={value.weightUnit} onChange={(event) => set({ weightUnit: event.target.value as WeightUnit })}>
            {weightUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Quantity Unit</span>
          <Select value={value.quantityUnit} onChange={(event) => set({ quantityUnit: event.target.value as QuantityUnit })}>
            {quantityUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Default Quantity</span>
          <Input 
            value={value.quantityDefault} 
            onChange={(event) => {
              const val = event.target.value;
              set({ quantityDefault: val });
              validateField("quantityDefault", val);
            }} 
            placeholder="300" 
            type="number" 
            min="1" 
          />
          {errors.quantityDefault && (
            <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
              {errors.quantityDefault}
            </span>
          )}
        </label>
        <label className="space-y-1 text-sm">
          <span className="font-semibold">Barcode</span>
          <Input value={value.barcode} onChange={(event) => set({ barcode: event.target.value })} placeholder="8901000005018" />
        </label>
      </div>
      <label className="block space-y-1 text-sm">
        <span className="font-semibold">QR Code</span>
        <Input value={value.qrReference} onChange={(event) => set({ qrReference: event.target.value })} placeholder="Use part number, order code, or QR text" />
      </label>
      <Textarea value={value.notes} onChange={(event) => set({ notes: event.target.value })} placeholder="Notes for this company product" />
      <Button type="button" className="w-full" onClick={handleSave}>
        <Save className="h-4 w-4" /> {saveLabel}
      </Button>
    </div>
  );
}

function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="grid gap-2 text-sm md:grid-cols-3">
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Part</div>
        <div className="font-semibold">{product.partName || product.name}</div>
        <div className="text-xs text-muted-foreground">{product.partNumber || product.sku || "No part number"}</div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Quantity</div>
        <div className="font-semibold">
          {product.quantityDefault || 1} {product.quantityUnit || "NOS"}
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Weight</div>
        <div className="font-semibold">
          {product.weight?.value || 0} {String(product.weight?.unit || "KG").toUpperCase()} / piece
        </div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Dimensions</div>
        <div className="font-semibold">{dimensionsText(product) || "Not added"}</div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Barcode</div>
        <div className="font-mono text-xs">{product.barcode || "Not added"}</div>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">QR Reference</div>
        <div className="font-mono text-xs">{product.qrReference || "Not added"}</div>
      </div>
      {product.notes ? <div className="md:col-span-3 text-muted-foreground">{product.notes}</div> : null}
    </div>
  );
}

import { Pagination } from "@/components/ui/Pagination";
import { usePagination } from "@/lib/usePagination";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export function CustomersPage() {
  const { page, limit, setPage, setLimit } = usePagination();
  const customersQuery = useCustomers({ page, limit });
  const customers = useMemo(() => customersQuery.data?.data || [], [customersQuery.data]);
  const meta = customersQuery.data?.meta;
  
  const plan = useAuthStore((state) => state.company?.plan);
  const limits = limitsFor(plan);
  const totalProducts = customers.reduce((sum, customer) => sum + (customer.products?.length || 0), 0);
  const customerLimitReached = limits.customers !== null && limits.customers !== undefined && (meta?.total || 0) >= limits.customers;
  const productLimitReached = limits.products !== null && limits.products !== undefined && totalProducts >= limits.products;
  const queryClient = useQueryClient();
  const notify = useNotificationStore((state) => state.push);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);
  const [companyFormMode, setCompanyFormMode] = useState<"create" | "edit" | null>(null);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [newProducts, setNewProducts] = useState<ProductForm[]>([emptyProduct()]);
  const [productDraft, setProductDraft] = useState<ProductForm>(emptyProduct());
  const [productEditorCustomerId, setProductEditorCustomerId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", contactPerson: "", email: "", phone: "", taxNumber: "", shippingInstructions: "" }
  });
  const { errors } = form.formState;
  const { ref: formNameRef, ...nameField } = form.register("name");

  const cacheCustomer = (customer: Customer) => {
    queryClient.setQueryData<Customer[]>(["customers"], (current) => {
      const source = current?.length ? current : customers;
      return source.some((item) => item._id === customer._id)
        ? source.map((item) => (item._id === customer._id ? customer : item))
        : [customer, ...source];
    });
  };

  const removeCustomerFromCache = (customerId: string) => {
    queryClient.setQueryData<Customer[]>(["customers"], (current) => (current?.length ? current : customers).filter((item) => item._id !== customerId));
  };

  const createCustomer = useMutation({
    mutationFn: (values: FormValues) =>
      resources.customers.create({
        ...values,
        products: newProducts.filter((item) => item.partName || item.partNumber).map(productFromForm)
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setExpandedCustomerId(response.data._id);
      setNewProducts([emptyProduct()]);
      setCompanyFormMode(null);
      form.reset();
      notify({ tone: "success", title: "Company saved", body: "Products are ready for slip creation." });
    },
    onError: (_error, values) => {
      const localCustomer: Customer = {
        _id: `local-customer-${Date.now()}`,
        name: values.name,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        taxNumber: values.taxNumber,
        shippingInstructions: values.shippingInstructions,
        products: newProducts.filter((item) => item.partName || item.partNumber).map(productFromForm)
      };
      cacheCustomer(localCustomer);
      setExpandedCustomerId(localCustomer._id);
      setNewProducts([emptyProduct()]);
      setCompanyFormMode(null);
      form.reset();
      notify({ tone: "warning", title: "Saved locally", body: `${values.name} was added to this browser session.` });
    }
  });

  const updateCustomer = useMutation({
    mutationFn: ({ customer, values }: { customer: Customer; values: FormValues }) => resources.customers.update(customer._id, values),
    onSuccess: (response) => {
      cacheCustomer(response.data);
      setCompanyFormMode(null);
      setEditingCompanyId(null);
      form.reset();
      notify({ tone: "success", title: "Company updated", body: response.data.name });
    },
    onError: (_error, variables) => {
      cacheCustomer({ ...variables.customer, ...variables.values });
      setCompanyFormMode(null);
      setEditingCompanyId(null);
      form.reset();
      notify({ tone: "warning", title: "Saved locally", body: `${variables.values.name} was updated in this browser session.` });
    }
  });

  const deleteCustomer = useMutation({
    mutationFn: (customer: Customer) => resources.customers.delete(customer._id),
    onSuccess: (_response, customer) => {
      removeCustomerFromCache(customer._id);
      if (expandedCustomerId === customer._id) setExpandedCustomerId(null);
      notify({ tone: "success", title: "Company deleted", body: customer.name });
    },
    onError: (_error, customer) => {
      removeCustomerFromCache(customer._id);
      if (expandedCustomerId === customer._id) setExpandedCustomerId(null);
      notify({ tone: "warning", title: "Deleted locally", body: `${customer.name} was removed from this browser session.` });
    }
  });

  const updateProducts = useMutation({
    mutationFn: ({ customer, products }: { customer: Customer; products: Product[] }) => resources.customers.update(customer._id, { products }),
    onSuccess: (response) => {
      cacheCustomer(response.data);
      notify({ tone: "success", title: "Products updated", body: `${response.data.name} now has ${response.data.products?.length || 0} products.` });
    },
    onError: (_error, variables) => {
      cacheCustomer({ ...variables.customer, products: variables.products });
      notify({ tone: "warning", title: "Saved locally", body: "API unavailable, so product changes stayed in this browser session." });
    }
  });

  const openCreateCompany = () => {
    setCompanyFormMode("create");
    setEditingCompanyId(null);
    setNewProducts([emptyProduct()]);
    form.reset({ name: "", contactPerson: "", email: "", phone: "", taxNumber: "", shippingInstructions: "" });
    window.setTimeout(() => nameRef.current?.focus(), 0);
  };

  const openEditCompany = (customer: Customer) => {
    setCompanyFormMode("edit");
    setEditingCompanyId(customer._id);
    form.reset({
      name: customer.name || "",
      contactPerson: customer.contactPerson || "",
      email: customer.email || "",
      phone: customer.phone || "",
      taxNumber: customer.taxNumber || "",
      shippingInstructions: customer.shippingInstructions || ""
    });
    window.setTimeout(() => nameRef.current?.focus(), 0);
  };

  const submitCompany = (values: FormValues) => {
    const editingCustomer = customers.find((customer) => customer._id === editingCompanyId);
    if (companyFormMode === "edit" && editingCustomer) {
      updateCustomer.mutate({ customer: editingCustomer, values });
      return;
    }
    createCustomer.mutate(values);
  };

  const saveProducts = (customer: Customer, products: Product[]) => {
    updateProducts.mutate({ customer, products });
  };

  const openProductEditor = (customer: Customer, product?: Product) => {
    setExpandedCustomerId(customer._id);
    setProductEditorCustomerId(customer._id);
    setProductDraft(product ? formFromProduct(product) : emptyProduct());
  };

  const saveProductDraft = (customer: Customer) => {
    const selectedProducts = customer.products || [];
    if (!productDraft.partName.trim() && !productDraft.partNumber.trim()) {
      notify({ tone: "warning", title: "Product details required", body: "Add a part name or part number before saving." });
      return;
    }
    const product = productFromForm(productDraft);
    const exists = selectedProducts.some((item) => item._id === product._id);
    const next = exists ? selectedProducts.map((item) => (item._id === product._id ? product : item)) : [...selectedProducts, product];
    saveProducts(customer, next);
    setProductDraft(emptyProduct());
    setProductEditorCustomerId(null);
  };

  return (
    <>
      <PageHeader
        eyebrow="Companies"
        title="Companies and Products"
        description="Start from the company list, expand products only when needed, and keep company records easy to scan."
        actions={
          <Button onClick={openCreateCompany} disabled={customerLimitReached}>
            <UserPlus className="h-4 w-4" /> Add Company {customerLimitReached ? <UpgradeBadge label="Pro" /> : null}
          </Button>
        }
      />

      <div className={companyFormMode ? "grid gap-4 xl:grid-cols-[minmax(0,1fr)_420px]" : "grid gap-4"}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Company List</CardTitle>
              <CardDescription>Use Products to expand each company's complete product information.</CardDescription>
            </div>
            <Badge variant="muted">{customers.length} companies</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <thead>
                  <tr>
                    <Th>Company</Th>
                    <Th>Contact</Th>
                    <Th>Products</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {customersQuery.isLoading ? (
                    <tr>
                      <Td colSpan={5} className="p-0 border-0">
                        <TableSkeleton columns={5} />
                      </Td>
                    </tr>
                  ) : customers.length === 0 ? (
                    <tr>
                      <Td colSpan={5}>
                        <EmptyState title="No companies found" body="Get started by adding a company." />
                      </Td>
                    </tr>
                  ) : (
                    customers.map((customer) => {
                      const products = customer.products || [];
                      const expanded = expandedCustomerId === customer._id;
                      return (
                        <Fragment key={customer._id}>
                        <tr>
                          <Td>
                            <div className="flex items-center gap-2 font-semibold">
                              <Building2 className="h-4 w-4 text-primary" /> {customer.name}
                            </div>
                            <div className="text-xs text-muted-foreground">{customer.taxNumber || "No tax number added"}</div>
                          </Td>
                          <Td>
                            <div className="font-medium">{customer.contactPerson || "No contact person"}</div>
                            <div className="text-xs text-muted-foreground">{customer.email || customer.phone || "No contact added"}</div>
                          </Td>
                          <Td>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setExpandedCustomerId(expanded ? null : customer._id)}
                            >
                              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              {products.length} Products
                            </Button>
                          </Td>
                          <Td>{customer.favorite ? <Badge variant="warning">Favorite</Badge> : <Badge variant="muted">Ready</Badge>}</Td>
                          <Td className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditCompany(customer)}>
                                <Pencil className="h-4 w-4" /> Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (window.confirm(`Delete ${customer.name}?`)) deleteCustomer.mutate(customer);
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </Td>
                        </tr>
                        {expanded ? (
                          <tr>
                            <Td colSpan={5} className="bg-muted/20 p-0">
                              <div className="space-y-4 p-4">
                                <div className="grid gap-3 rounded-md border bg-background/70 p-3 text-sm md:grid-cols-3">
                                  <div>
                                    <div className="text-xs font-semibold uppercase text-muted-foreground">Company</div>
                                    <div className="font-semibold">{customer.name}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold uppercase text-muted-foreground">Phone</div>
                                    <div className="font-semibold">{customer.phone || "Not added"}</div>
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold uppercase text-muted-foreground">Instructions</div>
                                    <div className="font-semibold">{customer.shippingInstructions || "Not added"}</div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div>
                                    <div className="text-sm font-bold">Products</div>
                                    <div className="text-xs text-muted-foreground">Full part information, codes, quantities, and product actions.</div>
                                  </div>
                                  <Button variant="outline" size="sm" disabled={productLimitReached} onClick={() => openProductEditor(customer)}>
                                    <Plus className="h-4 w-4" /> Add Product {productLimitReached ? <UpgradeBadge label="Pro" /> : null}
                                  </Button>
                                </div>

                                {products.length ? (
                                  <div className="grid gap-3">
                                    {products.map((product) => (
                                      <div key={product._id} className="rounded-md border bg-background p-3">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                          <ProductDetail product={product} />
                                          <div className="flex shrink-0 flex-wrap gap-2">
                                            <Button variant="outline" size="sm" onClick={() => openProductEditor(customer, product)}>
                                              <Pencil className="h-4 w-4" /> Edit
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                saveProducts(customer, [
                                                  ...products,
                                                  { ...product, _id: newId(), name: `${product.name} Copy`, partName: `${product.partName || product.name} Copy` }
                                                ])
                                              }
                                            >
                                              <Copy className="h-4 w-4" /> Copy
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => saveProducts(customer, products.filter((item) => item._id !== product._id))}>
                                              <Trash2 className="h-4 w-4" /> Delete
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <EmptyState title="No products added yet." body="Add the first product for this company so workers can create slips quickly." />
                                )}

                                {productEditorCustomerId === customer._id ? (
                                  <div className="space-y-3 rounded-md border bg-background p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="text-sm font-bold">{productDraft._id ? "Edit Product" : "Add Product"}</div>
                                      <Button variant="ghost" size="icon" onClick={() => setProductEditorCustomerId(null)} aria-label="Close product editor">
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <ProductEditor
                                      value={productDraft}
                                      onChange={setProductDraft}
                                      onSave={() => saveProductDraft(customer)}
                                      saveLabel={productDraft._id ? "Update Product" : "Add Product"}
                                    />
                                  </div>
                                ) : null}
                              </div>
                            </Td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })
                )}
                </tbody>
              </Table>
            </div>
            {meta && (
              <Pagination
                page={meta.page}
                pages={meta.pages}
                limit={meta.limit}
                total={meta.total}
                onPageChange={setPage}
                onLimitChange={setLimit}
              />
            )}
          </CardContent>
        </Card>

        {companyFormMode ? (
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{companyFormMode === "edit" ? "Edit Company" : "Add Company"}</CardTitle>
                <CardDescription>
                  {companyFormMode === "edit" ? "Update company contact and dispatch details." : "Add company details, then optionally add its first products."}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setCompanyFormMode(null)} aria-label="Close company form">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={form.handleSubmit(submitCompany)}>
                <label className="block space-y-1 text-sm">
                  <span className="font-semibold">Company Name</span>
                  <Input
                    placeholder="Example: SANDHAR HARIDWAR"
                    {...nameField}
                    ref={(element) => {
                      formNameRef(element);
                      nameRef.current = element;
                    }}
                  />
                  {errors.name && (
                    <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
                      {errors.name.message}
                    </span>
                  )}
                </label>
                <div className="space-y-1">
                  <Input placeholder="Contact person name" {...form.register("contactPerson")} />
                  {errors.contactPerson && (
                    <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
                      {errors.contactPerson.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <Input placeholder="Email address" {...form.register("email")} />
                  {errors.email && (
                    <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
                      {errors.email.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <Input placeholder="Phone number" {...form.register("phone")} />
                  {errors.phone && (
                    <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <Input placeholder="GST / tax number" {...form.register("taxNumber")} />
                  {errors.taxNumber && (
                    <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
                      {errors.taxNumber.message}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <Textarea placeholder="Shipping or packing instructions" {...form.register("shippingInstructions")} />
                  {errors.shippingInstructions && (
                    <span className="text-[11px] font-medium text-red-500 block mt-0.5 animate-in fade-in slide-in-from-top-1">
                      {errors.shippingInstructions.message}
                    </span>
                  )}
                </div>

                {companyFormMode === "create" ? (
                  <div className="space-y-3 border-t pt-3">
                    <div>
                      <div className="text-sm font-semibold">Initial Products</div>
                      <div className="text-xs text-muted-foreground">Optional. Product rows can also be added later from the company dropdown.</div>
                    </div>
                    {newProducts.map((product, index) => (
                      <ProductEditor
                        key={index}
                        value={product}
                        onChange={(value) => setNewProducts((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))}
                        onSave={() => {
                          if (index === newProducts.length - 1) setNewProducts((current) => [...current, emptyProduct()]);
                        }}
                        saveLabel={index === newProducts.length - 1 ? "Add Another Product" : "Product Ready"}
                      />
                    ))}
                    <Button type="button" variant="outline" className="w-full" disabled={productLimitReached} onClick={() => setNewProducts((current) => [...current, emptyProduct()])}>
                      <Plus className="h-4 w-4" /> Add Product Row {productLimitReached ? <UpgradeBadge label="Pro" /> : null}
                    </Button>
                  </div>
                ) : null}

                <Button className="w-full" type="submit" disabled={createCustomer.isPending || updateCustomer.isPending}>
                  {companyFormMode === "edit" ? "Update Company" : "Save Company"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </>
  );
}
