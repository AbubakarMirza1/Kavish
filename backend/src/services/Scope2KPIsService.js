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
 * Fetches and calculates Scope 2 KPIs for a given user and date range.
 * @param {string|number} userId - The ID of the user.
 * @param {string} startDate - ISO string of the start date.
 * @param {string} endDate - ISO string of the end date.
 * @param {string} period - Time period granularity ('month' or 'year').
 * @returns {Object} Scope 2 KPIs including totals, breakdowns, and trends.
 */
async function getScope2KPIs(userId, startDate, endDate, period = 'month') {
  try {
    // Input validation
    if (!userId || !startDate || !endDate) throw new Error('Missing required parameters');
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) throw new Error('Invalid userId');
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) throw new Error('Invalid date range');

    // Fetch Electricity and Steam records from the database
    const [electricityRecords, steamRecords] = await Promise.all([
      prisma.electricity.findMany({
        where: {
          scopeType: { userId: parsedUserId, scopeCategory: 'Scope2' },
          date: { gte: start, lte: end },
        },
      }),
      prisma.steam.findMany({
        where: {
          scopeType: { userId: parsedUserId, scopeCategory: 'Scope2' },
          date: { gte: start, lte: end },
        },
      }),
    ]);

    // Calculate total Scope 2 emissions
    const totalElectricityCO2e = electricityRecords.reduce((sum, rec) => sum + (rec.co2eKg || 0), 0);
    const totalSteamCO2e = steamRecords.reduce((sum, rec) => sum + (rec.co2Kg || 0), 0);
    const totalScope2Emissions = totalElectricityCO2e + totalSteamCO2e;

    // Emissions breakdown by source
    const emissionsBySource = [
      { name: 'Electricity', value: totalElectricityCO2e },
      { name: 'Steam', value: totalSteamCO2e },
    ];

    // Generate time periods for trends
    const periods = generatePeriods(start, end, period);

    // Initialize maps for trend calculations
    const trendMap = new Map(periods.map(p => [p, 0]));
    const electricityTrendMap = new Map(periods.map(p => [p, 0]));
    const steamTrendMap = new Map(periods.map(p => [p, 0]));
    const emissionsPerAreaMap = new Map(periods.map(p => [p, { co2e: 0, area: 0 }]));

    // Populate trend maps with data
    electricityRecords.forEach(rec => {
      const periodKey = getPeriod(rec.date, period);
      if (periodKey && trendMap.has(periodKey)) {
        trendMap.set(periodKey, trendMap.get(periodKey) + (rec.co2eKg || 0));
        electricityTrendMap.set(periodKey, electricityTrendMap.get(periodKey) + (rec.co2eKg || 0));
        const current = emissionsPerAreaMap.get(periodKey);
        emissionsPerAreaMap.set(periodKey, {
          co2e: current.co2e + (rec.co2eKg || 0),
          area: current.area + (rec.areaSqFt || 0),
        });
      }
    });

    steamRecords.forEach(rec => {
      const periodKey = getPeriod(rec.date, period);
      if (periodKey && trendMap.has(periodKey)) {
        trendMap.set(periodKey, trendMap.get(periodKey) + (rec.co2Kg || 0));
        steamTrendMap.set(periodKey, steamTrendMap.get(periodKey) + (rec.co2Kg || 0));
      }
    });

    // Format trend data
    const trendData = periods.map(p => ({ period: p, emissions: trendMap.get(p) }));
    const electricityTrendData = periods.map(p => ({ period: p, emissions: electricityTrendMap.get(p) }));
    const steamTrendData = periods.map(p => ({ period: p, emissions: steamTrendMap.get(p) }));
    const emissionsPerAreaTrend = periods.map(p => {
      const { co2e, area } = emissionsPerAreaMap.get(p);
      return { period: p, emissionsPerArea: area > 0 ? co2e / area : 0 };
    });

    // Calculate regression lines for trends
    const regressionData = calculateRegressionLine(trendData.map(d => ({ period: d.period, value: d.emissions })), period);
    const electricityRegression = calculateRegressionLine(electricityTrendData.map(d => ({ period: d.period, value: d.emissions })), period);
    const steamRegression = calculateRegressionLine(steamTrendData.map(d => ({ period: d.period, value: d.emissions })), period);
    const emissionsPerAreaRegression = calculateRegressionLine(emissionsPerAreaTrend.map(d => ({ period: d.period, value: d.emissionsPerArea })), period);

    // Return structured KPIs
    return {
      totalScope2Emissions,
      emissionsBySource,
      emissionsTrend: { historical: trendData, regression: regressionData },
      electricityTrend: { historical: electricityTrendData, regression: electricityRegression },
      steamTrend: { historical: steamTrendData, regression: steamRegression },
      emissionsPerAreaTrend: { historical: emissionsPerAreaTrend, regression: emissionsPerAreaRegression },
    };
  } catch (error) {
    console.error('Error in getScope2KPIs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { getScope2KPIs };