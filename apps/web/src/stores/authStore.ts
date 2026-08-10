import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  locale?: string;
  timezone?: string;
  avatarUrl?: string;
  signatureProfile?: {
    fullName?: string;
    role?: string;
    employeeId?: string;
    signatureText?: string;
    signatureImageUrl?: string;
  };
}

interface Company {
  id: string;
  name: string;
  logo?: unknown;
  plan: "free" | "pro" | "enterprise";
}

interface AuthState {
  user: AuthUser | null;
  company: Company | null;
  accessToken: string | null;
  role: string | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; companyName: string }) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (payload: { user: AuthUser; company: Company; accessToken: string }) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      company: null,
      accessToken: null,
      role: null,
      setSession: (payload) => {
        localStorage.setItem("slipora.accessToken", payload.accessToken);
        set({ ...payload, role: "owner" });
      },
      updateUser: (partial) => set((state) => ({
        user: state.user ? { ...state.user, ...partial } : null
      })),
      login: async (email, password, rememberMe) => {
        const response = await api.post<{
          data: { user: AuthUser; company: Company; accessToken: string };
        }>("/auth/login", { email, password, rememberMe });
        localStorage.setItem("slipora.accessToken", response.data.accessToken);
        set({ ...response.data, role: "owner" });
      },
      register: async (payload) => {
        const response = await api.post<{
          data: { user: AuthUser; company: Company; accessToken: string };
        }>("/auth/register", payload);
        localStorage.setItem("slipora.accessToken", response.data.accessToken);
        set({ ...response.data, role: "owner" });
      },
      logout: async () => {
        await api.post("/auth/logout").catch(() => undefined);
        localStorage.removeItem("slipora.accessToken");
        set({ user: null, company: null, accessToken: null, role: null });
      }
    }),
    {
      name: "slipora.auth",
      version: 4,
      migrate: (persisted, version) => {
        if (version < 4) {
          localStorage.removeItem("slipora.accessToken");
          return { user: null, company: null, accessToken: null, role: null };
        }
        const state = persisted as Partial<AuthState> | undefined;
        if (!state?.accessToken || state.accessToken === "null") {
          localStorage.removeItem("slipora.accessToken");
          return { user: null, company: null, accessToken: null, role: null };
        }
        return state;
      }
    }
  )
);
