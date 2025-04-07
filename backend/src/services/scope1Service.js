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

// ----------------- UTILITY FUNCTIONS -----------------

// async function createScopeType(scopeCategory, userId) {
//   const lastScopeType = await prisma.scopeType.findFirst({
//     where: { scopeCategory },
//     orderBy: { scopeTypeId: 'desc' },
//   });

//   let nextId;
//   if (lastScopeType) {
//     const prefix = parseInt(lastScopeType.scopeTypeId.toString()[0]); // Extract the first digit
//     const suffix = parseInt(lastScopeType.scopeTypeId.toString().slice(1)); // Extract the rest
//     if (suffix < 99) {
//     nextId = prefix * 100 + (suffix + 1); // Increment the suffix
//   } else {
//       const base = prefix * 100; // 100 for Scope 1, 200 for Scope 2, etc.
//       const newSuffix = Math.pow(10, lastScopeType.scopeTypeId.toString().length - 2); // Dynamically increase digits
//       nextId = base + newSuffix; // Example: After 199 -> 1000
//   }
//   } else {
//     // If no records exist for this category, start with 101, 201, or 301
//     nextId = scopeCategory === 'Scope1' ? 101 : scopeCategory === 'Scope2' ? 201 : 301;
//   }

//   return prisma.scopeType.create({
//     data: {
//       scopeTypeId: nextId,
//       scopeCategory,
//       userId,
//     },
//   });
// }
async function createScopeType(scopeCategory, userId) {
  const scopePrefixes = { Scope1: 1, Scope2: 2, Scope3: 3 };
  const prefix = scopePrefixes[scopeCategory];

  if (!prefix) throw new Error('Invalid scope category');

  // Find the latest scopeTypeId for the given category
  const lastScopeType = await prisma.scopeType.findFirst({
    where: { scopeCategory },
    orderBy: { scopeTypeId: 'desc' },
  });

  let nextId;
  if (lastScopeType) {
    let lastId = lastScopeType.scopeTypeId;

    // If the last ID has reached its range max (e.g., 199 for Scope1)
    if (lastId % 100 === 99) {
      nextId = (prefix * 1000); // Move to the next thousand (e.g., 1000, 2000, 3000)
    } else {
      nextId = lastId + 1; // Otherwise, just increment normally
    }
  } else {
    // If no records exist, start at 101, 201, or 301
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

// async function getAllStationaryCombustion() {
//   return generalCrudService.getAllRecords('stationaryCombustion', {
//     include: {
//       scopeType: true,
//       fuelType: true,
//       unit: true,
//     },
//   });
// }
async function getAllStationaryCombustion(page = 1, limit = 10) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const [totalCount, records] = await Promise.all([
    prisma.stationaryCombustion.count(),
    generalCrudService.getAllRecords('stationaryCombustion', {
      skip,
      take,
      include: {
        scopeType: true,
        fuelType: true,
        unit: true,
      },
      orderBy: {
        date: 'desc',
      },
    }),
  ]);

  return {
    totalCount,
    page: parseInt(page),
    totalPages: Math.ceil(totalCount / take),
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
   return generalCrudService.createRecord('mobileSource',data);
  //   data: {
  //     scopeTypeId: data.scopeTypeId,
  //     sourceDescription: data.sourceDescription,
  //     vehicleTypeId: data.vehicleTypeId,
  //     fuelUsage: data.fuelUsage,
  //     unitId: data.unitId,
  //     milesTravelled: data.milesTravelled,
  //   },
  // }
  
}

async function getAllMobileSources() {
  return generalCrudService.getAllRecords('mobileSource', {
    include: {
      scopeType: true,
      vehicleType: true,
      unit: true,
    },
  });
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

async function getAllRefrigerationAndAC() {
  return generalCrudService.getAllRecords('refrigerationAndAC',{
    include: {
    scopeType: true,
    equipmentType: true,
    unit: true,
  },
});
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

async function getAllFireSuppression() {
  return generalCrudService.getAllRecords('fireSuppression', {
    
      include: {
        scopeType: true,
        fuelType: true,
        unit: true,
      },
    });
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

async function getAllPurchasedGas() {
  return generalCrudService.getAllRecords('purchasedGas', {
       include: {
        scopeType: true,
        unit: true,
      },
    });
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
