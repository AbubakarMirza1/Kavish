/***********************************************
 * scope2Service.js
 * CRUD operations specifically for Scope 2 tables:
 *  - Electricity
 *  - Steam
 * Updated with consistent pagination
 ***********************************************/

const generalCrudService = require('./generalCrudService');
const { prisma } = require('./generalCrudService');

// Default pagination constants
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

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

async function getUnitByName(unitName) {
  return prisma.unit.findFirst({
    where: { unitName },
  });
}

async function getFuelTypeByName(typeName) {
  return prisma.fuelType.findFirst({
    where: { typeName },
  });
}

// ----------------- ELECTRICITY CRUD -----------------
async function createElectricity(data) {
  return prisma.$transaction(async (prisma) => {
    const scopeTypeRecord = await createScopeType('Scope2', 1);
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

async function getAllElectricity(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.electricity.count(),
    prisma.electricity.findMany({
      skip,
      take: limit,
      include: {
        scopeType: true,
        unit: true,
      },
      orderBy: { date: 'desc' }
    })
  ]);
  return {
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    records
  };
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
  return prisma.$transaction(async (prisma) => {
    const scopeTypeRecord = await createScopeType('Scope2', 1);
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

async function getAllSteam(page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
  const skip = (page - 1) * limit;
  const [totalCount, records] = await Promise.all([
    prisma.steam.count(),
    prisma.steam.findMany({
      skip,
      take: limit,
      include: {
        scopeType: true,
        fuelType: true,
        unit: true,
      },
      orderBy: { date: 'desc' }
    })
  ]);
  return {
    totalCount,
    page,
    totalPages: Math.ceil(totalCount / limit),
    records
  };
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