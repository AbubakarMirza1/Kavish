/****************************************************
 * emissionsService.js
 * 
 * Provides functions to:
 *  - Retrieve raw data for each scope from the DB
 *  - Calculate total Scope 1, 2, 3 emissions (using
 *    the scope-specific utility files)
 *  - Compute combined KPIs (Enterprise footprint,
 *    scope breakdown, etc.)
 ****************************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import scope-specific calculation helpers
const {
  calculateTotalScope1,
} = require('../utils/emissionCalculationsScope1');
const {
  calculateTotalScope2,
} = require('../utils/emissionCalculationsScope2');
const {
  calculateTotalScope3,
} = require('../utils/emissionCalculationsScope3');

// Example: If you want additional KPI config
// (like location-based emission factors), you can import kpiConfig
// const kpiConfig = require('../config/kpiConfig');

/* ------------------------------------------------------------------
    FETCH SCOPE DATA FROM DATABASE
   ------------------------------------------------------------------ */

/**
 * Fetch all necessary DB records for Scope 1.
 * Return them in an object that matches the expected
 * input structure of emissionCalculationsScope1.js
 */
async function getScope1Data(scopeTypeId) {
  // scopeTypeId is optional; if provided, filter by that.
  // Otherwise, fetch all records.
  const whereClause = scopeTypeId ? { scopeTypeId: scopeTypeId } : {};

  const [stationaryData, mobileData, refrigerationData, fireData, purchasedGasData] = await Promise.all([
    prisma.stationaryCombustion.findMany({ where: whereClause }),
    prisma.mobileSource.findMany({ where: whereClause }),
    prisma.refrigerationAndAC.findMany({ where: whereClause }),
    prisma.fireSuppression.findMany({ where: whereClause }),
    prisma.purchasedGas.findMany({ where: whereClause }),
  ]);

  return {
    stationaryData,
    mobileData,
    refrigerationData,
    fireData,
    purchasedGasData,
  };
}

/**
 * Fetch all necessary DB records for Scope 2.
 */
async function getScope2Data(scopeTypeId) {
  const whereClause = scopeTypeId ? { scopeTypeId: scopeTypeId } : {};

  const [electricityData, steamData] = await Promise.all([
    prisma.electricity.findMany({ where: whereClause }),
    prisma.steam.findMany({ where: whereClause }),
  ]);

  return {
    electricityData,
    steamData,
  };
}

/**
 * Fetch all necessary DB records for Scope 3.
 */
async function getScope3Data(scopeTypeId) {
  const whereClause = scopeTypeId ? { scopeTypeId: scopeTypeId } : {};

  const [travelData, wasteData] = await Promise.all([
    prisma.businessTravel.findMany({ where: whereClause }),
    prisma.waste.findMany({ where: whereClause }),
  ]);

  return {
    travelData,
    wasteData,
  };
}

/* ------------------------------------------------------------------
    CALCULATE TOTAL EMISSIONS PER SCOPE
   ------------------------------------------------------------------ */

/**
 * Calculate total Scope 1 emissions, either for a specific scopeTypeId
 * or for all scopeType records if none provided.
 */
async function getTotalScope1Emissions(scopeTypeId) {
  const scope1Records = await getScope1Data(scopeTypeId);
  return calculateTotalScope1(scope1Records);
}

/**
 * Calculate total Scope 2 emissions
 */
async function getTotalScope2Emissions(scopeTypeId) {
  const scope2Records = await getScope2Data(scopeTypeId);
  return calculateTotalScope2(scope2Records);
}

/**
 * Calculate total Scope 3 emissions
 */
async function getTotalScope3Emissions(scopeTypeId) {
  const scope3Records = await getScope3Data(scopeTypeId);
  return calculateTotalScope3(scope3Records);
}

/* ------------------------------------------------------------------
    COMBINED KPIs
   ------------------------------------------------------------------ */

