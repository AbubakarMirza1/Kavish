/***********************************************
 * scope3Service.js
 * CRUD operations specifically for Scope 3 tables:
 *  - BusinessTravel
 *  - Waste
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
  return generalCrudService.prisma.$transaction(async (prisma) => {
      // Create a new ScopeType entry for Scope 2
      const scopeTypeRecord = await createScopeType('Scope3',1);
       // Change this to dynamic userId if needed
        
    
  return generalCrudService.createRecord('businessTravel', {
    scopeTypeId: scopeTypeRecord.scopeTypeId,
    sourceDescription: data.sourceDescription,
    vehicleTypeId: data.vehicleTypeId,
    vehicleMiles: data.vehicleMiles,
    co2Kg: data.co2Kg,
    ch4g: data.ch4g,
    n20g: data.n20g,
    date: data.date,
  });
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
  return generalCrudService.prisma.$transaction(async (prisma) => {
      // Create a new ScopeType entry for Scope 2
      const scopeTypeRecord = await createScopeType('Scope3',1);
       // Change this to dynamic userId if needed
        
    
  return generalCrudService.createRecord('waste', {
    scopeTypeId: scopeTypeRecord.scopeTypeId,
    sourceDescription: data.sourceDescription,
    wasteTypeId: data.wasteTypeId,
    disposalMethod: data.disposalMethod,
    weight: data.weight,
    unitId: data.unitId,
    co2eKg: data.co2eKg,
    date: data.date,
  });
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

  // Utility Functions
  createScopeType,
  getVehicleTypeByName,
  getWasteTypeByName,
  getUnitByName,
};
