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
  
  // You can add more relationships here for other sections like mobile sources, etc.
  export const vehicleUnitMap = {
    "Car": ["Mile", "Kilometer"],
    "Truck": ["Mile", "Kilometer", "Hour"],
    "Ship": ["Nautical Mile", "Kilometer", "Hour"],
    "Aircraft": ["Hour", "Kilometer"]
  };
  
  export const getValidUnitsForVehicle = (vehicleType) => {
    return vehicleUnitMap[vehicleType] || [];
  };
  