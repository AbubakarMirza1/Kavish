/***********************************************
 * emissionCalculationsScope1.js
 * Helper functions for calculating Scope 1 emissions.
 ***********************************************/

const {
    calculateCO2eFromFuel,
    calculateCO2eFromMileage,
    calculateCO2eFromRefrigerant,
    sumArray,
  } = require('./emissionCalculations');
  
  /**
   * Calculate total CO2e for Stationary Combustion items.
   * @param {Array} stationaryData - Array of StationaryCombustion records from DB
   * @returns {number} total CO2e from Stationary Combustion
   */
  function calcStationaryCombustion(stationaryData) {
    // Option 1: if you already store CO2e in the DB, just sum it
    // return sumArray(stationaryData.map(item => item.co2e));
  
    // Option 2: calculate on the fly using emission factors
    return sumArray(
      stationaryData.map((item) => {
        // item.fuelTypeId, item.quantity
        return calculateCO2eFromFuel(item.fuelTypeId, item.quantity);
      })
    );
  }
  
  /**
   * Calculate total CO2e for Mobile Sources.
   * @param {Array} mobileData
   * @returns {number} total CO2e from Mobile Sources
   */
  function calcMobileSources(mobileData) {
    // Option 1: sum CO2e from DB if stored
    // return sumArray(mobileData.map(item => item.co2e));
  
    // Option 2: mileage-based or fuel usage-based
    return sumArray(
      mobileData.map((item) => {
        if (item.milesTraveled) {
          return calculateCO2eFromMileage(item.vehicleTypeId, item.milesTraveled);
        } else if (item.fuelUsage) {
          // If you track fuel usage, you might reuse calculateCO2eFromFuel
          return calculateCO2eFromFuel(item.vehicleTypeId, item.fuelUsage);
        }
        return 0;
      })
    );
  }
  
  /**
   * Calculate total CO2e for Refrigeration and AC.
   * @param {Array} refrigerationData
   * @returns {number} total CO2e
   */
  function calcRefrigerationAC(refrigerationData) {
    // Option 1: sum a stored CO2e column from the DB
    // return sumArray(refrigerationData.map(item => item.co2eKg));
  
    // Option 2: dynamically compute from GWP
    return sumArray(
      refrigerationData.map((item) => {
        // item.gas might be "R-134a"
        // item.gwp might be stored directly
        // if you want to compute from item.gas and item.quantity:
        // return calculateCO2eFromRefrigerant(item.gas, item.quantity);
  
        // But if the table already has co2eKg, just use it
        return item.co2eKg || 0;
      })
    );
  }
  
  /**
   * Calculate total CO2e for Fire Suppression.
   * @param {Array} fireData
   * @returns {number} total CO2e
   */
  function calcFireSuppression(fireData) {
    // If you store co2eKg directly in DB:
    return sumArray(fireData.map((item) => item.co2eKg || 0));
  }
  
  /**
   * Calculate total CO2e for Purchased Gases.
   * @param {Array} purchasedGasData
   * @returns {number} total CO2e
   */
  function calcPurchasedGases(purchasedGasData) {
    // Possibly you store co2e in DB or compute from quantity * GWP
    // For now, assume the table or logic is storing it; just sum up if you had a co2e column
    // If you do not store it, you'd do an approach similar to refrigeration:
    // example: item.purchasedAmount * factor
    // We'll just return 0 if not stored
    return 0; // or sumArray(...) if you have data
  }
  
  /**
   * Calculate total Scope 1 Emissions.
   * @param {Object} scope1Records - an object containing arrays of each scope 1 table
   * @returns {number} total CO2e for all Scope 1 sources
   */
  function calculateTotalScope1(scope1Records) {
    const {
      stationaryData,
      mobileData,
      refrigerationData,
      fireData,
      purchasedGasData,
    } = scope1Records;
  
    const totalStationary = calcStationaryCombustion(stationaryData || []);
    const totalMobile = calcMobileSources(mobileData || []);
    const totalRefrig = calcRefrigerationAC(refrigerationData || []);
    const totalFire = calcFireSuppression(fireData || []);
    const totalPurchased = calcPurchasedGases(purchasedGasData || []);
  
    return (
      totalStationary +
      totalMobile +
      totalRefrig +
      totalFire +
      totalPurchased
    );
  }
  
  module.exports = {
    calcStationaryCombustion,
    calcMobileSources,
    calcRefrigerationAC,
    calcFireSuppression,
    calcPurchasedGases,
    calculateTotalScope1,
  };
  