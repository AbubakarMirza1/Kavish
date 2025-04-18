// src/utils/emissionsRelationships.js
export const fuelUnitMap = {
    "Diesel": ["Liter", "Cubic Meter"],
    "Natural Gas": ["Cubic Meter"],
    "Propane": ["Kilogram", "Cubic Meter"],
    "Gasoline": ["Liter", "Cubic Meter"],
    "Electricity": ["Kilowatt-hour"]
  };
  
  // Function to get valid units for a given fuel type
  export const getValidUnitsForFuel = (fuelType) => {
    return fuelUnitMap[fuelType] || [];
  };
  
// Vehicle Type to Unit Mapping
export const vehicleUnitMap = {
  "Sedan (Gasoline)": ["Liter", "Cubic Meter"],
  "Delivery Truck (Diesel)": ["Liter"],
  "Hybrid Vehicle": ["Kilowatt-hour", "Liter"]
};

// Function to get valid units for a given vehicle type
export const getValidUnitsForVehicle = (vehicleType) => {
  return vehicleUnitMap[vehicleType] || [];
};