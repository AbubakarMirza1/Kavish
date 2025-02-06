/***********************************************
 * generalCrudController.js
 * Controller for reusable CRUD endpoints
 ***********************************************/

const generalCrudService = require('../services/generalCrudService');

// CREATE
async function createRecord(req, res) {
  try {
    const { modelName } = req.params; // e.g. "user", "stationaryCombustion"
    const data = req.body;
    const record = await generalCrudService.createRecord(modelName, data);
    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// READ ALL
async function getAllRecords(req, res) {
  try {
    const { modelName } = req.params;
    const records = await generalCrudService.getAllRecords(modelName);
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// READ ONE
async function getRecordById(req, res) {
  try {
    const { modelName, id } = req.params;
    // The default key we look up is "id", but if your model uses a different key (like "gasId"),
    // you may pass that as a query param or define a custom endpoint.
    const record = await generalCrudService.getRecordById(modelName, parseInt(id, 10));
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// UPDATE
async function updateRecord(req, res) {
  try {
    const { modelName, id } = req.params;
    const data = req.body;
    const updated = await generalCrudService.updateRecord(modelName, parseInt(id, 10), data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// DELETE
async function deleteRecord(req, res) {
  try {
    const { modelName, id } = req.params;
    const deleted = await generalCrudService.deleteRecord(modelName, parseInt(id, 10));
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
};
