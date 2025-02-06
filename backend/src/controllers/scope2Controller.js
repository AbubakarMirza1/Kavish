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
    const data = req.body;
    const record = await scope2Service.createElectricity(data);
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
    const data = req.body;
    const record = await scope2Service.createSteam(data);
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
