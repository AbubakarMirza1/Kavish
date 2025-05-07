/***********************************************
 * scope3Service.js
 * CRUD operations specifically for Scope 3 tables:
 *  - BusinessTravel
 *  - Waste
 * Updated with pagination support
 ***********************************************/

const generalCrudService = require('./generalCrudService');
const { prisma } = require('./generalCrudService');

// ----------------- UTILITY FUNCTIONS -----------------
async function createScopeType(scopeCategory, userId) {
  const lastScopeType = await prisma.scopeType.findFirst({
    where: { scopeCategory },
    orderBy: { scopeTypeId: 'desc' },
  });

  let nextId;
  if (lastScopeType) {
    const prefix = parseInt(lastScopeType.scopeTypeId.toString()[0]);
    const suffix = parseInt(lastScopeType.scopeTypeId.toString().slice(1));
    nextId = prefix * 100 + (suffix + 1);
  } else {
    nextId = scopeCategory === 'Scope1' ? 101 : scopeCategory === 'Scope2' ? 201 : 301;
  }

  return prisma.scopeType.create({
    data: {
      scopeTypeId: nextId,
      scopeCategory,
      userId,
    },
  });
}

async function getVehicleTypeByName(typeName) {
  return prisma.vehicleType.findFirst({
    where: { typeName },
  });
}

async function getWasteTypeByName(typeName) {
  return prisma.wasteType.findFirst({
    where: { typeName },
  });
}

async function getUnitByName(unitName) {
  return prisma.unit.findFirst({
    where: { unitName },
  });
}

// ----------------- BUSINESS TRAVEL CRUD -----------------
async function createBusinessTravel(data) {
  return prisma.$transaction(async (prisma) => {
    const scopeTypeRecord = await createScopeType('Scope3', 4);
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

async function getAllBusinessTravel(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.businessTravel.count(),
    prisma.businessTravel.findMany({
      skip,
      take: limit,
      include: {
        scopeType: true,
        vehicleType: true,
      },
      orderBy: { date: 'desc' }
    })
  ]);
  return { totalCount, page, totalPages: Math.ceil(totalCount / limit), records };
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
  return prisma.$transaction(async (prisma) => {
    const scopeTypeRecord = await createScopeType('Scope3', 3);
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

async function getAllWaste(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.waste.count(),
    prisma.waste.findMany({
      skip,
      take: limit,
      include: {
        scopeType: true,
        wasteType: true,
        unit: true,
      },
      orderBy: { date: 'desc' }
    })
  ]);
  return { totalCount, page, totalPages: Math.ceil(totalCount / limit), records };
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
