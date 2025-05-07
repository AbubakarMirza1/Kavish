const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const kpiConfig = require('../config/kpiConfig');
const ss = require('simple-statistics');

// Helper function to format date into period string (e.g., '2023-01' for month)
function getPeriod(date, period) {
  if (!(date instanceof Date)) return null;
  const year = date.getFullYear();
  if (period === 'month') {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }
  return `${year}`;
}

// Helper function to get the next period for regression predictions
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

// Helper function to generate all periods between start and end dates
function generatePeriods(startDate, endDate, periodType = 'month') {
  const periods = [];
  let current = new Date(startDate);
  while (current <= endDate) {
    periods.push(getPeriod(current, periodType));
    if (periodType === 'month') {
      current.setMonth(current.getMonth() + 1);
    } else {
      current.setFullYear(current.getFullYear() + 1);
    }
  }
  return periods;
}

// Helper function to calculate linear regression line with future predictions
function calculateRegressionLine(trendData, periodType = 'month', numFuturePeriods = 3) {
  if (trendData.length < 2) return [];
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
    if (currentPeriod) allPeriods.push(currentPeriod);
  }
  return allPeriods.map((period, index) => ({
    period,
    predictedValue: line(index),
  }));
}

/**
 * Fetches and calculates Scope 3 KPIs (Business Travel) for a given user and date range.
 * @param {string|number} userId - The ID of the user.
 * @param {string} startDate - ISO string of the start date.
 * @param {string} endDate - ISO string of the end date.
 * @param {string} period - Time period granularity ('month' or 'year').
 * @returns {Object} Scope 3 KPIs including totals, breakdowns, and trends.
 */
async function getScope3KPIs(userId, startDate, endDate, period = 'month') {
  try {
    // Input validation
    if (!userId || !startDate || !endDate) throw new Error('Missing required parameters');
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) throw new Error('Invalid userId');
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) throw new Error('Invalid date range');

    // Fetch BusinessTravel records with vehicle type details
    const businessTravelRecords = await prisma.businessTravel.findMany({
      where: {
        scopeType: { userId: parsedUserId, scopeCategory: 'Scope3' },
        date: { gte: start, lte: end },
      },
      include: { vehicleType: true },
    });

    // Calculate total Scope 3 emissions with GWP adjustments
    const totalScope3Emissions = businessTravelRecords.reduce((sum, rec) => {
      const co2eFromN2O = ((rec.n20g || 0) * kpiConfig.GWP_N2O) / 1000;
      const co2eFromCH4 = ((rec.ch4g || 0) * kpiConfig.GWP_CH4) / 1000;
      return sum + (rec.co2Kg || 0) + co2eFromN2O + co2eFromCH4;
    }, 0);

    // Emissions by vehicle type
    const emissionsByVehicleType = {};
    businessTravelRecords.forEach(rec => {
      const typeName = rec.vehicleType.typeName;
      const co2eFromN2O = ((rec.n20g || 0) * kpiConfig.GWP_N2O) / 1000;
      const co2eFromCH4 = ((rec.ch4g || 0) * kpiConfig.GWP_CH4) / 1000;
      const co2e = (rec.co2Kg || 0) + co2eFromN2O + co2eFromCH4;
      emissionsByVehicleType[typeName] = (emissionsByVehicleType[typeName] || 0) + co2e;
    });

    // Generate time periods for trends
    const periods = generatePeriods(start, end, period);

    // Initialize maps for trend calculations
    const trendMap = new Map(periods.map(p => [p, { emissions: 0, miles: 0 }]));
    const emissionsByVehicleTrend = {};

    // Populate trend maps
    businessTravelRecords.forEach(rec => {
      const periodKey = getPeriod(rec.date, period);
      if (periodKey && trendMap.has(periodKey)) {
        const co2eFromN2O = ((rec.n20g || 0) * kpiConfig.GWP_N2O) / 1000;
        const co2eFromCH4 = ((rec.ch4g || 0) * kpiConfig.GWP_CH4) / 1000;
        const co2e = (rec.co2Kg || 0) + co2eFromN2O + co2eFromCH4;
        const current = trendMap.get(periodKey);
        trendMap.set(periodKey, {
          emissions: current.emissions + co2e,
          miles: current.miles + (rec.vehicleMiles || 0),
        });

        const typeName = rec.vehicleType.typeName;
        if (!emissionsByVehicleTrend[typeName]) {
          emissionsByVehicleTrend[typeName] = new Map(periods.map(p => [p, 0]));
        }
        emissionsByVehicleTrend[typeName].set(periodKey, emissionsByVehicleTrend[typeName].get(periodKey) + co2e);
      }
    });

    // Format trend data
    const trendData = periods.map(p => {
      const { emissions, miles } = trendMap.get(p);
      return {
        period: p,
        emissions,
        emissionsPerMile: miles > 0 ? emissions / miles : 0,
      };
    });

    const vehicleTypeTrends = Object.keys(emissionsByVehicleTrend).map(typeName => ({
      vehicleType: typeName,
      historical: periods.map(p => ({ period: p, emissions: emissionsByVehicleTrend[typeName].get(p) })),
    }));

    // Calculate regression lines
    const regressionData = calculateRegressionLine(trendData.map(d => ({ period: d.period, value: d.emissions })), period);
    const emissionsPerMileRegression = calculateRegressionLine(trendData.map(d => ({ period: d.period, value: d.emissionsPerMile })), period);
    const vehicleTypeRegressions = vehicleTypeTrends.map(vt => ({
      vehicleType: vt.vehicleType,
      regression: calculateRegressionLine(vt.historical.map(d => ({ period: d.period, value: d.emissions })), period),
    }));

    // Return structured KPIs
    return {
      totalScope3Emissions,
      emissionsByVehicleType: Object.entries(emissionsByVehicleType).map(([name, value]) => ({ name, value })),
      emissionsTrend: { historical: trendData.map(d => ({ period: d.period, emissions: d.emissions })), regression: regressionData },
      emissionsPerMileTrend: { historical: trendData.map(d => ({ period: d.period, emissionsPerMile: d.emissionsPerMile })), regression: emissionsPerMileRegression },
      emissionsTrendByVehicleType: vehicleTypeTrends.map(vt => ({
        vehicleType: vt.vehicleType,
        historical: vt.historical,
        regression: vehicleTypeRegressions.find(r => r.vehicleType === vt.vehicleType).regression,
      })),
    };
  } catch (error) {
    console.error('Error in getScope3KPIs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { getScope3KPIs };