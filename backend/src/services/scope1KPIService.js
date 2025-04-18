const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const kpiConfig = require('../config/kpiConfig');
const ss = require('simple-statistics');

/**
 * Helper to format a Date object into either:
 * - "YYYY-MM" if period === 'month'
 * - "YYYY"    if period === 'year'
 */
function getPeriod(date, period) {
  if (!(date instanceof Date)) return null;
  const year = date.getFullYear();
  if (period === 'month') {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  return `${year}`;
}

/**
 * Helper to get the next period (month or year) for predictions
 */
function getNextPeriod(currentPeriod, periodType) {
  if (periodType === 'month') {
    const [year, month] = currentPeriod.split('-').map(Number);
    const date = new Date(year, month - 1);
    date.setMonth(date.getMonth() + 1);
    const nextYear = date.getFullYear();
    const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
    return `${nextYear}-${nextMonth}`;
  } else if (periodType === 'year') {
    const year = parseInt(currentPeriod, 10);
    return `${year + 1}`;
  }
  return null;
}

/**
 * Helper to calculate linear regression line and predictions
 * @param {Array} trendData - Array of { period, value }
 * @param {string} periodType - 'month' or 'year'
 * @param {number} numFuturePeriods - Number of future periods to predict
 * @returns {Array} - Array of { period, predictedValue }
 */
function calculateRegressionLine(trendData, periodType = 'month', numFuturePeriods = 3) {
  if (trendData.length < 2) {
    return []; // Not enough data for regression
  }

  const sortedData = [...trendData].sort((a, b) => a.period.localeCompare(b.period));
  const periodToIndex = {};
  sortedData.forEach((d, index) => {
    periodToIndex[d.period] = index;
  });

  const regressionData = sortedData.map(d => [periodToIndex[d.period], d.value]);
  const regression = ss.linearRegression(regressionData);
  const line = ss.linearRegressionLine(regression);

  let currentPeriod = sortedData[sortedData.length - 1].period;
  const allPeriods = [...sortedData.map(d => d.period)];
  for (let i = 0; i < numFuturePeriods; i++) {
    currentPeriod = getNextPeriod(currentPeriod, periodType);
    if (currentPeriod) {
      allPeriods.push(currentPeriod);
    }
  }

  return allPeriods.map((period, index) => ({
    period,
    predictedValue: line(index),
  }));
}

/**
 * Calculate emissions from stationary combustion
 */
async function calculateStationaryCombustionEmissions(userId) {
  const stationaryData = await prisma.stationaryCombustion.findMany({
    where: { scopeType: { userId } },
    include: { fuelType: true },
  });

  let totalEmissions = 0;
  for (const item of stationaryData) {
    const emissionFactor = kpiConfig.fuelEmissionFactors[item.fuelTypeId] || 0;
    totalEmissions += item.quantity * emissionFactor;
  }
  return totalEmissions;
}

/**
 * Calculate emissions from mobile sources
 */
async function calculateMobileSourceEmissions(userId) {
  const mobileData = await prisma.mobileSource.findMany({
    where: { scopeType: { userId } },
    include: { vehicleType: true },
  });

  let totalEmissions = 0;
  for (const item of mobileData) {
    const emissionFactor = kpiConfig.vehicleEmissionFactors[item.vehicleTypeId] || 0;
    totalEmissions += item.milesTravelled * emissionFactor;
  }
  return totalEmissions;
}

/**
 * Calculate emissions from refrigeration and AC
 */
async function calculateRefrigerationEmissions(userId) {
  const refrigerationData = await prisma.refrigerationAndAC.findMany({
    where: { scopeType: { userId } },
  });

  let totalEmissions = 0;
  for (const item of refrigerationData) {
    totalEmissions += item.co2eKg || 0;
  }
  return totalEmissions;
}

/**
 * Calculate emissions from fire suppression systems
 */
async function calculateFireSuppressionEmissions(userId) {
  const fireSuppressionData = await prisma.fireSuppression.findMany({
    where: { scopeType: { userId } },
  });

  let totalEmissions = 0;
  for (const item of fireSuppressionData) {
    totalEmissions += item.co2eKg || 0;
  }
  return totalEmissions;
}

/**
 * Calculate emissions from purchased gases
 */
async function calculatePurchasedGasEmissions(userId) {
  const purchasedGasData = await prisma.purchasedGas.findMany({
    where: { scopeType: { userId } },
  });

  let totalEmissions = 0;
  for (const item of purchasedGasData) {
    const gwp = kpiConfig.gasGWP[item.Gas] || 0;
    totalEmissions += item.purchasedAmount * gwp;
  }
  return totalEmissions;
}

/**
 * Calculate total Scope 1 emissions
 */
async function calculateTotalScope1Emissions(userId) {
  const stationary = await calculateStationaryCombustionEmissions(userId);
  const mobile = await calculateMobileSourceEmissions(userId);
  const refrigeration = await calculateRefrigerationEmissions(userId);
  const fireSuppression = await calculateFireSuppressionEmissions(userId);
  const purchasedGas = await calculatePurchasedGasEmissions(userId);

  return stationary + mobile + refrigeration + fireSuppression + purchasedGas;
}

/**
 * Get top emission sources within Scope 1
 * Ranks the five source types by CO2e and returns the top 3
 */
async function getTopEmissionSources(userId) {
  const stationary = await calculateStationaryCombustionEmissions(userId);
  const mobile = await calculateMobileSourceEmissions(userId);
  const refrigeration = await calculateRefrigerationEmissions(userId);
  const fireSuppression = await calculateFireSuppressionEmissions(userId);
  const purchasedGas = await calculatePurchasedGasEmissions(userId);

  const sources = [
    { name: 'Stationary Combustion', emissions: stationary },
    { name: 'Mobile Sources', emissions: mobile },
    { name: 'Refrigeration and AC', emissions: refrigeration },
    { name: 'Fire Suppression', emissions: fireSuppression },
    { name: 'Purchased Gases', emissions: purchasedGas },
  ];

  return sources
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, 3);
}

