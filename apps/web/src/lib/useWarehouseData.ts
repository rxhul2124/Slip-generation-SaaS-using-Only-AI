import { useQuery } from "@tanstack/react-query";
import { resources } from "./api";
import { sampleAuditLogs, sampleBackups, sampleCustomers, samplePresets, samplePrintJobs, sampleProducts, sampleSlips, sampleTemplates } from "./sampleData";
import type { Customer, GeneratedSlip, Product } from "./types";

const localSlipsKey = "packslip.localSlips";

function withFallback<T>(items: T[] | undefined, fallback: T[]) {
  return items?.length ? items : fallback;
}

function normalizeProducts(items: Product[]): Product[] {
  return items.map((product): Product => ({
    ...product,
    name: product.name || product.partName || product.partNumber || "Product",
    sku: product.sku || product.partNumber || product.barcode || product._id,
    preferredTemplateId:
      product.preferredTemplateId ||
      (typeof product.preferredTemplate === "string" ? product.preferredTemplate : product.preferredTemplate?._id),
    assignedCustomerIds:
      product.assignedCustomerIds ||
      product.assignedCustomers?.map((customer) => (typeof customer === "string" ? customer : customer._id))
  }));
}

function normalizeCustomers(items: Customer[]): Customer[] {
  return items.map((customer) => ({
    ...customer,
    products: normalizeProducts(customer.products || [])
  }));
}

export function readLocalSlips(): GeneratedSlip[] {
  try {
    const raw = localStorage.getItem(localSlipsKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalSlip(slip: GeneratedSlip) {
  const current = readLocalSlips();
  const next = [slip, ...current.filter((item) => item._id !== slip._id)].slice(0, 200);
  localStorage.setItem(localSlipsKey, JSON.stringify(next));
}

function mergeSlips(items: GeneratedSlip[], localItems = readLocalSlips()) {
  const byId = new Map<string, GeneratedSlip>();
  [...localItems, ...items].forEach((slip) => byId.set(slip._id, slip));
  return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function productsForCustomer(customer?: Customer) {
  return normalizeProducts(customer?.products || []);
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const customers = normalizeCustomers(withFallback((await resources.customers.list()).data, sampleCustomers));
      const customerProducts = customers.flatMap((customer) =>
        productsForCustomer(customer).map((product) => ({ ...product, assignedCustomerIds: [customer._id] }))
      );
      return customerProducts.length ? customerProducts : sampleProducts;
    },
    select: (items) => normalizeProducts(withFallback(items, sampleProducts)),
    placeholderData: normalizeProducts(sampleProducts),
    retry: false
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => normalizeCustomers(withFallback((await resources.customers.list()).data, sampleCustomers)),
    select: (items) => normalizeCustomers(withFallback(items, sampleCustomers)),
    placeholderData: normalizeCustomers(sampleCustomers),
    retry: false
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => withFallback((await resources.templates.list()).data, sampleTemplates),
    select: (items) => withFallback(items, sampleTemplates),
    placeholderData: sampleTemplates,
    retry: false
  });
}

export function useSlips() {
  return useQuery({
    queryKey: ["slips"],
    queryFn: async () => mergeSlips(withFallback((await resources.slips.list()).data, sampleSlips)),
    select: (items) => mergeSlips(withFallback(items, sampleSlips), []),
    placeholderData: mergeSlips(sampleSlips),
    retry: false
  });
}

export function usePresets() {
  return useQuery({
    queryKey: ["presets"],
    queryFn: async () => withFallback((await resources.presets.list()).data, samplePresets),
    select: (items) => withFallback(items, samplePresets),
    placeholderData: samplePresets,
    retry: false
  });
}

export function usePrintJobs() {
  return useQuery({
    queryKey: ["print-jobs"],
    queryFn: async () => {
      const response = await resources.slips.printJobs();
      return withFallback(Array.isArray(response.data) ? response.data : [], samplePrintJobs);
    },
    select: (items) => withFallback(items, samplePrintJobs),
    placeholderData: samplePrintJobs,
    retry: false
  });
}

export function useBackups() {
  return useQuery({
    queryKey: ["backups"],
    queryFn: async () => withFallback((await resources.backups.list()).data, sampleBackups),
    select: (items) => withFallback(items, sampleBackups),
    placeholderData: sampleBackups,
    retry: false
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => withFallback((await resources.audit.list()).data, sampleAuditLogs),
    select: (items) => withFallback(items, sampleAuditLogs),
    placeholderData: sampleAuditLogs,
    retry: false
  });
}
