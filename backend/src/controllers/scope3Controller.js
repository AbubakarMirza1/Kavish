/***********************************************
 * scope3Controller.js
 * Controller for Scope 3 CRUD operations:
 *  - BusinessTravel
 *  - Waste
 ***********************************************/

const scope3Service = require('../services/scope3Service');

// ----------------- BUSINESS TRAVEL -----------------
async function createBusinessTravel(req, res) {
  try {
    const { sourceDescription, vehicleType, vehicleMiles, co2Kg, ch4g, n20g, date } = req.body;

    // Find the vehicleTypeId from the VehicleType table
    const vehicleTypeRecord = await scope3Service.getVehicleTypeByName(vehicleType);
    if (!vehicleTypeRecord) {
      return res.status(400).json({ error: `Vehicle type "${vehicleType}" not found.` });
    }

    // Create a new ScopeType entry for Scope 3
   // const scopeTypeRecord = await scope3Service.createScopeType('Scope3', 1); // Assuming userId = 1

    // Create the BusinessTravel record
    const record = await scope3Service.createBusinessTravel({
      // scopeTypeId: scopeTypeRecord.scopeTypeId,
      sourceDescription,
      vehicleTypeId: vehicleTypeRecord.vehicleTypeId,
      vehicleMiles,
      co2Kg,
      ch4g,
      n20g,
      date: new Date(date),
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllBusinessTravel(req, res) {
  try {
    const records = await scope3Service.getAllBusinessTravel();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getBusinessTravelById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope3Service.getBusinessTravelById(id);
    if (!record) {
      return res.status(404).json({ error: 'Business Travel record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateBusinessTravel(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope3Service.updateBusinessTravel(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteBusinessTravel(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope3Service.deleteBusinessTravel(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- WASTE -----------------
async function createWaste(req, res) {
  try {
    const { sourceDescription, wasteType, disposalMethod, weight, unit, co2eKg, date } = req.body;

    // Find the wasteTypeId from the WasteType table
    const wasteTypeRecord = await scope3Service.getWasteTypeByName(wasteType);
    if (!wasteTypeRecord) {
      return res.status(400).json({ error: `Waste type "${wasteType}" not found.` });
    }

    // Find the unitId from the Unit table
    const unitRecord = await scope3Service.getUnitByName(unit);
    if (!unitRecord) {
      return res.status(400).json({ error: `Unit "${unit}" not found.` });
    }

    // Create a new ScopeType entry for Scope 3
    // const scopeTypeRecord = await scope3Service.createScopeType('Scope3', 1); // Assuming userId = 1

    // Create the Waste record
    const record = await scope3Service.createWaste({
      // scopeTypeId: scopeTypeRecord.scopeTypeId,
      sourceDescription,
      wasteTypeId: wasteTypeRecord.wasteTypeId,
      disposalMethod,
      weight,
      unitId: unitRecord.unitId,
      co2eKg,
      date: new Date(date),
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllWaste(req, res) {
  try {
    const records = await scope3Service.getAllWaste();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getWasteById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope3Service.getWasteById(id);
    if (!record) {
      return res.status(404).json({ error: 'Waste record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateWaste(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope3Service.updateWaste(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteWaste(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope3Service.deleteWaste(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
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