/**
 * Get total Scope 1 emissions trend with regression and cumulative emissions
 */
async function getEmissionsTrend(userId, period = 'month') {
  const trendMap = new Map();

  function addEmission(date, emission) {
    if (!date || !emission) return;
    const periodKey = getPeriod(date, period);
    if (!periodKey) return;
    trendMap.set(periodKey, (trendMap.get(periodKey) || 0) + emission);
  }

  const stationaryData = await prisma.stationaryCombustion.findMany({
    where: { scopeType: { userId } },
    select: { date: true, quantity: true, fuelTypeId: true },
  });
  for (const row of stationaryData) {
    const factor = kpiConfig.fuelEmissionFactors[row.fuelTypeId] || 0;
    const emission = row.quantity * factor;
    addEmission(row.date, emission);
  }

  const mobileData = await prisma.mobileSource.findMany({
    where: { scopeType: { userId } },
    select: { date: true, milesTravelled: true, vehicleTypeId: true },
  });
  for (const row of mobileData) {
    const factor = kpiConfig.vehicleEmissionFactors[row.vehicleTypeId] || 0;
    const emission = row.milesTravelled * factor;
    addEmission(row.date, emission);
  }

  const refrigerationData = await prisma.refrigerationAndAC.findMany({
    where: { scopeType: { userId } },
    select: { date: true, co2eKg: true },
  });
  for (const row of refrigerationData) {
    addEmission(row.date, row.co2eKg || 0);
  }

  const fireData = await prisma.fireSuppression.findMany({
    where: { scopeType: { userId } },
    select: { date: true, co2eKg: true },
  });
  for (const row of fireData) {
    addEmission(row.date, row.co2eKg || 0);
  }

  const purchasedGasData = await prisma.purchasedGas.findMany({
    where: { scopeType: { userId } },
    select: { date: true, Gas: true, purchasedAmount: true },
  });
  for (const row of purchasedGasData) {
    const gwp = kpiConfig.gasGWP[row.Gas] || 0;
    const emission = row.purchasedAmount * gwp;
    addEmission(row.date, emission);
  }

  const trendData = Array.from(trendMap, ([period, emissions]) => ({ period, emissions }));
  trendData.sort((a, b) => a.period.localeCompare(b.period));

  let cumulative = 0;
  const cumulativeTrend = trendData.map(d => {
    cumulative += d.emissions;
    return { period: d.period, cumulativeEmissions: cumulative };
  });

  const regressionData = calculateRegressionLine(trendData.map(d => ({ period: d.period, value: d.emissions })), period);

  return {
    trend: trendData,
    cumulativeTrend,
    regression: regressionData,
  };
}

/**
 * Get emissions trend by source type with regression
 */
