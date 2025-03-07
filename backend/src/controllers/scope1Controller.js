/***********************************************
 * scope1Controller.js
 * Controller for Scope 1 CRUD operations
 ***********************************************/

const scope1Service = require('../services/scope1Service');

// ----------------- STATIONARY COMBUSTION -----------------

// async function createStationaryCombustion(req, res) {
//   try {
//     const data = req.body;
//     const record = await scope1Service.createStationaryCombustion(data);
//     return res.status(201).json(record);
//   } catch (err) {
//     return res.status(400).json({ error: err.message });
//   }
// }
// async function createStationaryCombustion(req, res) {
//   try {
//     const { scopeTypeId, sourceDescription, fuelType, quantity, unit, date } = req.body;

//     // Find the fuelTypeId from the FuelType table
//     const fuelTypeRecord = await prisma.fuelType.findFirst({
//       where: { typeName: fuelType },
//     });
//     if (!fuelTypeRecord) {
//       return res.status(400).json({ error: `Fuel type "${fuelType}" not found.` });
//     }

//     // Find the unitId from the Unit table
//     const unitRecord = await prisma.unit.findFirst({
//       where: { unitName: unit },
//     });
//     if (!unitRecord) {
//       return res.status(400).json({ error: `Unit "${unit}" not found.` });
//     }

//     // Ensure the scopeType exists
//     const scopeTypeRecord = await prisma.scopeType.findUnique({
//       where: { scopeTypeId: parseInt(scopeTypeId, 10) },
//     });
//     if (!scopeTypeRecord) {
//       return res.status(400).json({ error: `ScopeType with ID "${scopeTypeId}" not found.` });
//     }

//     // Create the record in the StationaryCombustion table
//     // Call the generic CRUD service
//     const record = await generalCrudService.createRecord('stationaryCombustion', {
//       scopeTypeId: parseInt(scopeTypeId, 10),
//       sourceDescription,
//       fuelType,
//       quantity,
//       unit,
//       date,
//     });


//     return res.status(201).json(record);
//   } catch (err) {
//     return res.status(400).json({ error: err.message });
//   }
// }


async function createStationaryCombustion(req, res) {
  try {
    const { sourceDescription, fuelType, quantity, unit, date } = req.body;

    // Find the fuelTypeId from the FuelType table
    const fuelTypeRecord = await scope1Service.getFuelTypeByName(fuelType);
    if (!fuelTypeRecord) {
      return res.status(400).json({ error: `Fuel type "${fuelType}" not found.` });
    }

    // Find the unitId from the Unit table
    const unitRecord = await scope1Service.getUnitByName(unit);
    if (!unitRecord) {
      return res.status(400).json({ error: `Unit "${unit}" not found.` });
    }

    // Create a new ScopeType entry for Scope 1
    const scopeTypeRecord = await scope1Service.createScopeType('Scope1', 1); // Assuming userId = 1
    //console.log(scopeTypeRecord);

    // Create the StationaryCombustion record
    const record = await scope1Service.createStationaryCombustion({
      
        scopeTypeId: scopeTypeRecord.scopeTypeId,
        sourceDescription,
        fuelTypeId: fuelTypeRecord.fuelTypeId,
        quantity,
        unitId: unitRecord.unitId,
        date: new Date(date),
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
async function getAllStationaryCombustion(req, res) {
  try {
    const records = await scope1Service.getAllStationaryCombustion();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getStationaryCombustionById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope1Service.getStationaryCombustionById(id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateStationaryCombustion(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope1Service.updateStationaryCombustion(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteStationaryCombustion(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope1Service.deleteStationaryCombustion(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- MOBILE SOURCES -----------------

async function createMobileSource(req, res) {
  try {
    const data = req.body;
    const record = await scope1Service.createMobileSource(data);
    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllMobileSources(req, res) {
  try {
    const records = await scope1Service.getAllMobileSources();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getMobileSourceById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope1Service.getMobileSourceById(id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateMobileSource(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope1Service.updateMobileSource(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteMobileSource(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope1Service.deleteMobileSource(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- REFRIGERATION & AC -----------------

async function createRefrigerationAndAC(req, res) {
  try {
    const data = req.body;
    const record = await scope1Service.createRefrigerationAndAC(data);
    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllRefrigerationAndAC(req, res) {
  try {
    const records = await scope1Service.getAllRefrigerationAndAC();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getRefrigerationAndACById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope1Service.getRefrigerationAndACById(id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateRefrigerationAndAC(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope1Service.updateRefrigerationAndAC(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteRefrigerationAndAC(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope1Service.deleteRefrigerationAndAC(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- FIRE SUPPRESSION -----------------

async function createFireSuppression(req, res) {
  try {
    const data = req.body;
    const record = await scope1Service.createFireSuppression(data);
    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllFireSuppression(req, res) {
  try {
    const records = await scope1Service.getAllFireSuppression();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getFireSuppressionById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope1Service.getFireSuppressionById(id);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateFireSuppression(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope1Service.updateFireSuppression(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteFireSuppression(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope1Service.deleteFireSuppression(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- PURCHASED GASES -----------------

async function createPurchasedGas(req, res) {
  try {
    const data = req.body;
    const record = await scope1Service.createPurchasedGas(data);
    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllPurchasedGas(req, res) {
  try {
    const records = await scope1Service.getAllPurchasedGas();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getPurchasedGasById(req, res) {
  try {
    const gasId = parseInt(req.params.gasId, 10);
    const record = await scope1Service.getPurchasedGasById(gasId);
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updatePurchasedGas(req, res) {
  try {
    const gasId = parseInt(req.params.gasId, 10);
    const data = req.body;
    const updated = await scope1Service.updatePurchasedGas(gasId, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deletePurchasedGas(req, res) {
  try {
    const gasId = parseInt(req.params.gasId, 10);
    const deleted = await scope1Service.deletePurchasedGas(gasId);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  // Stationary
  createStationaryCombustion,
  getAllStationaryCombustion,
  getStationaryCombustionById,
  updateStationaryCombustion,
  deleteStationaryCombustion,

  // Mobile
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

  // Purchased Gas
  createPurchasedGas,
  getAllPurchasedGas,
  getPurchasedGasById,
  updatePurchasedGas,
  deletePurchasedGas,
};
