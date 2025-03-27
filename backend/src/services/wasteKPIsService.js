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
  console.log('Inside getWasteKPIs with params:', { userId, startDate, endDate });
  try {
    if (userId === undefined || userId === null) {
      console.log('userId is missing or invalid');
      throw new Error('userId is missing or invalid.');
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.log('userId is not a valid integer:', userId);
      throw new Error('userId must be a valid integer.');
    }

    if (!(startDate instanceof Date) || isNaN(startDate)) {
      console.log('startDate is invalid:', startDate);
      throw new Error('startDate must be a valid Date.');
    }

    if (!(endDate instanceof Date) || isNaN(endDate)) {
      console.log('endDate is invalid:', endDate);
      throw new Error('endDate must be a valid Date.');
    }

    console.log('Fetching waste records for userId:', parsedUserId);
    console.log('Date range:', startDate.toISOString(), 'to', endDate.toISOString());

    // Test the database connection by fetching a single record
    const testRecord = await prisma.waste.findFirst();
    console.log('Test record from Waste table:', testRecord);

    // Fetch waste records for the specific user through the scopeType relation
    const allWasteRecords = await prisma.waste.findMany({
      where: {
        scopeType: {
          userId: parsedUserId,
        },
      },
      include: {
        wasteType: true,
        unit: true,
      },
    });

    console.log('Total waste records in database for user:', allWasteRecords.length);
    console.log('All waste records:', JSON.stringify(allWasteRecords, null, 2));

    // Filter records by date in JavaScript
    const wasteRecords = allWasteRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    console.log('Number of waste records found after date filter:', wasteRecords.length);
    console.log('Filtered waste records:', JSON.stringify(wasteRecords, null, 2));

    if (wasteRecords.length === 0) {
      console.warn('No waste records found in the specified date range. Returning default response.');
      return {
        totalWaste: 0,
        totalCO2e: 0,
        diversionRate: 0,
        wasteByType: [],
        wasteTrendData: [],
        carbonFootprintData: [],
      };
    }

    // KPI 1: Total Waste Generated
    const totalWaste = wasteRecords.reduce((sum, record) => {
      let weight = record.weight || 0;
      if (record.unit?.unitName === 'Ton') weight *= 1000; // 1 ton = 1000 kg
      if (record.unit?.unitName === 'Lb') weight *= 0.453592; // 1 lb = 0.453592 kg
      return sum + weight;
    }, 0);

    console.log('Calculated totalWaste:', totalWaste);

    // KPI 2: Waste Carbon Footprint
    const totalCO2e = wasteRecords.reduce((sum, record) => sum + (record.co2eKg || 0), 0);

    console.log('Calculated totalCO2e:', totalCO2e);

    // KPI 3: Waste Diversion Rate
    const divertedWaste = wasteRecords
      .filter(record => ['Recycling', 'Composting'].includes(record.disposalMethod))
      .reduce((sum, record) => {
        let weight = record.weight || 0;
        if (record.unit?.unitName === 'Ton') weight *= 1000;
        if (record.unit?.unitName === 'Lb') weight *= 0.453592;
        return sum + weight;
      }, 0);
    const diversionRate = totalWaste > 0 ? (divertedWaste / totalWaste) * 100 : 0;

    console.log('Calculated divertedWaste:', divertedWaste);
    console.log('Calculated diversionRate:', diversionRate);

    // KPI 4: Waste by Type
    const wasteByType = wasteRecords.reduce((acc, record) => {
      const typeName = record.wasteType?.typeName || 'Unknown'; // Fallback if wasteType is null
      let weight = record.weight || 0;
      if (record.unit?.unitName === 'Ton') weight *= 1000;
      if (record.unit?.unitName === 'Lb') weight *= 0.453592;
      acc[typeName] = (acc[typeName] || 0) + weight;
      return acc;
    }, {});

    console.log('Calculated wasteByType (before mapping):', wasteByType);

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

    console.log('Month-year labels:', monthYearLabels);

    monthYearLabels.forEach(monthYear => {
      const [month, year] = monthYear.split(' ');
      const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
      const yearNum = parseInt(year, 10);

      const monthRecords = wasteRecords.filter(record => {
        const recordDate = new Date(record.date);
        const recordMonth = recordDate.getMonth();
        const recordYear = recordDate.getFullYear();
        return recordMonth === monthIndex && recordYear === yearNum;
      });

      const monthlyWaste = monthRecords.reduce((sum, record) => {
        let weight = record.weight || 0;
        if (record.unit?.unitName === 'Ton') weight *= 1000;
        if (record.unit?.unitName === 'Lb') weight *= 0.453592;
        return sum + weight;
      }, 0);

      const monthlyCO2e = monthRecords.reduce((sum, record) => sum + (record.co2eKg || 0), 0);

      wasteTrendData.push({ month: monthYear, wasteGenerated: monthlyWaste });
      carbonFootprintData.push({ month: monthYear, emissions: monthlyCO2e });
    });

    console.log('Calculated wasteTrendData:', wasteTrendData);
    console.log('Calculated carbonFootprintData:', carbonFootprintData);

    const result = {
      totalWaste: parseFloat(totalWaste.toFixed(2)) || 0,
      totalCO2e: parseFloat(totalCO2e.toFixed(2)) || 0,
      diversionRate: parseFloat(diversionRate.toFixed(2)) || 0,
      wasteByType: Object.entries(wasteByType).map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2)) || 0,
        color: getRandomColor(),
      })) || [],
      wasteTrendData: wasteTrendData || [],
      carbonFootprintData: carbonFootprintData || [],
    };

    console.log('Returning KPI data:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error in getWasteKPIs:', error.message);
    throw error; // Let the controller handle the error
  } finally {
    await prisma.$disconnect();
  }
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
