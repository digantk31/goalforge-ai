import { create } from 'zustand'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

interface UIStore {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebarCollapse: () => void
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarCollapse: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}))
