/***********************************************
 * generalCrudService.js
 * Generic CRUD operations for any table/model.
 ***********************************************/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * A map of model names to the corresponding
 * Prisma model client references.
 * Extend this map with all your models.
 */
const modelMap = {
  user: prisma.user,
  role: prisma.role,
  scopeType: prisma.scopeType,
  unit: prisma.unit,
  fuelType: prisma.fuelType,
  vehicleType: prisma.vehicleType,
  equipmentType: prisma.equipmentType,
  wasteType: prisma.wasteType,
  stationaryCombustion: prisma.stationaryCombustion,
  mobileSource: prisma.mobileSource,
  refrigerationAndAC: prisma.refrigerationAndAC,
  fireSuppression: prisma.fireSuppression,
  purchasedGas: prisma.purchasedGas,
  electricity: prisma.electricity,
  steam: prisma.steam,
  businessTravel: prisma.businessTravel,
  waste: prisma.waste,
};

/**
 * Retrieve the Prisma model client for a given model name.
 * Throws an error if the model name is invalid.
 * @param {string} modelName
 * @returns {object} Prisma model client
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
 * @param {string} modelName - Name of the model (key of modelMap).
 * @param {object} data - Data for the new record.
 */
// async function createRecord(modelName, data) {
//   const model = getModelClient(modelName);
//   return model.create({ data });
// }
async function createRecord(modelName, data) {
  const model = getModelClient(modelName);

  // Check if modelName is 'stationaryCombustion' and handle scopeType relationship
  if (modelName === 'stationaryCombustion') {
    return model.create({
      data: {
        //...data
        sourceDescription: data.sourceDescription,
        quantity: data.quantity,
        date: data.date,
        scopeType: {
          connect: { scopeTypeId: data.scopeTypeId }, // Connect to an existing ScopeType
        },
        fuelType: {
          connect: { fuelTypeId: data.fuelTypeId }, // Connect to an existing FuelType
        },
        unit: {
          connect: { unitId: data.unitId }, // Connect to an existing Unit
        },
      },
    });
  }

  if (modelName === 'mobileSource') {
    return model.create({
      data: {
        sourceDescription: data.sourceDescription,
        vehicleType: {
          connect: { vehicleTypeId: data.vehicleTypeId }, // Connect to an existing VehicleType
        },
        fuelUsage: data.fuelUsage,
        unit: {
          connect: { unitId: data.unitId }, // Connect to an existing Unit
        },
        milesTravelled: data.milesTravelled,
        scopeType: {
          connect: { scopeTypeId: data.scopeTypeId }, // Connect to an existing ScopeType
        },
      },
    });
  }

  // Default behavior for other models
  return model.create({ data });
}


/**
 * Get all records from a given model.
 * @param {string} modelName
 * @param {object} queryOptions - Additional options (e.g., include, where, etc.)
 */
async function getAllRecords(modelName, queryOptions = {}) {
  const model = getModelClient(modelName);
  return model.findMany({ ...queryOptions });
}

/**
 * Get a single record by ID (defaults to `id` field).
 * If your primary key is different (e.g., userId),
 * pass keyName as well.
 * @param {string} modelName
 * @param {number} id
 * @param {string} [keyName="id"]
 */
async function getRecordById(modelName, id, keyName = 'id') {
  const model = getModelClient(modelName);
  return model.findUnique({
    where: {
      [keyName]: id,
    },
  });
}

/**
 * Update a record by ID (defaults to `id` field).
 * @param {string} modelName
 * @param {number} id
 * @param {object} data - Updated data
 * @param {string} [keyName="id"]
 */
async function updateRecord(modelName, id, data, keyName = 'id') {
  const model = getModelClient(modelName);
  return model.update({
    where: {
      [keyName]: id,
    },
    data,
  });
}

/**
 * Delete a record by ID (defaults to `id` field).
 * @param {string} modelName
 * @param {number} id
 * @param {string} [keyName="id"]
 */
async function deleteRecord(modelName, id, keyName = 'id') {
  const model = getModelClient(modelName);
  return model.delete({
    where: {
      [keyName]: id,
    },
  });
}

module.exports = {
  prisma,
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
