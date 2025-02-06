/***********************************************
 * scope2Service.js
 * CRUD operations specifically for Scope 2 tables:
 *  - Electricity
 *  - Steam
 ***********************************************/

const generalCrudService = require('./generalCrudService');

//
// ELECTRICITY CRUD
//

async function createElectricity(data) {
  return generalCrudService.createRecord('electricity', data);
}

async function getAllElectricity() {
  return generalCrudService.getAllRecords('electricity');
}

async function getElectricityById(id) {
  return generalCrudService.getRecordById('electricity', id, 'id');
}

async function updateElectricity(id, data) {
  return generalCrudService.updateRecord('electricity', id, data, 'id');
}

async function deleteElectricity(id) {
  return generalCrudService.deleteRecord('electricity', id, 'id');
}

//
// STEAM CRUD
//

async function createSteam(data) {
  return generalCrudService.createRecord('steam', data);
}

async function getAllSteam() {
  return generalCrudService.getAllRecords('steam');
}

async function getSteamById(id) {
  return generalCrudService.getRecordById('steam', id, 'id');
}

async function updateSteam(id, data) {
  return generalCrudService.updateRecord('steam', id, data, 'id');
}

async function deleteSteam(id) {
  return generalCrudService.deleteRecord('steam', id, 'id');
}

module.exports = {
  // Electricity
  createElectricity,
  getAllElectricity,
  getElectricityById,
  updateElectricity,
  deleteElectricity,

  // Steam
  createSteam,
  getAllSteam,
  getSteamById,
  updateSteam,
  deleteSteam,
};
