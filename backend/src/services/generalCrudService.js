/***********************************************
 * services/generalCrudService.js
 * Generic CRUD operations for any table/model.
 * Includes getWasteKPIs for waste management KPIs.
 ***********************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * A map of model names to the corresponding
 * Prisma model client references.
 */
const modelMap = {
  user: prisma.user,
  role: prisma.role,
  scopeType: prisma.scopeType,
  unit: prisma.unit,
  wasteType: prisma.wasteType,
  waste: prisma.waste,
  businessTravel: prisma.businessTravel, // Added to support Business Travel operations
};

/**
 * Retrieve the Prisma model client for a given model name.
 * Throws an error if the model name is invalid.
 * @param {string} modelName - The name of the model.
 * @returns {object} - The Prisma model client.
 * @throws {Error} - If the model name is not found in the modelMap.
 */
function getModelClient(modelName) {
  const client = modelMap[modelName];
  if (!client) {
    throw new Error(`Model "${modelName}" is not defined in modelMap.`);
  }
  return client;
}

/**
 * Create a new record in a given model.
 * @param {string} modelName - The name of the model.
 * @param {object} data - The data for the new record.
 * @returns {Promise<object>} - The created record.
 */
async function createRecord(modelName, data) {
  console.log(`createRecord service called for model: ${modelName}`);
  const model = getModelClient(modelName);

  if (modelName === 'waste') {
    return model.create({
      data: {
        sourceDescription: data.description,
        disposalMethod: data.disposalMethod,
        weight: data.weight,
        co2eKg: data.co2eEmissions,
        date: new Date(),
        scopeType: {
          connect: { scopeTypeId: data.scopeTypeId },
        },
        wasteType: {
          connect: { wasteTypeId: data.wasteTypeId },
        },
        unit: {
          connect: { unitId: data.unitId },
        },
      },
      include: { wasteType: true, unit: true },
    });
  }

  if (modelName === 'businessTravel') {
    return model.create({
      data: {
        sourceDescription: data.sourceDescription,
        vehicleMiles: data.vehicleMiles,
        co2Kg: data.co2Kg,
        ch4g: data.ch4g,
        n20g: data.n20g,
        date: data.date || new Date(), // Use provided date or default to now
        scopeType: {
          connect: { scopeTypeId: data.scopeTypeId },
        },
        vehicleType: {
          connect: { vehicleTypeId: data.vehicleTypeId },
        },
      },
      include: { vehicleType: true, scopeType: true },
    });
  }

  return model.create({ data });
}

/**
 * Get all records from a given model.
 * @param {string} modelName - The name of the model.
 * @param {object} queryOptions - Additional options (e.g., include, where, etc.).
 * @returns {Promise<Array>} - An array of records.
 */
async function getAllRecords(modelName, queryOptions = {}) {
  console.log(`getAllRecords service called for model: ${modelName}`);
  const model = getModelClient(modelName);
  return model.findMany({ ...queryOptions });
}

/**
 * Get a single record by ID.
 * @param {string} modelName - The name of the model.
 * @param {number} id - The ID of the record.
 * @param {string} [keyName="id"] - The name of the primary key field.
 * @returns {Promise<object>} - The record.
 */
async function getRecordById(modelName, id, keyName = 'id') {
  console.log(`getRecordById service called with modelName: ${modelName}, id: ${id}, keyName: ${keyName}`);
  const model = getModelClient(modelName);

  // Validate id
  if (id === undefined || id === null) {
    throw new Error(`Argument \`${keyName}\` is missing or invalid.`);
  }

  // Ensure id is an integer
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error(`Argument \`${keyName}\` must be a valid integer.`);
  }

  return model.findUnique({
    where: {
      [keyName]: parsedId,
    },
  });
}

/**
 * Update a record by ID.
 * @param {string} modelName - The name of the model.
 * @param {number} id - The ID of the record.
 * @param {object} data - The updated data.
 * @param {string} [keyName="id"] - The name of the primary key field.
 * @returns {Promise<object>} - The updated record.
 */
async function updateRecord(modelName, id, data, keyName = 'id') {
  console.log(`updateRecord service called with modelName: ${modelName}, id: ${id}, keyName: ${keyName}`);
  const model = getModelClient(modelName);

  // Validate id
  if (id === undefined || id === null) {
    throw new Error(`Argument \`${keyName}\` is missing or invalid.`);
  }

  // Ensure id is an integer
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error(`Argument \`${keyName}\` must be a valid integer.`);
  }

  return model.update({
    where: {
      [keyName]: parsedId,
    },
    data,
  });
}

/**
 * Delete a record by ID.
 * @param {string} modelName - The name of the model.
 * @param {number} id - The ID of the record.
 * @param {string} [keyName="id"] - The name of the primary key field.
 * @returns {Promise<object>} - The deleted record.
 */
async function deleteRecord(modelName, id, keyName = 'id') {
  console.log(`deleteRecord service called with modelName: ${modelName}, id: ${id}, keyName: ${keyName}`);
  const model = getModelClient(modelName);

  // Validate id
  if (id === undefined || id === null) {
    throw new Error(`Argument \`${keyName}\` is missing or invalid.`);
  }

  // Ensure id is an integer
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    throw new Error(`Argument \`${keyName}\` must be a valid integer.`);
  }

  return model.delete({
    where: {
      [keyName]: parsedId,
    },
  });
}

/**
 * Calculate Waste Management KPIs.
 * @param {number} userId - The ID of the user.
 * @param {Date} startDate - Start date for the data range.
 * @param {Date} endDate - End date for the data range.
 * @returns {Promise<object>} - The calculated KPIs.
 */
async function getWasteKPIs(userId, startDate, endDate) {
  // Validate userId
  if (userId === undefined || userId === null) {
    throw new Error('userId is missing or invalid.');
  }

  // Ensure userId is an integer
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

  // Prepare trend data for Total Waste Generated and Carbon Footprint
  const wasteTrendData = [];
  const carbonFootprintData = [];
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

  // Calculate waste and emissions for each month-year
  monthYearLabels.forEach(monthYear => {
    const [month, year] = monthYear.split(' ');
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth(); // Get month index (0-11)
    const yearNum = parseInt(year, 10);

    const monthRecords = wasteRecords.filter(record => {
      const recordMonth = record.date.getMonth(); // 0-11
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
  prisma,
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getWasteKPIs,
};
