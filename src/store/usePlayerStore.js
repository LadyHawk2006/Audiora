import { create } from "zustand";

const usePlayerStore = create((set) => ({
  isExpanded: false,
  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  closeExpanded: () => set({ isExpanded: false }),
}));

export default usePlayerStore;
