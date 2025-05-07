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
 * Fetches and calculates Waste KPIs for a given user and date range.
 * @param {string|number} userId - The ID of the user.
 * @param {string} startDate - ISO string of the start date.
 * @param {string} endDate - ISO string of the end date.
 * @param {string} period - Time period granularity ('month' or 'year').
 * @returns {Object} Waste KPIs including totals, breakdowns, and trends.
 */
async function getWasteKPIs(userId, startDate, endDate, period = 'month') {
  try {
    // Input validation
    if (!userId || !startDate || !endDate) throw new Error('Missing required parameters');
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) throw new Error('Invalid userId');
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) throw new Error('Invalid date range');

    // Fetch Waste records with unit and waste type details
    const wasteRecords = await prisma.waste.findMany({
      where: {
        scopeType: { userId: parsedUserId },
        date: { gte: start, lte: end },
      },
      include: { unit: true, wasteType: true },
    });

    // Calculate total waste and CO2e, handling unit conversions (to kg)
    let totalWaste = 0;
    let totalCO2e = 0;
    let divertedWaste = 0;
    const wasteByType = {};

    wasteRecords.forEach(record => {
      let weight = record.weight || 0;
      if (record.unit?.unitName === 'Ton') weight *= 1000; // Convert tons to kg
      if (record.unit?.unitName === 'Lb') weight *= 0.453592; // Convert pounds to kg
      totalWaste += weight;
      totalCO2e += record.co2eKg || 0;
      if (['Recycling', 'Composting'].includes(record.disposalMethod)) divertedWaste += weight;

      const typeName = record.wasteType.typeName;
      wasteByType[typeName] = (wasteByType[typeName] || 0) + weight;
    });

    // Calculate waste diversion rate
    const diversionRate = totalWaste > 0 ? (divertedWaste / totalWaste) * 100 : 0;

    // Generate time periods for trends
    const periods = generatePeriods(start, end, period);

    // Initialize maps for trend calculations
    const wasteTrendMap = new Map(periods.map(p => [p, 0]));
    const carbonFootprintMap = new Map(periods.map(p => [p, 0]));
    const diversionRateMap = new Map(periods.map(p => [p, { diverted: 0, total: 0 }]));

    // Populate trend maps
    wasteRecords.forEach(record => {
      const periodKey = getPeriod(record.date, period);
      if (periodKey && wasteTrendMap.has(periodKey)) {
        let weight = record.weight || 0;
        if (record.unit?.unitName === 'Ton') weight *= 1000;
        if (record.unit?.unitName === 'Lb') weight *= 0.453592;
        wasteTrendMap.set(periodKey, wasteTrendMap.get(periodKey) + weight);
        carbonFootprintMap.set(periodKey, carbonFootprintMap.get(periodKey) + (record.co2eKg || 0));
        const current = diversionRateMap.get(periodKey);
        if (['Recycling', 'Composting'].includes(record.disposalMethod)) {
          current.diverted += weight;
        }
        current.total += weight;
      }
    });

    // Format trend data
    const wasteTrendData = periods.map(p => ({ period: p, wasteGenerated: wasteTrendMap.get(p) }));
    const carbonFootprintData = periods.map(p => ({ period: p, emissions: carbonFootprintMap.get(p) }));
    const diversionRateTrend = periods.map(p => {
      const { diverted, total } = diversionRateMap.get(p);
      return { period: p, diversionRate: total > 0 ? (diverted / total) * 100 : 0 };
    });

    // Calculate regression lines
    const wasteRegression = calculateRegressionLine(wasteTrendData.map(d => ({ period: d.period, value: d.wasteGenerated })), period);
    const carbonFootprintRegression = calculateRegressionLine(carbonFootprintData.map(d => ({ period: d.period, value: d.emissions })), period);
    const diversionRateRegression = calculateRegressionLine(diversionRateTrend.map(d => ({ period: d.period, value: d.diversionRate })), period);

    // Return structured KPIs
    return {
      totalWaste,
      totalCO2e,
      diversionRate,
      wasteByType: Object.entries(wasteByType).map(([name, value]) => ({ name, value })),
      wasteTrend: { historical: wasteTrendData, regression: wasteRegression },
      carbonFootprintTrend: { historical: carbonFootprintData, regression: carbonFootprintRegression },
      diversionRateTrend: { historical: diversionRateTrend, regression: diversionRateRegression },
    };
  } catch (error) {
    console.error('Error in getWasteKPIs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

module.exports = { getWasteKPIs };