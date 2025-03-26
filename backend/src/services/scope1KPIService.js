const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const kpiConfig = require('../config/kpiConfig');

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
    const emissionFactor = kpiConfig.fuelEmissionFactors[item.fuelTypeId];
    if (emissionFactor) {
      totalEmissions += item.quantity * emissionFactor;
    }
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
    const emissionFactor = kpiConfig.vehicleEmissionFactors[item.vehicleTypeId];
    if (emissionFactor) {
      totalEmissions += item.milesTravelled * emissionFactor;
    }
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
    const gwp = kpiConfig.gasGWP[item.Gas];
    if (gwp) {
      totalEmissions += item.purchasedAmount * gwp;
    }
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

  // Sort by emissions descending and take top 3
  return sources
    .sort((a, b) => b.emissions - a.emissions)
    .slice(0, 3);
}

/**
 * Helper to format a Date object into either:
 * - "YYYY-MM" if period === 'month'
 * - "YYYY"    if period === 'year'
 */
function getPeriod(date, period) {
    if (!(date instanceof Date)) return null;
    const year = date.getFullYear();
  
    if (period === 'month') {
      // Note: months are zero-based in JS
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`; // e.g. "2025-03"
    }
  
    // Fallback: just the year
    return `${year}`; // e.g. "2025"
  }
  
  async function getEmissionsTrend(userId, period = 'month') {
    // 1. A Map to accumulate totalEmissions by period (month or year)
    const trendMap = new Map();
  
    // Helper function to add to the map
    function addEmission(date, emission) {
      if (!date || !emission) return;
      const periodKey = getPeriod(date, period);
      if (!periodKey) return;
      trendMap.set(periodKey, (trendMap.get(periodKey) || 0) + emission);
    }
  
    /**
     * 2. Fetch data from each table and compute emissions row by row.
     */
  
    // --------------------------
    // Stationary Combustion
    // --------------------------
    const stationaryData = await prisma.stationaryCombustion.findMany({
      where: { scopeType: { userId } },
      select: {
        date: true,
        quantity: true,
        fuelTypeId: true,
      },
    });
    for (const row of stationaryData) {
      const factor = kpiConfig.fuelEmissionFactors[row.fuelTypeId] || 0;
      const emission = row.quantity * factor;
      addEmission(row.date, emission);
    }
  
    // --------------------------
    // Mobile Source
    // --------------------------
    const mobileData = await prisma.mobileSource.findMany({
      where: { scopeType: { userId } },
      select: {
        date: true,
        milesTravelled: true,
        vehicleTypeId: true,
      },
    });
    for (const row of mobileData) {
      const factor = kpiConfig.vehicleEmissionFactors[row.vehicleTypeId] || 0;
      const emission = row.milesTravelled * factor;
      addEmission(row.date, emission);
    }
  
    // --------------------------
    // Refrigeration and AC
    // --------------------------
    const refrigerationData = await prisma.refrigerationAndAC.findMany({
      where: { scopeType: { userId } },
      select: {
        date: true,
        co2eKg: true,
      },
    });
    for (const row of refrigerationData) {
      addEmission(row.date, row.co2eKg || 0);
    }
  
    // --------------------------
    // Fire Suppression
    // --------------------------
    const fireData = await prisma.fireSuppression.findMany({
      where: { scopeType: { userId } },
      select: {
        date: true,
        co2eKg: true,
      },
    });
    for (const row of fireData) {
      addEmission(row.date, row.co2eKg || 0);
    }
  
    // --------------------------
    // Purchased Gas
    // --------------------------
    const purchasedGasData = await prisma.purchasedGas.findMany({
      where: { scopeType: { userId } },
      select: {
        date: true,
        Gas: true,
        purchasedAmount: true,
      },
    });
    for (const row of purchasedGasData) {
      const gwp = kpiConfig.gasGWP[row.Gas] || 0;
      const emission = row.purchasedAmount * gwp;
      addEmission(row.date, emission);
    }
  
    /**
     * 3. Convert the trendMap into an array of objects.
     */
    const result = [];
    for (const [periodKey, total] of trendMap.entries()) {
      result.push({
        period: periodKey,
        totalEmissions: total,
      });
    }
  
    /**
     * 4. Sort the results by period.
     *    If it's "YYYY-MM", parse year/month; if it's just "YYYY", sort by year.
     */
    result.sort((a, b) => {
      // Split on '-'
      const [aYear, aMonth] = a.period.split('-');
      const [bYear, bMonth] = b.period.split('-');
  
      // Convert to numbers
      const aY = parseInt(aYear, 10);
      const bY = parseInt(bYear, 10);
  
      // Compare years first
      if (aY !== bY) {
        return aY - bY;
      }
  
      // If monthly grouping, compare months
      if (aMonth && bMonth) {
        return parseInt(aMonth, 10) - parseInt(bMonth, 10);
      }
  
      // Otherwise, they are the same year or one is just "YYYY"
      return 0;
    });
  
    return result;
  }
  
  
  
  

/**
 * Get emissions by fuel type
 * Groups CO2e by fuel type for StationaryCombustion and FireSuppression
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
    const emissionFactor = kpiConfig.fuelEmissionFactors[item.fuelTypeId];
    if (emissionFactor) {
      const emissions = item.quantity * emissionFactor;
      emissionsByFuel[fuelType] = (emissionsByFuel[fuelType] || 0) + emissions;
    }
  }

  for (const item of fireSuppressionData) {
    const fuelType = item.fuelType?.typeName || 'Unknown';
    const emissions = item.co2eKg || 0;
    emissionsByFuel[fuelType] = (emissionsByFuel[fuelType] || 0) + emissions;
  }

  return Object.entries(emissionsByFuel).map(([fuelType, emissions]) => ({ fuelType, emissions }));
}

/**
 * Get emissions by vehicle type
 * Groups CO2e by vehicle type for MobileSource
 */
async function getEmissionsByVehicleType(userId) {
  const mobileData = await prisma.mobileSource.findMany({
    where: { scopeType: { userId } },
    include: { vehicleType: true },
  });

  const emissionsByVehicle = {};

  for (const item of mobileData) {
    const vehicleType = item.vehicleType?.typeName || 'Unknown';
    const emissionFactor = kpiConfig.vehicleEmissionFactors[item.vehicleTypeId];
    if (emissionFactor) {
      const emissions = item.milesTravelled * emissionFactor;
      emissionsByVehicle[vehicleType] = (emissionsByVehicle[vehicleType] || 0) + emissions;
    }
  }

  return Object.entries(emissionsByVehicle).map(([vehicleType, emissions]) => ({ vehicleType, emissions }));
}

/**
 * Get emissions by gas type
 * Groups CO2e by gas type for RefrigerationAndAC and PurchasedGas
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
    const gwp = kpiConfig.gasGWP[item.Gas];
    if (gwp) {
      const emissions = item.purchasedAmount * gwp;
      emissionsByGas[gasType] = (emissionsByGas[gasType] || 0) + emissions;
    }
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
  getEmissionsByFuelType,
  getEmissionsByVehicleType,
  getEmissionsByGasType,
};