import { create } from "zustand";
import { persist } from 'zustand/middleware';

const useScope3Store = create(persist((set) => ({
  // Initial state for each section
  vehicleTypes: [],
  units: [],
  wasteMaterials: [],
  
  // Actions
  setVehicleTypes: (rows) => set({ vehicleTypes: rows }),
  setUnits: (rows) => set({ units: rows }),
  setWasteMaterials: (rows) => set({ wasteMaterials: rows }),
  
  addRow: (section, newRow) =>
    set((state) => {
      const updatedSection = [...state[section], newRow];
      return { [section]: updatedSection };
    }),

  deleteRow: (section, id) =>
    set((state) => {
      const updatedSection = state[section].filter((row) => row.id !== id);
      return { [section]: updatedSection };
    }),

  toggleActive: (section, id) =>
    set((state) => {
      const updatedSection = state[section].map((row) =>
        row.id === id ? { ...row, active: !row.active } : row
      );
      return { [section]: updatedSection };
    }),
})
)
);

export default useScope3Store;