/***********************************************
 * services/scope2KPIsService.js
 * Service for calculating Scope 2 KPIs (Electricity and Steam)
 ***********************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculate Scope 2 KPIs for Electricity and Steam.
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - Start date for the data range.
 * @param {Date} endDate - End date for the data range.
 * @returns {Promise<object>} - The calculated KPIs.
 */
async function getScope2KPIs(userId, startDate, endDate) {
  // Validate userId
  if (userId === undefined || userId === null) {
    throw new Error('userId is missing or invalid.');
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error('userId must be a valid integer.');
  }

  // Fetch Electricity and Steam records for Scope 2
  const [electricityRecords, steamRecords] = await Promise.all([
    prisma.electricity.findMany({
      where: {
        scopeType: {
          userId: parsedUserId,
          scopeCategory: 'Scope2',
        },
        date: { gte: startDate, lte: endDate },
      },
      include: { unit: true },
    }),
    prisma.steam.findMany({
      where: {
        scopeType: {
          userId: parsedUserId,
          scopeCategory: 'Scope2',
        },
        date: { gte: startDate, lte: endDate },
      },
      include: { fuelType: true, unit: true },
    })
  ]);

  // KPI 1: Total CO2e Emissions from Electricity
  const totalElectricityCO2e = electricityRecords.reduce((sum, record) => {
    return sum + record.co2eKg;
  }, 0);

  // KPI 2: Total CO2e Emissions from Steam
  const totalSteamCO2e = steamRecords.reduce((sum, record) => {
    return sum + record.co2Kg;
  }, 0);

  // KPI 3: Combined Total CO2e
  const totalCO2e = totalElectricityCO2e + totalSteamCO2e;

  // KPI 4: Emissions per Area (Electricity)
  const totalElectricityArea = electricityRecords.reduce((sum, record) => sum + record.areaSqFt, 0);
  const emissionsPerSqFt = totalElectricityArea > 0 ? totalElectricityCO2e / totalElectricityArea : 0;

  // KPI 5: Emissions Breakdown by Source
  const emissionsBreakdown = [
    { name: 'Electricity', value: totalElectricityCO2e, color: getRandomColor() },
    { name: 'Steam', value: totalSteamCO2e, color: getRandomColor() }
  ];

  // KPI 6: Emissions Trend Over Time
  const emissionsTrendData = [];
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

    const electricityMonthly = electricityRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === monthIndex && recordDate.getFullYear() === yearNum;
    }).reduce((sum, record) => sum + record.co2eKg, 0);

    const steamMonthly = steamRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate.getMonth() === monthIndex && recordDate.getFullYear() === yearNum;
    }).reduce((sum, record) => sum + record.co2Kg, 0);

    emissionsTrendData.push({
      month: monthYear,
      electricity: electricityMonthly,
      steam: steamMonthly,
      total: electricityMonthly + steamMonthly
    });
  });

  return {
    totalCO2e: parseFloat(totalCO2e.toFixed(2)),
    totalElectricityCO2e: parseFloat(totalElectricityCO2e.toFixed(2)),
    totalSteamCO2e: parseFloat(totalSteamCO2e.toFixed(2)),
    emissionsPerSqFt: parseFloat(emissionsPerSqFt.toFixed(2)),
    emissionsBreakdown,
    emissionsTrendData,
  };
}

// Helper function to generate random colors for charts
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = {
  getScope2KPIs,
};