async function getEmissionsTrendBySourceType(userId, period = 'month') {
  const sourceTypes = [
    {
      name: 'Stationary Combustion',
      model: 'stationaryCombustion',
      select: { date: true, quantity: true, fuelTypeId: true },
      emissionCalc: (item) => {
        const factor = kpiConfig.fuelEmissionFactors[item.fuelTypeId] || 0;
        return item.quantity * factor;
      },
    },
    {
      name: 'Mobile Sources',
      model: 'mobileSource',
      select: { date: true, milesTravelled: true, vehicleTypeId: true },
      emissionCalc: (item) => {
        const factor = kpiConfig.vehicleEmissionFactors[item.vehicleTypeId] || 0;
        return item.milesTravelled * factor;
      },
    },
    {
      name: 'Refrigeration and AC',
      model: 'refrigerationAndAC',
      select: { date: true, co2eKg: true },
      emissionCalc: (item) => item.co2eKg || 0,
    },
    {
      name: 'Fire Suppression',
      model: 'fireSuppression',
      select: { date: true, co2eKg: true },
      emissionCalc: (item) => item.co2eKg || 0,
    },
    {
      name: 'Purchased Gases',
      model: 'purchasedGas',
      select: { date: true, Gas: true, purchasedAmount: true },
      emissionCalc: (item) => {
        const gwp = kpiConfig.gasGWP[item.Gas] || 0;
        return item.purchasedAmount * gwp;
      },
    },
  ];

  const trends = [];

  for (const source of sourceTypes) {
    const data = await prisma[source.model].findMany({
      where: { scopeType: { userId } },
      select: source.select,
    });

    const trendMap = new Map();
    for (const item of data) {
      const emission = source.emissionCalc(item);
      const periodKey = getPeriod(item.date, period);
      if (periodKey) {
        trendMap.set(periodKey, (trendMap.get(periodKey) || 0) + emission);
      }
    }

    const trendData = Array.from(trendMap, ([period, emissions]) => ({ period, emissions }));
    trendData.sort((a, b) => a.period.localeCompare(b.period));

    const regressionData = calculateRegressionLine(trendData.map(d => ({ period: d.period, value: d.emissions })), period);

    trends.push({
      sourceType: source.name,
      trend: trendData,
      regression: regressionData,
    });
  }

  return trends;
}

/**
 * Get emissions trend by fuel type with regression
 */
