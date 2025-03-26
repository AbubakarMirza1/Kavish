/***********************************************
 * services/scope3KPIsService.js
 * Service for calculating Scope 3 KPIs (Business Travel)
 ***********************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculate Scope 3 KPIs for Business Travel.
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - Start date for the data range.
 * @param {Date} endDate - End date for the data range.
 * @returns {Promise<object>} - The calculated KPIs.
 */
async function getScope3KPIs(userId, startDate, endDate) {
  // Validate userId
  if (userId === undefined || userId === null) {
    throw new Error('userId is missing or invalid.');
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error('userId must be a valid integer.');
  }

  // Fetch Business Travel records for Scope 3
  const businessTravelRecords = await prisma.businessTravel.findMany({
    where: {
      scopeType: {
        userId: parsedUserId,
        scopeCategory: 'Scope3',
      },
      date: { gte: startDate, lte: endDate },
    },
    include: { vehicleType: true },
  });

  // GWP factors for N2O and CH4 (IPCC values)
  const GWP_N2O = 298;
  const GWP_CH4 = 25;

  // KPI 1: Total CO2e Emissions from Business Travel
  const totalCO2e = businessTravelRecords.reduce((sum, record) => {
    const co2eFromN2O = (record.n20g * GWP_N2O) / 1000; // Convert grams to kg
    const co2eFromCH4 = (record.ch4g * GWP_CH4) / 1000; // Convert grams to kg
    return sum + record.co2Kg + co2eFromN2O + co2eFromCH4;
  }, 0);

  // KPI 2: Emissions per Mile Traveled
  const totalMiles = businessTravelRecords.reduce((sum, record) => sum + record.vehicleMiles, 0);
  const emissionsPerMile = totalMiles > 0 ? totalCO2e / totalMiles : 0;

  // KPI 3: Emissions by Vehicle Type
  const emissionsByVehicleType = businessTravelRecords.reduce((acc, record) => {
    const typeName = record.vehicleType.typeName;
    const co2eFromN2O = (record.n20g * GWP_N2O) / 1000;
    const co2eFromCH4 = (record.ch4g * GWP_CH4) / 1000;
    const co2e = record.co2Kg + co2eFromN2O + co2eFromCH4;
    acc[typeName] = (acc[typeName] || 0) + co2e;
    return acc;
  }, {});

  // KPI 4: Emissions Trend Over Time
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

    const monthRecords = businessTravelRecords.filter(record => {
      const recordMonth = record.date.getMonth();
      const recordYear = record.date.getFullYear();
      return recordMonth === monthIndex && recordYear === yearNum;
    });

    const monthlyCO2e = monthRecords.reduce((sum, record) => {
      const co2eFromN2O = (record.n20g * GWP_N2O) / 1000;
      const co2eFromCH4 = (record.ch4g * GWP_CH4) / 1000;
      return sum + record.co2Kg + co2eFromN2O + co2eFromCH4;
    }, 0);

    emissionsTrendData.push({ month: monthYear, emissions: monthlyCO2e });
  });

  const result = {
    totalCO2e: parseFloat(totalCO2e.toFixed(2)),
    emissionsPerMile: parseFloat(emissionsPerMile.toFixed(2)),
    emissionsByVehicleType: Object.entries(emissionsByVehicleType).map(([name, value]) => ({
      vehicleType: name,
      emissions: parseFloat(value.toFixed(2)),
      color: getRandomColor(),
    })),
    emissionsTrendData,
  };

  return result;
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
  getScope3KPIs,
};
