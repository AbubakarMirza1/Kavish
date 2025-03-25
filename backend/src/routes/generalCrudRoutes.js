/***********************************************
 * routes/generalCrudRoutes.js
 * Routes for reusable CRUD endpoints
 ***********************************************/

const express = require('express');
const router = express.Router();
const generalCrudController = require('../controllers/generalCrudController');

// Middleware to validate the `id` parameter
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id, 10))) {
    return res.status(400).json({ error: 'Argument `id` must be a valid integer.' });
  }
  next();
};

// Specific routes should come first
router.get('/waste/kpis', generalCrudController.getWasteKPIs);

// Generic CRUD routes (with :modelName and :id) should come after specific routes
router.post('/:modelName', generalCrudController.createRecord);

router.get('/:modelName', generalCrudController.getAllRecords);

router.get('/:modelName/:id', validateId, generalCrudController.getRecordById);

router.put('/:modelName/:id', validateId, generalCrudController.updateRecord);

router.delete('/:modelName/:id', validateId, generalCrudController.deleteRecord);

module.exports = router;
