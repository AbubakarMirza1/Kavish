/***********************************************
 * scope1Service.js
 * CRUD operations specifically for Scope 1 tables:
 *  - StationaryCombustion
 *  - MobileSource
 *  - RefrigerationAndAC
 *  - FireSuppression
 *  - PurchasedGas
 ***********************************************/

const generalCrudService = require('./generalCrudService');

const { prisma } = require('./generalCrudService'); // Import prisma

// You might have different primary keys:
//  - StationaryCombustion => "id"
//  - MobileSource => "id"
//  etc.
// We'll assume "id" or "gasId" for purchasedGas.

//
// STATIONARY COMBUSTION CRUD
//

async function createScopeType(scopeCategory, userId) {
  const lastScopeType = await prisma.scopeType.findFirst({
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

  return prisma.scopeType.create({
    data: {
      scopeTypeId: nextId,
      scopeCategory,
      userId,
      
    },
  });}


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


async function createStationaryCombustion(data) {
  return generalCrudService.createRecord('stationaryCombustion', data);
}

async function getAllStationaryCombustion() {
  return generalCrudService.getAllRecords('stationaryCombustion', {
    include: {
      scopeType: true,
      fuelType: true,
      unit: true,
    },
  });
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

//
// MOBILE SOURCE CRUD
//

async function createMobileSource(data) {
  return generalCrudService.createRecord('mobileSource', data);
}

async function getAllMobileSources() {
  return generalCrudService.getAllRecords('mobileSource');
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

//
// REFRIGERATION AND AC CRUD
//

async function createRefrigerationAndAC(data) {
  return generalCrudService.createRecord('refrigerationAndAC', data);
}

async function getAllRefrigerationAndAC() {
  return generalCrudService.getAllRecords('refrigerationAndAC');
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

//
// FIRE SUPPRESSION CRUD
//

async function createFireSuppression(data) {
  return generalCrudService.createRecord('fireSuppression', data);
}

async function getAllFireSuppression() {
  return generalCrudService.getAllRecords('fireSuppression');
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

//
// PURCHASED GAS CRUD
//

async function createPurchasedGas(data) {
  return generalCrudService.createRecord('purchasedGas', data);
}

async function getAllPurchasedGas() {
  return generalCrudService.getAllRecords('purchasedGas');
}

async function getPurchasedGasById(gasId) {
  return generalCrudService.getRecordById('purchasedGas', gasId, 'gasId');
}

async function updatePurchasedGas(gasId, data) {
  return generalCrudService.updateRecord('purchasedGas', gasId, data, 'gasId');
}

async function deletePurchasedGas(gasId) {
  return generalCrudService.deleteRecord('purchasedGas', gasId, 'gasId');
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



  getFuelTypeByName,
  getUnitByName,
  createScopeType,
};
