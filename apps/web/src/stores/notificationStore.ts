import { create } from "zustand";

export type NotificationTone = "success" | "warning" | "error" | "info";

export interface Notification {
  id: string;
  title: string;
  body?: string;
  tone: NotificationTone;
}

interface NotificationState {
  notifications: Notification[];
  push: (notification: Omit<Notification, "id">) => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  push: (notification) => {
    const id = crypto.randomUUID();
    set((state) => ({
      notifications: [{ id, ...notification }, ...state.notifications].slice(0, 4)
    }));
    window.setTimeout(() => {
      set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) }));
    }, 4200);
  },
  dismiss: (id) => set((state) => ({ notifications: state.notifications.filter((item) => item.id !== id) }))
}));
