/***********************************************
 * kpiConfig.js
 * Configuration file for emission factors,
 * GWP values, and other constants used in
 * emission calculations.
 ***********************************************/

const kpiConfig = {
  // Fuel Emission Factors (kg CO2e per unit, e.g., per liter or gallon)
  fuelEmissionFactors: {
    1: 2.68, // Diesel
    2: 2.01, // Natural Gas
    3: 1.55, // Propane
    4: 2.31, // Gasoline
    // Ensure these match FuelType IDs and units align with StationaryCombustion/FireSuppression
  },

  // Vehicle Emission Factors (kg CO2e per mile)
  vehicleEmissionFactors: {
    1: 0.35, // Sedan (Gasoline)
    2: 0.65, // Delivery Truck (Diesel)
    3: 0.20, // Hybrid Vehicle
    // Ensure these match VehicleType IDs
  },

  // GWP values for gases (dimensionless)
  gasGWP: {
    'R-134a': 1430,  // Refrigerants for RefrigerationAndAC
    'R-410A': 2088,
    'CO2': 1,        // For PurchasedGas
    'CH4': 25,       // Methane
    'N2O': 298,      // Nitrous Oxide
    'SF6': 22800,    // Example high-GWP gas for PurchasedGas
    // Add more gases as they appear in PurchasedGas.Gas
  },

  // Grid Emission Factors (kg CO2e/kWh) - Optional, as Electricity has co2eKg pre-calculated
  gridEmissionFactors: {
    USAverage: 0.45,
    EUElMix: 0.25,
    // Add more if needed for validation
  },

  // GWP constants for CH4 and N2O calculations (used in Steam and BusinessTravel)
  GWP_CH4: 25,   // Methane GWP (100-year horizon)
  GWP_N2O: 298,  // Nitrous Oxide GWP (100-year horizon)
};

module.exports = kpiConfig;