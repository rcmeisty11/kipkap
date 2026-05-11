import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedSectionId: number | "all" | null;
  setSelectedSection: (id: number | "all" | null) => void;
  groupBy: "none" | "date" | "standard";
  setGroupBy: (groupBy: "none" | "date" | "standard") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectedSectionId: null,
  setSelectedSection: (id) => set({ selectedSectionId: id }),
  groupBy: "none",
  setGroupBy: (groupBy) => set({ groupBy }),
}));
