/***********************************************
 * scope1Service.js
 * CRUD operations specifically for Scope 1 tables:
 *  - StationaryCombustion
 *  - MobileSource
 *  - RefrigerationAndAC
 *  - FireSuppression
 *  - PurchasedGas
 * Updated with consistent pagination for all screens
 ***********************************************/

const generalCrudService = require('./generalCrudService');
const { prisma } = require('./generalCrudService');

// ----------------- UTILITY FUNCTIONS -----------------
async function createScopeType(scopeCategory, userId) {
  const scopePrefixes = { Scope1: 1, Scope2: 2, Scope3: 3 };
  const prefix = scopePrefixes[scopeCategory];

  if (!prefix) throw new Error('Invalid scope category');

  const lastScopeType = await prisma.scopeType.findFirst({
    where: { scopeCategory },
    orderBy: { scopeTypeId: 'desc' },
  });

  let nextId;
  if (lastScopeType) {
    let lastId = lastScopeType.scopeTypeId;
    if (lastId % 100 === 99) {
      nextId = (prefix * 1000);
    } else {
      nextId = lastId + 1;
    }
  } else {
    nextId = prefix * 100 + 1;
  }

  return prisma.scopeType.create({
    data: {
      scopeTypeId: nextId,
      scopeCategory,
      userId,
    },
  });
}

async function getFuelTypeByName(typeName) {
  return prisma.fuelType.findFirst({
    where: { typeName },
  });
}

async function getUnitByName(unitName) {
  return prisma.unit.findFirst({
    where: { unitName },
  });
}

async function getVehicleTypeByName(typeName) {
  return prisma.vehicleType.findFirst({
    where: { typeName },
  });
}

async function getEquipmentTypeByName(typeName) {
  return prisma.equipmentType.findFirst({
    where: { typeName },
  });
}

// ----------------- STATIONARY COMBUSTION CRUD -----------------
async function createStationaryCombustion(data) {
  return generalCrudService.createRecord('stationaryCombustion', data);
}

async function getAllStationaryCombustion(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.stationaryCombustion.count(),
    generalCrudService.getAllRecords('stationaryCombustion', {
      skip,
      take: limit,
      include: {
        scopeType: true,
        fuelType: true,
        unit: true,
      },
      orderBy: { date: 'desc' },
    }),
  ]);

  return {
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    records,
  };
}

async function getStationaryCombustionById(id) {
  return generalCrudService.getRecordById('stationaryCombustion', id, 'id');
}

async function updateStationaryCombustion(id, data) {
  return generalCrudService.updateRecord('stationaryCombustion', id, data, 'id');
}

async function deleteStationaryCombustion(id) {
  return generalCrudService.deleteRecord('stationaryCombustion', id, 'id');
}

// ----------------- MOBILE SOURCE CRUD -----------------
async function createMobileSource(data) {
  return generalCrudService.createRecord('mobileSource', data);
}

async function getAllMobileSources(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.mobileSource.count(),
    generalCrudService.getAllRecords('mobileSource', {
      skip,
      take: limit,
      include: {
        scopeType: true,
        vehicleType: true,
        unit: true,
      },
      orderBy: { date: 'desc' },
    }),
  ]);

  return {
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    records,
  };
}

async function getMobileSourceById(id) {
  return generalCrudService.getRecordById('mobileSource', id, 'id');
}

async function updateMobileSource(id, data) {
  return generalCrudService.updateRecord('mobileSource', id, data, 'id');
}

async function deleteMobileSource(id) {
  return generalCrudService.deleteRecord('mobileSource', id, 'id');
}

// ----------------- REFRIGERATION AND AC CRUD -----------------
async function createRefrigerationAndAC(data) {
  return generalCrudService.createRecord('refrigerationAndAC', data);
}

async function getAllRefrigerationAndAC(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.refrigerationAndAC.count(),
    generalCrudService.getAllRecords('refrigerationAndAC', {
      skip,
      take: limit,
      include: {
        scopeType: true,
        equipmentType: true,
        unit: true,
      },
      orderBy: { date: 'desc' },
    }),
  ]);

  return {
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    records,
  };
}

async function getRefrigerationAndACById(id) {
  return generalCrudService.getRecordById('refrigerationAndAC', id, 'id');
}

async function updateRefrigerationAndAC(id, data) {
  return generalCrudService.updateRecord('refrigerationAndAC', id, data, 'id');
}

async function deleteRefrigerationAndAC(id) {
  return generalCrudService.deleteRecord('refrigerationAndAC', id, 'id');
}

// ----------------- FIRE SUPPRESSION CRUD -----------------
async function createFireSuppression(data) {
  return generalCrudService.createRecord('fireSuppression', data);
}

async function getAllFireSuppression(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.fireSuppression.count(),
    generalCrudService.getAllRecords('fireSuppression', {
      skip,
      take: limit,
      include: {
        scopeType: true,
        fuelType: true,
        unit: true,
      },
      orderBy: { date: 'desc' },
    }),
  ]);

  return {
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    records,
  };
}

async function getFireSuppressionById(id) {
  return generalCrudService.getRecordById('fireSuppression', id, 'id');
}

async function updateFireSuppression(id, data) {
  return generalCrudService.updateRecord('fireSuppression', id, data, 'id');
}

async function deleteFireSuppression(id) {
  return generalCrudService.deleteRecord('fireSuppression', id, 'id');
}

// ----------------- PURCHASED GAS CRUD -----------------
async function createPurchasedGas(data) {
  return generalCrudService.createRecord('purchasedGas', data);
}

async function getAllPurchasedGas(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.purchasedGas.count(),
    generalCrudService.getAllRecords('purchasedGas', {
      skip,
      take: limit,
      include: {
        scopeType: true,
        unit: true,
      },
      orderBy: { date: 'desc' },
    }),
  ]);

  return {
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    records,
  };
}

async function getPurchasedGasById(Id) {
  return generalCrudService.getRecordById('purchasedGas', Id, 'Id');
}

async function updatePurchasedGas(Id, data) {
  return generalCrudService.updateRecord('purchasedGas', Id, data, 'Id');
}

async function deletePurchasedGas(Id) {
  return generalCrudService.deleteRecord('purchasedGas', Id, 'Id');
}

module.exports = {
  // Stationary Combustion
  createStationaryCombustion,
  getAllStationaryCombustion,
  getStationaryCombustionById,
  updateStationaryCombustion,
  deleteStationaryCombustion,

  // Mobile Sources
  createMobileSource,
  getAllMobileSources,
  getMobileSourceById,
  updateMobileSource,
  deleteMobileSource,

  // Refrigeration & AC
  createRefrigerationAndAC,
  getAllRefrigerationAndAC,
  getRefrigerationAndACById,
  updateRefrigerationAndAC,
  deleteRefrigerationAndAC,

  // Fire Suppression
  createFireSuppression,
  getAllFireSuppression,
  getFireSuppressionById,
  updateFireSuppression,
  deleteFireSuppression,

  // Purchased Gases
  createPurchasedGas,
  getAllPurchasedGas,
  getPurchasedGasById,
  updatePurchasedGas,
  deletePurchasedGas,

  // Utility Functions
  getFuelTypeByName,
  getUnitByName,
  getVehicleTypeByName,
  createScopeType,
  getEquipmentTypeByName,
};