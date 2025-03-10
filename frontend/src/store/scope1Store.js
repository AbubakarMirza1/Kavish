// src/store/scope1Store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useScope1Store = create(
  persist(
    (set) => ({
      // Initial state for each section
      stationaryCombustionRows: [],
      mobileRows: [],
      refrigerationRows: [],
      fireSuppressionRows: [],
      purchasedGasesRows: [],
      unitRows: [],

      // Actions
      setStationaryCombustionRows: (rows) => set({ stationaryCombustionRows: rows }),
      setMobileRows: (rows) => set({ mobileRows: rows }),
      setRefrigerationRows: (rows) => set({ refrigerationRows: rows }),
      setFireSuppressionRows: (rows) => set({ fireSuppressionRows: rows }),
      setPurchasedGasesRows: (rows) => set({ purchasedGasesRows: rows }),
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
      name: 'scope1-store',
    }
  )
);

export default useScope1Store;