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
    const data = req.body;
    const record = await scope3Service.createBusinessTravel(data);
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
    const data = req.body;
    const record = await scope3Service.createWaste(data);
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