/**
 * Get the enterprise carbon footprint for a given scopeTypeId
 * or for all if none provided.
 * 
 * This sums Scope 1 + Scope 2 + Scope 3.
 */
async function getTotalEmissions(scopeTypeId) {
  const [scope1, scope2, scope3] = await Promise.all([
    getTotalScope1Emissions(scopeTypeId),
    getTotalScope2Emissions(scopeTypeId),
    getTotalScope3Emissions(scopeTypeId),
  ]);

  return {
    scope1,
    scope2,
    scope3,
    total: scope1 + scope2 + scope3,
  };
}

/**
 * Calculate scope contributions in percentage terms.
 * e.g., scope1% = (scope1 / total) * 100
 */
function calculateScopeContributions(scope1, scope2, scope3) {
  const total = scope1 + scope2 + scope3;
  if (total === 0) {
    return { scope1Percent: 0, scope2Percent: 0, scope3Percent: 0 };
  }
  return {
    scope1Percent: (scope1 / total) * 100,
    scope2Percent: (scope2 / total) * 100,
    scope3Percent: (scope3 / total) * 100,
  };
}

/**
 * Example KPI: Emissions per kWh for Scope 2
 * Summation of CO2e / total kWh from Electricity + Steam.
 * Steam purchased might be in KWH or some other unit. 
 */
async function getEmissionsPerKwh(scopeTypeId) {
  // 1) get scope2 data
  const { electricityData, steamData } = await getScope2Data(scopeTypeId);

  // 2) sum co2 from electricity and steam
  const totalElecCO2 = electricityData.reduce((sum, e) => sum + (e.co2eKg || 0), 0);
  const totalSteamCO2 = steamData.reduce((sum, s) => sum + (s.co2Kg || 0), 0);
  const totalCO2 = totalElecCO2 + totalSteamCO2;

  // 3) sum kWh usage
  const totalElecKwh = electricityData.reduce((sum, e) => {
    // If you store actual kWh usage, sum it. If not, you need a formula
    // to compute from area or something else.
    return sum; // implement your logic
  }, 0);

  const totalSteamKwh = steamData.reduce((sum, s) => sum + (s.steamPurchasedKwh || 0), 0);

  const totalKwh = totalElecKwh + totalSteamKwh;
  if (totalKwh === 0) return 0;

  return totalCO2 / totalKwh; // kg CO2e / kWh
}

/**
 * Example KPI: Steam System Efficiency
 * This might be an average or an array of boiler efficiencies.
 */
async function getSteamSystemEfficiency(scopeTypeId) {
  const { steamData } = await getScope2Data(scopeTypeId);
  if (!steamData.length) return 0;

  const totalEfficiency = steamData.reduce((acc, s) => acc + (s.boilerEfficiency || 0), 0);
  return totalEfficiency / steamData.length; // average
}

/**
 * Example KPI: Emissions per Mile for business travel
 */
async function getEmissionsPerMile(scopeTypeId) {
  const { travelData } = await getScope3Data(scopeTypeId);
  if (!travelData.length) return 0;

  // total CO2
  const totalCO2 = travelData.reduce((sum, t) => sum + (t.co2Kg || 0), 0);
  // total miles
  const totalMiles = travelData.reduce((sum, t) => sum + (t.vehicleMiles || 0), 0);

  return totalMiles === 0 ? 0 : totalCO2 / totalMiles;
}

/* ------------------------------------------------------------------
    EXPORT ALL FUNCTIONS
   ------------------------------------------------------------------ */

module.exports = {
  // Scope 1,2,3 total
  getTotalScope1Emissions,
  getTotalScope2Emissions,
  getTotalScope3Emissions,

  // Combined
  getTotalEmissions, // => { scope1, scope2, scope3, total }

  // Additional KPI functions
  calculateScopeContributions, // usage example in a controller
  getEmissionsPerKwh,
  getSteamSystemEfficiency,
  getEmissionsPerMile,
};
