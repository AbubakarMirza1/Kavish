/***********************************************
 * scope2Service.js
 * CRUD operations specifically for Scope 2 tables:
 *  - Electricity
 *  - Steam
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

async function getUnitByName(unitName) {
  return generalCrudService.prisma.unit.findFirst({
    where: { unitName },
  });
}

async function getFuelTypeByName(typeName) {
  return generalCrudService.prisma.fuelType.findFirst({
    where: { typeName },
  });
}

// ----------------- ELECTRICITY CRUD -----------------

async function createElectricity(data) {
  return generalCrudService.prisma.$transaction(async (prisma) => {
    // Create a new ScopeType entry for Scope 2
    const scopeTypeRecord = await createScopeType('Scope2',1);
     // Change this to dynamic userId if needed
      
  
  return generalCrudService.createRecord('electricity', {
    scopeTypeId: scopeTypeRecord.scopeTypeId,
    description: data.description,
    areaSqFt: data.areaSqFt,
    unitId: data.unitId,
    co2eKg: data.co2eKg,
    ch4Kg: data.ch4Kg,
    n20Kg: data.n20Kg,
    date: data.date,
  });
});
}

async function getAllElectricity() {
  return generalCrudService.getAllRecords('electricity', {
    include: {
      scopeType: true,
      unit: true,
    },
  });
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

// ----------------- STEAM CRUD -----------------

async function createSteam(data) {
  return generalCrudService.prisma.$transaction(async (prisma) => {
    // Create a new ScopeType entry for Scope 2
    const scopeTypeRecord = await createScopeType('Scope2',1);
     // Change this to dynamic userId if needed
  return generalCrudService.createRecord('steam', {
    scopeTypeId: scopeTypeRecord.scopeTypeId,
    sourceDescription: data.sourceDescription,
    sourceArea: data.sourceArea,
    fuelTypeId: data.fuelTypeId,
    boilerEfficiency: data.boilerEfficiency,
    steamPurchasedKwh: data.steamPurchasedKwh,
    co2Kg: data.co2Kg,
    ch4g: data.ch4g,
    n20g: data.n20g,
    unitId: data.unitId,
    date: data.date,
  });
});
}

async function getAllSteam() {
  return generalCrudService.getAllRecords('steam', {
    include: {
      scopeType: true,
      fuelType: true,
      unit: true,
    },
  });
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

  // Utility Functions
  createScopeType,
  getUnitByName,
  getFuelTypeByName,
};
