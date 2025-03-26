/***********************************************
 * services/wasteKPIsService.js
 * Service for calculating Waste Management KPIs
 ***********************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculate Waste Management KPIs.
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - Start date for the data range.
 * @param {Date} endDate - End date for the data range.
 * @returns {Promise<object>} - The calculated KPIs.
 */
async function getWasteKPIs(userId, startDate, endDate) {
  if (userId === undefined || userId === null) {
    throw new Error('userId is missing or invalid.');
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error('userId must be a valid integer.');
  }

  const wasteRecords = await prisma.waste.findMany({
    where: {
      scopeType: { userId: parsedUserId },
      date: { gte: startDate, lte: endDate },
    },
    include: { wasteType: true, unit: true },
  });

  // KPI 1: Total Waste Generated
  const totalWaste = wasteRecords.reduce((sum, record) => {
    let weight = record.weight;
    if (record.unit.unitName === 'Ton') weight *= 1000; // 1 ton = 1000 kg
    if (record.unit.unitName === 'Lb') weight *= 0.453592; // 1 lb = 0.453592 kg
    return sum + weight;
  }, 0);

  // KPI 2: Waste Carbon Footprint
  const totalCO2e = wasteRecords.reduce((sum, record) => sum + record.co2eKg, 0);

  // KPI 3: Waste Diversion Rate
  const divertedWaste = wasteRecords
    .filter(record => ['Recycling', 'Composting'].includes(record.disposalMethod))
    .reduce((sum, record) => {
      let weight = record.weight;
      if (record.unit.unitName === 'Ton') weight *= 1000;
      if (record.unit.unitName === 'Lb') weight *= 0.453592;
      return sum + weight;
    }, 0);
  const diversionRate = totalWaste > 0 ? (divertedWaste / totalWaste) * 100 : 0;

  // KPI 4: Waste by Type
  const wasteByType = wasteRecords.reduce((acc, record) => {
    const typeName = record.wasteType.typeName;
    let weight = record.weight;
    if (record.unit.unitName === 'Ton') weight *= 1000;
    if (record.unit.unitName === 'Lb') weight *= 0.453592;
    acc[typeName] = (acc[typeName] || 0) + weight;
    return acc;
  }, {});

  // Trend data
  const wasteTrendData = [];
  const carbonFootprintData = [];
  const monthYearLabels = [];
  
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const monthYear = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthYearLabels.includes(monthYear)) {
      monthYearLabels.push(monthYear);
    }
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  monthYearLabels.forEach(monthYear => {
    const [month, year] = monthYear.split(' ');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const yearNum = parseInt(year, 10);

    const monthRecords = wasteRecords.filter(record => {
      const recordMonth = record.date.getMonth();
      const recordYear = record.date.getFullYear();
      return recordMonth === monthIndex && recordYear === yearNum;
    });

    const monthlyWaste = monthRecords.reduce((sum, record) => {
      let weight = record.weight;
      if (record.unit.unitName === 'Ton') weight *= 1000;
      if (record.unit.unitName === 'Lb') weight *= 0.453592;
      return sum + weight;
    }, 0);

    const monthlyCO2e = monthRecords.reduce((sum, record) => sum + record.co2eKg, 0);

    wasteTrendData.push({ month: monthYear, wasteGenerated: monthlyWaste });
    carbonFootprintData.push({ month: monthYear, emissions: monthlyCO2e });
  });

  const result = {
    totalWaste: parseFloat(totalWaste.toFixed(2)),
    totalCO2e: parseFloat(totalCO2e.toFixed(2)),
    diversionRate: parseFloat(diversionRate.toFixed(2)),
    wasteByType: Object.entries(wasteByType).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: getRandomColor(),
    })),
    wasteTrendData,
    carbonFootprintData,
  };

  return result;
}

// Helper function for random colors
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = {
  getWasteKPIs,
};
