/***********************************************
 * kpiConfig.js
 * Configuration file for emission factors,
 * GWP values, and other constants used in
 * emission calculations.
 ***********************************************/

const kpiConfig = {
    // Example Fuel Emission Factors (kg CO2e per unit)
    // fuelTypeId => emissionFactor
    fuelEmissionFactors: {
      1: 2.68, // Diesel (example)
      2: 2.01, // Natural Gas
      3: 1.55, // Propane
      4: 2.31, // Gasoline
    },
  
    // Example Vehicle Emission Factors (kg CO2e per mile or per unit of fuel)
    // vehicleTypeId => emissionFactor
    vehicleEmissionFactors: {
      1: 0.35, // Sedan (Gasoline), example factor per mile
      2: 0.65, // Delivery Truck (Diesel)
      3: 0.20, // Hybrid Vehicle
    },
  
    // Example GWP values for refrigerants, etc.
    // gasName => GWP
    // If your system references a gas by name (e.g., "R-134a"), store it here
    gasGWP: {
      'R-134a': 1430,
      'R-410A': 2088,
      // add more as needed
    },
  
    // Additional constants for location-based emission factors, etc.
    // region => emissionFactor for electricity grid
    gridEmissionFactors: {
      USAverage: 0.45, // kg CO2e/kWh (example)
      EUElMix: 0.25,   // example
      // etc.
    },
  };
  
  module.exports = kpiConfig;
  