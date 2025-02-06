/***********************************************
 * emissionCalculationsScope3.js
 * Helper functions for calculating Scope 3 emissions.
 ***********************************************/

const { sumArray } = require('./emissionCalculations');

/**
 * Calculate total CO2e from Business Travel.
 * If your DB stores direct CO2e (co2Kg) for each travel record, just sum them.
 * @param {Array} travelData
 * @returns {number} total CO2e
 */
function calcBusinessTravel(travelData) {
  return sumArray(travelData.map((item) => item.co2Kg || 0));
}

/**
 * Calculate total CO2e from Waste data.
 * If your DB stores CO2e directly in each row, just sum up.
 * @param {Array} wasteData
 * @returns {number} total CO2e
 */
function calcWaste(wasteData) {
  return sumArray(wasteData.map((item) => item.co2eKg || 0));
}

/**
 * Calculate total Scope 3 Emissions (Business Travel + Waste).
 * @param {Object} scope3Records
 * @returns {number} sum of all scope 3 emissions
 */
function calculateTotalScope3(scope3Records) {
  const { travelData, wasteData } = scope3Records;
  const totalTravel = calcBusinessTravel(travelData || []);
  const totalWaste = calcWaste(wasteData || []);
  return totalTravel + totalWaste;
}

module.exports = {
  calcBusinessTravel,
  calcWaste,
  calculateTotalScope3,
};
