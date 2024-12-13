import create  from 'zustand';

const useScope1Store = create((set) => ({
  // Initial state for each section
  stationaryCombustionRows: [
    { id: 1, name: "Petrol", active: true },
    { id: 2, name: "Diesel", active: true },
  ],
  mobileRows: [
    { id: 1, name: "Light-Duty Trucks - Gasoline", active: true },
    { id: 2, name: "Heavy-Duty Vehicles - Gasoline", active: true },
  ],
  refrigerationRows: [
    { id: 1, name: "Stand-Alone Commercial", active: true },
    { id: 2, name: "Medium/Large Commercial", active: true },
  ],
  fireSuppressionRows: [],
  purchasedGasesRows: [
    { id: 1, name: "Natural Gas", active: true },
    { id: 2, name: "Propane", active: true },
  ],
  unitRows: [
    { id: 1, name: "KG", active: true },
    { id: 2, name: "Tonnes", active: true },
  ],

  // Actions
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
}));

export default useScope1Store;
