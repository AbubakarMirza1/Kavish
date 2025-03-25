/***********************************************
 * controllers/generalCrudController.js
 * Controller for reusable CRUD endpoints
 ***********************************************/

const generalCrudService = require('../services/generalCrudService');

// CREATE
async function createRecord(req, res) {
  try {
    const { modelName } = req.params;
    console.log(`createRecord called for model: ${modelName}`);
    const data = req.body;
    const record = await generalCrudService.createRecord(modelName, data);
    return res.status(201).json(record);
  } catch (err) {
    console.error('Error in createRecord:', err);
    return res.status(400).json({ error: err.message });
  }
}

// READ ALL
async function getAllRecords(req, res) {
  try {
    const { modelName } = req.params;
    console.log(`getAllRecords called for model: ${modelName}`);
    const records = await generalCrudService.getAllRecords(modelName);
    return res.json(records);
  } catch (err) {
    console.error('Error in getAllRecords:', err);
    return res.status(400).json({ error: err.message });
  }
}

// READ ONE
async function getRecordById(req, res) {
  try {
    const { modelName, id } = req.params;
    console.log(`getRecordById called with modelName: ${modelName}, id: ${id}`);
    const record = await generalCrudService.getRecordById(modelName, parseInt(id, 10));
    if (!record) {
      return res.status(404).json({ error: 'Record not found' });
    }
    return res.json(record);
  } catch (err) {
    console.error('Error in getRecordById:', err);
    return res.status(400).json({ error: err.message });
  }
}

// UPDATE
async function updateRecord(req, res) {
  try {
    const { modelName, id } = req.params;
    console.log(`updateRecord called with modelName: ${modelName}, id: ${id}`);
    const data = req.body;
    const updated = await generalCrudService.updateRecord(modelName, parseInt(id, 10), data);
    return res.json(updated);
  } catch (err) {
    console.error('Error in updateRecord:', err);
    return res.status(400).json({ error: err.message });
  }
}

// DELETE
async function deleteRecord(req, res) {
  try {
    const { modelName, id } = req.params;
    console.log(`deleteRecord called with modelName: ${modelName}, id: ${id}`);
    const deleted = await generalCrudService.deleteRecord(modelName, parseInt(id, 10));
    return res.json(deleted);
  } catch (err) {
    console.error('Error in deleteRecord:', err);
    return res.status(400).json({ error: err.message });
  }
}

// GET WASTE KPIs
async function getWasteKPIs(req, res) {
  try {
    console.log('getWasteKPIs controller called');
    const { userId, startDate, endDate } = req.query;
    console.log('Received query params:', { userId, startDate, endDate });

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'userId must be a valid integer' });
    }

    const start = new Date(startDate || '2024-01-01');
    const end = new Date(endDate || new Date());
    console.log('Parsed dates:', { start, end });

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate' });
    }

    const kpis = await generalCrudService.getWasteKPIs(parsedUserId, start, end);
    console.log('getWasteKPIs returning response');
    return res.status(200).json(kpis);
  } catch (err) {
    console.error('Error in getWasteKPIs:', err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  createRecord,
  getAllRecords,
  getRecordById,
  updateRecord,
  deleteRecord,
  getWasteKPIs,
};
