import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useScope2Store = create(
  persist(
    (set) => ({
      // Initial state for each section
      fuelTypeRows: [],
      unitRows: [],

      // Actions
      setFuelTypeRows: (rows) => set({ fuelTypeRows: rows }),
      setUnitRows: (rows) => set({ unitRows: rows }),

      addRow: (section, newRow) => set((state) => {
        const updatedSection = [...state[section], newRow];
        return { [section]: updatedSection };
      }),

      deleteRow: (section, id) => set((state) => {
        const updatedSection = state[section].filter((row) => row.id !== id);
        return { [section]: updatedSection };
      }),

      toggleActive: (section, id) => set((state) => {
        const updatedSection = state[section].map((row) =>
          row.id === id ? { ...row, active: !row.active } : row
        );
        return { [section]: updatedSection };
      }),
    }),
    {
      name: 'scope2-store', // Persisted store name
    }
  )
);

export default useScope2Store;