/***********************************************
 * emissionCalculations.js
 * Generic emission calculation helpers.
 ***********************************************/

const kpiConfig = require('../config/kpiConfig');

/**
 * Calculate CO2e from a given fuel type and quantity.
 * @param {number} fuelTypeId - ID of the fuel type (matches keys in kpiConfig.fuelEmissionFactors).
 * @param {number} quantity - Amount of fuel used (in liters, kg, or whatever unit your factor assumes).
 * @returns {number} CO2e (kg)
 */
function calculateCO2eFromFuel(fuelTypeId, quantity) {
  const factor = kpiConfig.fuelEmissionFactors[fuelTypeId] || 0;
  return quantity * factor;
}

/**
 * Calculate CO2e from vehicle travel (distance-based approach).
 * @param {number} vehicleTypeId - ID of the vehicle type (keys in kpiConfig.vehicleEmissionFactors).
 * @param {number} milesTraveled - Distance traveled (miles or kilometers).
 * @returns {number} CO2e (kg)
 */
function calculateCO2eFromMileage(vehicleTypeId, milesTraveled) {
  const factor = kpiConfig.vehicleEmissionFactors[vehicleTypeId] || 0;
  return milesTraveled * factor;
}

/**
 * Calculate CO2e based on refrigerant gas and quantity leaked.
 * If your data table stores CO2e directly, you might not need this.
 * @param {string} gasName - Name of the refrigerant gas (e.g., "R-134a").
 * @param {number} gasQuantity - Quantity of gas leaked (kg).
 * @returns {number} CO2e (kg)
 */
function calculateCO2eFromRefrigerant(gasName, gasQuantity) {
  const gwp = kpiConfig.gasGWP[gasName] || 0;
  return gasQuantity * gwp;
}

/**
 * Sum an array of numeric values safely.
 * @param {number[]} values
 * @returns {number} sum of all values
 */
function sumArray(values) {
  return values.reduce((acc, val) => acc + (val || 0), 0);
}

module.exports = {
  calculateCO2eFromFuel,
  calculateCO2eFromMileage,
  calculateCO2eFromRefrigerant,
  sumArray,
};
