/***********************************************
 * services/scope3Service.js
 * CRUD operations and KPIs for Scope 3 tables:
 *  - BusinessTravel
 *  - Waste
 *  - Scope 3 KPIs
 ***********************************************/

const generalCrudService = require('./generalCrudService');

// ----------------- UTILITY FUNCTIONS -----------------

async function createScopeType(scopeCategory, userId) {
  const lastScopeType = await generalCrudService.prisma.scopeType.findFirst({
    where: { scopeCategory },
    orderBy: { scopeTypeId: 'desc' },
  });

  let nextId;
  if (lastScopeType) {
    const prefix = parseInt(lastScopeType.scopeTypeId.toString()[0]); // Extract the first digit
    const suffix = parseInt(lastScopeType.scopeTypeId.toString().slice(1)); // Extract the rest
    nextId = prefix * 100 + (suffix + 1); // Increment the suffix
  } else {
    // If no records exist for this category, start with 101, 201, or 301
    nextId = scopeCategory === 'Scope1' ? 101 : scopeCategory === 'Scope2' ? 201 : 301;
  }

  return generalCrudService.prisma.scopeType.create({
    data: {
      scopeTypeId: nextId,
      scopeCategory,
      userId,
    },
  });
}

async function getVehicleTypeByName(typeName) {
  return generalCrudService.prisma.vehicleType.findFirst({
    where: { typeName },
  });
}

async function getWasteTypeByName(typeName) {
  return generalCrudService.prisma.wasteType.findFirst({
    where: { typeName },
  });
}

async function getUnitByName(unitName) {
  return generalCrudService.prisma.unit.findFirst({
    where: { unitName },
  });
}

// ----------------- BUSINESS TRAVEL CRUD -----------------

async function createBusinessTravel(data) {
  return generalCrudService.createRecord('businessTravel', {
    scopeTypeId: data.scopeTypeId,
    sourceDescription: data.sourceDescription,
    vehicleTypeId: data.vehicleTypeId,
    vehicleMiles: data.vehicleMiles,
    co2Kg: data.co2Kg,
    ch4g: data.ch4g,
    n20g: data.n20g,
    date: data.date,
  });
}

async function getAllBusinessTravel() {
  return generalCrudService.getAllRecords('businessTravel', {
    include: {
      scopeType: true,
      vehicleType: true,
    },
  });
}

async function getBusinessTravelById(id) {
  return generalCrudService.getRecordById('businessTravel', id, 'id');
}

async function updateBusinessTravel(id, data) {
  return generalCrudService.updateRecord('businessTravel', id, data, 'id');
}

async function deleteBusinessTravel(id) {
  return generalCrudService.deleteRecord('businessTravel', id, 'id');
}

// ----------------- WASTE CRUD -----------------

async function createWaste(data) {
  return generalCrudService.createRecord('waste', {
    scopeTypeId: data.scopeTypeId,
    sourceDescription: data.sourceDescription,
    wasteTypeId: data.wasteTypeId,
    disposalMethod: data.disposalMethod,
    weight: data.weight,
    unitId: data.unitId,
    co2eKg: data.co2eKg,
    date: data.date,
  });
}

async function getAllWaste() {
  return generalCrudService.getAllRecords('waste', {
    include: {
      scopeType: true,
      wasteType: true,
      unit: true,
    },
  });
}

async function getWasteById(id) {
  return generalCrudService.getRecordById('waste', id, 'id');
}

async function updateWaste(id, data) {
  return generalCrudService.updateRecord('waste', id, data, 'id');
}

async function deleteWaste(id) {
  return generalCrudService.deleteRecord('waste', id, 'id');
}

// ----------------- SCOPE 3 KPIs -----------------

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

  // Ensure userId is an integer
  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    throw new Error('userId must be a valid integer.');
  }

  // Fetch Business Travel records for Scope 3
  const businessTravelRecords = await generalCrudService.prisma.businessTravel.findMany({
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
  
  // Generate all month-year labels from startDate to endDate
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const monthYear = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthYearLabels.includes(monthYear)) {
      monthYearLabels.push(monthYear);
    }
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  // Calculate emissions for each month-year
  monthYearLabels.forEach(monthYear => {
    const [month, year] = monthYear.split(' ');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth(); // Get month index (0-11)
    const yearNum = parseInt(year, 10);

    const monthRecords = businessTravelRecords.filter(record => {
      const recordMonth = record.date.getMonth(); // 0-11
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

// Helper function to generate random colors for the charts
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

module.exports = {
  // Business Travel
  createBusinessTravel,
  getAllBusinessTravel,
  getBusinessTravelById,
  updateBusinessTravel,
  deleteBusinessTravel,

  // Waste
  createWaste,
  getAllWaste,
  getWasteById,
  updateWaste,
  deleteWaste,

  // Scope 3 KPIs
  getScope3KPIs,

  // Utility Functions
  createScopeType,
  getVehicleTypeByName,
  getWasteTypeByName,
  getUnitByName,
};
