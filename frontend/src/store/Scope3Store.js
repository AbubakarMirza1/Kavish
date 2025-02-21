import { create } from "zustand";

const useScope3Store = create((set) => ({
    // Hardcoded initial values
    vehicleTypes: [
        { id: 1, name: "Passenger Car - Petrol", active: true },
        { id: 2, name: "Passenger Car - CNG", active: false },
    ],
    units: [
        { id: 1, name: "KMS", active: true },
        { id: 2, name: "M", active: false },
        { id: 3, name: "Miles", active: false },
    ],
    wasteMaterials: [
        { id: 1, name: "Aluminium", active: true },
        { id: 2, name: "Glass", active: false },
        { id: 3, name: "Wood", active: false },
    ],
    disposalMethods: [
        { id: 1, name: "Landfill", active: true },
        { id: 2, name: "Recycle", active: false },
    ],

    // Update functions for each category
    setVehicleTypes: (data) => set({ vehicleTypes: data }),
    setUnits: (data) => set({ units: data }),
    setWasteMaterials: (data) => set({ wasteMaterials: data }),
    setDisposalMethods: (data) => set({ disposalMethods: data }),
}));

export default useScope3Store;
