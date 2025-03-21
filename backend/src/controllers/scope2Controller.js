/***********************************************
 * scope2Controller.js
 * Controller for Scope 2 CRUD operations:
 *  - Electricity
 *  - Steam
 ***********************************************/

const scope2Service = require('../services/scope2Service');

// ----------------- ELECTRICITY -----------------
async function createElectricity(req, res) {
  try {
    const { description, areaSqFt, unit, co2eKg, ch4Kg, n20Kg, date } = req.body;

    // Find the unitId from the Unit table
    const unitRecord = await scope2Service.getUnitByName(unit);
    if (!unitRecord) {
      return res.status(400).json({ error: `Unit "${unit}" not found.` });
    }

    // Create a new ScopeType entry for Scope 2
    //const scopeTypeRecord = await scope2Service.createScopeType('Scope2', 1); // Assuming userId = 1

    // Create the Electricity record
    const record = await scope2Service.createElectricity({
      //scopeTypeId: scopeTypeRecord.scopeTypeId,
      description,
      areaSqFt,
      unitId: unitRecord.unitId,
      co2eKg,
      ch4Kg,
      n20Kg,
      date: new Date(date),
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllElectricity(req, res) {
  try {
    const records = await scope2Service.getAllElectricity();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getElectricityById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope2Service.getElectricityById(id);
    if (!record) {
      return res.status(404).json({ error: 'Electricity record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateElectricity(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope2Service.updateElectricity(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteElectricity(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope2Service.deleteElectricity(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- STEAM -----------------
async function createSteam(req, res) {
  try {
    const { sourceDescription, sourceArea, fuelType, boilerEfficiency, steamPurchasedKwh, co2Kg, ch4g, n20g, unit, date } = req.body;

    // Find the fuelTypeId from the FuelType table
    const fuelTypeRecord = await scope2Service.getFuelTypeByName(fuelType);
    if (!fuelTypeRecord) {
      return res.status(400).json({ error: `Fuel type "${fuelType}" not found.` });
    }

    // Find the unitId from the Unit table
    const unitRecord = await scope2Service.getUnitByName(unit);
    if (!unitRecord) {
      return res.status(400).json({ error: `Unit "${unit}" not found.` });
    }

    // Create a new ScopeType entry for Scope 2
    // const scopeTypeRecord = await scope2Service.createScopeType('Scope2', 1); // Assuming userId = 1

    // Create the Steam record
    const record = await scope2Service.createSteam({
      // scopeTypeId: scopeTypeRecord.scopeTypeId,
      sourceDescription,
      sourceArea,
      fuelTypeId: fuelTypeRecord.fuelTypeId,
      boilerEfficiency,
      steamPurchasedKwh,
      co2Kg,
      ch4g,
      n20g,
      unitId: unitRecord.unitId,
      date: new Date(date),
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllSteam(req, res) {
  try {
    const records = await scope2Service.getAllSteam();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getSteamById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope2Service.getSteamById(id);
    if (!record) {
      return res.status(404).json({ error: 'Steam record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateSteam(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope2Service.updateSteam(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteSteam(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope2Service.deleteSteam(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
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
