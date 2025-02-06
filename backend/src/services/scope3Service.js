/***********************************************
 * scope3Service.js
 * CRUD operations specifically for Scope 3 tables:
 *  - BusinessTravel
 *  - Waste
 ***********************************************/

const generalCrudService = require('./generalCrudService');

//
// BUSINESS TRAVEL CRUD
//

async function createBusinessTravel(data) {
  return generalCrudService.createRecord('businessTravel', data);
}

async function getAllBusinessTravel() {
  return generalCrudService.getAllRecords('businessTravel');
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

//
// WASTE CRUD
//

async function createWaste(data) {
  return generalCrudService.createRecord('waste', data);
}

async function getAllWaste() {
  return generalCrudService.getAllRecords('waste');
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
};
