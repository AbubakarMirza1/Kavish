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
 * @param {string} modelName - The name of the model (key of modelMap).
 * @param {object} data - The data for the new record.
 * @returns {Promise<object>} - The created record.
 */
async function createRecord(modelName, data) {
  const model = getModelClient(modelName);

  // Handle specific models with relationships
  switch (modelName) {
    case 'stationaryCombustion':
      return model.create({
        data: {
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

    case 'mobileSource':
      return model.create({
        data: {
          sourceDescription: data.sourceDescription,
         // vehicleTypeId: data.vehicleTypeId,
          fuelUsage: data.fuelUsage,
          // unitId: data.unitId,
          milesTravelled: data.milesTravelled,
          date: data.date,
          scopeType: {
            connect: { scopeTypeId: data.scopeTypeId }, // Connect to an existing ScopeType
          },
          vehicleType: {
            connect: { vehicleTypeId: data.vehicleTypeId }, // Connect to an existing Unit
          },
          unit: {
            connect: { unitId: data.unitId }, // Connect to an existing Unit
          },
        },
      });

    case 'refrigerationAndAC':
      return model.create({
        data: {
          sourceDescription: data.sourceDescription,
          equipmentTypeId: data.equipmentTypeId,
          gas: data.gas,
          gwp: data.gwp,
          unitId: data.unitId,
          co2eKg: data.co2eKg,
          date: data.date,
          scopeType: {
            connect: { scopeTypeId: data.scopeTypeId }, // Connect to an existing ScopeType
          },
        },
      });

    case 'fireSuppression':
      return model.create({
        data: {
          sourceDescription: data.sourceDescription,
          fuelTypeId: data.fuelTypeId,
          unitId: data.unitId,
          co2eKg: data.co2eKg,
          date: data.date,
          scopeType: {
            connect: { scopeTypeId: data.scopeTypeId }, // Connect to an existing ScopeType
          },
        },
      });

    case 'purchasedGas':
      return model.create({
        data: {
          purchasedAmount: data.purchasedAmount,
          unitId: data.unitId,
          date: data.date,
          scopeType: {
            connect: { scopeTypeId: data.scopeTypeId }, // Connect to an existing ScopeType
          },
        },
      });

    // Default behavior for other models
    default:
      return model.create({ data });
  }
}

/**
 * Get all records from a given model.
 * @param {string} modelName - The name of the model.
 * @param {object} queryOptions - Additional options (e.g., include, where, etc.).
 * @returns {Promise<Array>} - An array of records.
 */
async function getAllRecords(modelName, queryOptions = {}) {
  const model = getModelClient(modelName);
  return model.findMany({ ...queryOptions });
}

/**
 * Get a single record by ID (defaults to `id` field).
 * If your primary key is different (e.g., userId),
 * pass keyName as well.
 * @param {string} modelName - The name of the model.
 * @param {number} id - The ID of the record.
 * @param {string} [keyName="id"] - The name of the primary key field.
 * @returns {Promise<object>} - The record.
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
 * @param {string} modelName - The name of the model.
 * @param {number} id - The ID of the record.
 * @param {object} data - The updated data.
 * @param {string} [keyName="id"] - The name of the primary key field.
 * @returns {Promise<object>} - The updated record.
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
 * @param {string} modelName - The name of the model.
 * @param {number} id - The ID of the record.
 * @param {string} [keyName="id"] - The name of the primary key field.
 * @returns {Promise<object>} - The deleted record.
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
