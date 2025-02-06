/***********************************************
 * emissionCalculationsScope2.js
 * Helper functions for calculating Scope 2 emissions.
 ***********************************************/

const { sumArray } = require('./emissionCalculations');

/**
 * Calculate total CO2e from Electricity data.
 * If you store `co2eKg` in your DB table, simply sum it.
 * @param {Array} electricityData
 * @returns {number} total CO2e
 */
function calcElectricity(electricityData) {
  // Summation approach
  return sumArray(electricityData.map((item) => item.co2eKg || 0));
}

/**
 * Calculate total CO2e from Steam data.
 * If you store `co2Kg` in your DB table, simply sum it.
 * @param {Array} steamData
 * @returns {number} total CO2e
 */
function calcSteam(steamData) {
  return sumArray(steamData.map((item) => item.co2Kg || 0));
}

/**
 * Calculate total Scope 2 Emissions (Electricity + Steam).
 * @param {Object} scope2Records
 * @returns {number} sum of all scope 2 emissions
 */
function calculateTotalScope2(scope2Records) {
  const { electricityData, steamData } = scope2Records;
  const totalElectricity = calcElectricity(electricityData || []);
  const totalSteam = calcSteam(steamData || []);
  return totalElectricity + totalSteam;
}

module.exports = {
  calcElectricity,
  calcSteam,
  calculateTotalScope2,
};
