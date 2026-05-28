import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { resources, type ListParams } from "./api";
import { sampleTemplates } from "./sampleData";
import type { Customer, GeneratedSlip, Product } from "./types";

const localSlipsKey = "slipora.localSlips";

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

const emptyMeta = { page: 1, limit: 25, total: 0, pages: 1 };

export function useProducts(params?: ListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: async () => {
      const response = await resources.customers.list(params);
      const customers = normalizeCustomers(response.data || []);
      const customerProducts = customers.flatMap((customer) =>
        productsForCustomer(customer).map((product) => ({ ...product, assignedCustomerIds: [customer._id] }))
      );
      return { data: customerProducts, meta: response.meta };
    },
    select: (result) => ({ data: normalizeProducts(result.data || []), meta: result.meta }),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function useCustomers(params?: ListParams) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: async () => {
      const response = await resources.customers.list(params);
      return { data: normalizeCustomers(response.data || []), meta: response.meta };
    },
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function useTemplates(params?: ListParams) {
  return useQuery({
    queryKey: ["templates", params],
    queryFn: async () => {
      const response = await resources.templates.list(params);
      return { data: withFallback(response.data, sampleTemplates), meta: response.meta };
    },
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function useSlips(params?: ListParams) {
  return useQuery({
    queryKey: ["slips", params],
    queryFn: async () => {
      const response = await resources.slips.list(params);
      // We only merge local slips on page 1
      const isFirstPage = !params?.page || params.page === 1;
      return { 
        data: mergeSlips(response.data || [], isFirstPage ? readLocalSlips() : []),
        meta: response.meta 
      };
    },
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function usePresets(params?: ListParams) {
  return useQuery({
    queryKey: ["presets", params],
    queryFn: () => resources.presets.list(params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function usePrintJobs(params?: ListParams) {
  return useQuery({
    queryKey: ["print-jobs", params],
    queryFn: async () => {
      const response = await resources.slips.printJobs(params);
      return { 
        data: Array.isArray(response.data) ? response.data : [], 
        meta: response.meta 
      };
    },
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function useBackups(params?: ListParams) {
  return useQuery({
    queryKey: ["backups", params],
    queryFn: () => resources.backups.list(params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function useAuditLogs(params?: ListParams) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => resources.audit.list(params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}

export function useTeamMembers(params?: ListParams) {
  return useQuery({
    queryKey: ["team", params],
    queryFn: () => resources.team.list(params),
    placeholderData: keepPreviousData,
    retry: false,
    staleTime: 30_000,
    gcTime: 300_000
  });
}