async function getEmissionsTrendByFuelType(userId, period = 'month') {
  // Fetch and process stationary combustion data
  const stationaryData = await prisma.stationaryCombustion.findMany({
    where: { scopeType: { userId } },
    select: {
      date: true,
      quantity: true,
      fuelType: {
        select: {
          fuelTypeId: true,
          typeName: true
        }
      }
    }
  });

  // Fetch and process fire suppression data
  const fireSuppressionData = await prisma.fireSuppression.findMany({
    where: { scopeType: { userId } },
    select: {
      date: true,
      co2eKg: true,
      fuelType: {
        select: {
          fuelTypeId: true,
          typeName: true
        }
      }
    }
  });

  const emissionsByFuelAndPeriod = {};

  // Process stationary emissions
  for (const item of stationaryData) {
    const fuelTypeId = item.fuelType.fuelTypeId; // Access through nested relation
    const periodKey = getPeriod(item.date, period);
    const emissionFactor = kpiConfig.fuelEmissionFactors[fuelTypeId] || 0;
    const emission = item.quantity * emissionFactor;
    
    if (!emissionsByFuelAndPeriod[fuelTypeId]) {
      emissionsByFuelAndPeriod[fuelTypeId] = {};
    }
    emissionsByFuelAndPeriod[fuelTypeId][periodKey] = 
      (emissionsByFuelAndPeriod[fuelTypeId][periodKey] || 0) + emission;
  }

  // Process fire suppression emissions
  for (const item of fireSuppressionData) {
    const fuelTypeId = item.fuelType.fuelTypeId; // Access through nested relation
    const periodKey = getPeriod(item.date, period);
    const emission = item.co2eKg || 0;
    
    if (!emissionsByFuelAndPeriod[fuelTypeId]) {
      emissionsByFuelAndPeriod[fuelTypeId] = {};
    }
    emissionsByFuelAndPeriod[fuelTypeId][periodKey] = 
      (emissionsByFuelAndPeriod[fuelTypeId][periodKey] || 0) + emission;
  }

  // Convert fuelType IDs safely
  const fuelTypeIds = Object.keys(emissionsByFuelAndPeriod)
    .map(id => parseInt(id, 10))
    .filter(id => Number.isInteger(id));

  // Get fuel type names with validation
  const fuelTypes = await prisma.fuelType.findMany({
    where: {
      fuelTypeId: {
        in: fuelTypeIds.length > 0 ? fuelTypeIds : [0] // Prevent empty IN clause
      }
    },
    select: { fuelTypeId: true, typeName: true }
  });

  // Create fuel type map
  const fuelTypeMap = fuelTypes.reduce((acc, ft) => {
    acc[ft.fuelTypeId] = ft.typeName;
    return acc;
  }, {});

  // Build final trends array
  return Object.entries(emissionsByFuelAndPeriod).map(([fuelTypeId, periods]) => {
    const trendData = Object.entries(periods)
      .map(([period, emissions]) => ({ period, emissions }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      fuelType: fuelTypeMap[fuelTypeId] || 'Unknown',
      trend: trendData,
      regression: calculateRegressionLine(
        trendData.map(d => ({ period: d.period, value: d.emissions })),
        period
      )
    };
  });
}
/**
 * Get emissions trend by vehicle type with regression
 */
async function getEmissionsTrendByVehicleType(userId, period = 'month') {
  // Fetch mobile source data with vehicle type information
  const mobileData = await prisma.mobileSource.findMany({
    where: { scopeType: { userId } },
    select: {
      date: true,
      milesTravelled: true,
      vehicleType: {
        select: {
          vehicleTypeId: true,
          typeName: true
        }
      }
    }
  });

  const emissionsByVehicleAndPeriod = {};

  // Process each mobile source record
  for (const item of mobileData) {
    const vehicleTypeId = item.vehicleType.vehicleTypeId; // Access through nested relation
    const periodKey = getPeriod(item.date, period);
    const emissionFactor = kpiConfig.vehicleEmissionFactors[vehicleTypeId] || 0;
    const emission = item.milesTravelled * emissionFactor;

    // Initialize structure if needed
    if (!emissionsByVehicleAndPeriod[vehicleTypeId]) {
      emissionsByVehicleAndPeriod[vehicleTypeId] = {};
    }
    
    // Accumulate emissions
    emissionsByVehicleAndPeriod[vehicleTypeId][periodKey] = 
      (emissionsByVehicleAndPeriod[vehicleTypeId][periodKey] || 0) + emission;
  }

  // Convert and validate vehicle type IDs
  const vehicleTypeIds = Object.keys(emissionsByVehicleAndPeriod)
    .map(id => parseInt(id, 10))
    .filter(id => Number.isInteger(id));

  // Get vehicle type names safely
  const vehicleTypes = await prisma.vehicleType.findMany({
    where: {
      vehicleTypeId: {
        in: vehicleTypeIds.length > 0 ? vehicleTypeIds : [0] // Prevent empty IN clause
      }
    },
    select: { vehicleTypeId: true, typeName: true }
  });

  // Create mapping for vehicle type names
  const vehicleTypeMap = vehicleTypes.reduce((acc, vt) => {
    acc[vt.vehicleTypeId] = vt.typeName;
    return acc;
  }, {});

  // Build and return trends
  return Object.entries(emissionsByVehicleAndPeriod).map(([vehicleTypeId, periods]) => {
    const trendData = Object.entries(periods)
      .map(([period, emissions]) => ({ period, emissions }))
      .sort((a, b) => a.period.localeCompare(b.period));

    return {
      vehicleType: vehicleTypeMap[vehicleTypeId] || 'Unknown',
      trend: trendData,
      regression: calculateRegressionLine(
        trendData.map(d => ({ period: d.period, value: d.emissions })),
        period
      )
    };
  });
}

/**
 * Get emissions trend by gas type with regression
 */
async function getEmissionsTrendByGasType(userId, period = 'month') {
  const refrigerationData = await prisma.refrigerationAndAC.findMany({
    where: { scopeType: { userId } },
    select: { date: true, gas: true, co2eKg: true },
  });

  const purchasedGasData = await prisma.purchasedGas.findMany({
    where: { scopeType: { userId } },
    select: { date: true, Gas: true, purchasedAmount: true },
  });

  const emissionsByGasAndPeriod = {};

  for (const item of refrigerationData) {
    const gasType = item.gas || 'Unknown';
    const periodKey = getPeriod(item.date, period);
    const emission = item.co2eKg || 0;
    if (!emissionsByGasAndPeriod[gasType]) {
      emissionsByGasAndPeriod[gasType] = {};
    }
    if (!emissionsByGasAndPeriod[gasType][periodKey]) {
      emissionsByGasAndPeriod[gasType][periodKey] = 0;
    }
    emissionsByGasAndPeriod[gasType][periodKey] += emission;
  }

  for (const item of purchasedGasData) {
    const gasType = item.Gas || 'Unknown';
    const periodKey = getPeriod(item.date, period);
    const gwp = kpiConfig.gasGWP[item.Gas] || 0;
    const emission = item.purchasedAmount * gwp;
    if (!emissionsByGasAndPeriod[gasType]) {
      emissionsByGasAndPeriod[gasType] = {};
    }
    if (!emissionsByGasAndPeriod[gasType][periodKey]) {
      emissionsByGasAndPeriod[gasType][periodKey] = 0;
    }
    emissionsByGasAndPeriod[gasType][periodKey] += emission;
  }

  const trends = [];
  for (const [gasType, periods] of Object.entries(emissionsByGasAndPeriod)) {
    const trendData = Object.entries(periods).map(([period, emissions]) => ({ period, emissions }));
    trendData.sort((a, b) => a.period.localeCompare(b.period));
    const regressionData = calculateRegressionLine(trendData.map(d => ({ period: d.period, value: d.emissions })), period);
    trends.push({
      gasType,
      trend: trendData,
      regression: regressionData,
    });
  }

  return trends;
}

/**
 * Get emissions by fuel type (non-time-series)
 */
async function getEmissionsByFuelType(userId) {
  const stationaryData = await prisma.stationaryCombustion.findMany({
    where: { scopeType: { userId } },
    include: { fuelType: true },
  });

  const fireSuppressionData = await prisma.fireSuppression.findMany({
    where: { scopeType: { userId } },
    include: { fuelType: true },
  });

  const emissionsByFuel = {};

  for (const item of stationaryData) {
    const fuelType = item.fuelType?.typeName || 'Unknown';
    const emissionFactor = kpiConfig.fuelEmissionFactors[item.fuelTypeId] || 0;
    const emissions = item.quantity * emissionFactor;
    emissionsByFuel[fuelType] = (emissionsByFuel[fuelType] || 0) + emissions;
  }

  for (const item of fireSuppressionData) {
    const fuelType = item.fuelType?.typeName || 'Unknown';
    const emissions = item.co2eKg || 0;
    emissionsByFuel[fuelType] = (emissionsByFuel[fuelType] || 0) + emissions;
  }

  return Object.entries(emissionsByFuel).map(([fuelType, emissions]) => ({ fuelType, emissions }));
}

/**
 * Get emissions by vehicle type (non-time-series)
 */
async function getEmissionsByVehicleType(userId) {
  const mobileData = await prisma.mobileSource.findMany({
    where: { scopeType: { userId } },
    include: { vehicleType: true },
  });

  const emissionsByVehicle = {};

  for (const item of mobileData) {
    const vehicleType = item.vehicleType?.typeName || 'Unknown';
    const emissionFactor = kpiConfig.vehicleEmissionFactors[item.vehicleTypeId] || 0;
    const emissions = item.milesTravelled * emissionFactor;
    emissionsByVehicle[vehicleType] = (emissionsByVehicle[vehicleType] || 0) + emissions;
  }

  return Object.entries(emissionsByVehicle).map(([vehicleType, emissions]) => ({ vehicleType, emissions }));
}

/**
 * Get emissions by gas type (non-time-series)
 */
async function getEmissionsByGasType(userId) {
  const refrigerationData = await prisma.refrigerationAndAC.findMany({
    where: { scopeType: { userId } },
  });

  const purchasedGasData = await prisma.purchasedGas.findMany({
    where: { scopeType: { userId } },
  });

  const emissionsByGas = {};

  for (const item of refrigerationData) {
    const gasType = item.gas || 'Unknown';
    const emissions = item.co2eKg || 0;
    emissionsByGas[gasType] = (emissionsByGas[gasType] || 0) + emissions;
  }

  for (const item of purchasedGasData) {
    const gasType = item.Gas || 'Unknown';
    const gwp = kpiConfig.gasGWP[item.Gas] || 0;
    const emissions = item.purchasedAmount * gwp;
    emissionsByGas[gasType] = (emissionsByGas[gasType] || 0) + emissions;
  }

  return Object.entries(emissionsByGas).map(([gasType, emissions]) => ({ gasType, emissions }));
}

module.exports = {
  calculateStationaryCombustionEmissions,
  calculateMobileSourceEmissions,
  calculateRefrigerationEmissions,
  calculateFireSuppressionEmissions,
  calculatePurchasedGasEmissions,
  calculateTotalScope1Emissions,
  getTopEmissionSources,
  getEmissionsTrend,
  getEmissionsTrendBySourceType,
  getEmissionsTrendByFuelType,
  getEmissionsTrendByVehicleType,
  getEmissionsTrendByGasType,
  getEmissionsByFuelType,
  getEmissionsByVehicleType,
  getEmissionsByGasType,
};