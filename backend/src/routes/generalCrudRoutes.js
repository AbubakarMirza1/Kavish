const express = require('express');
const router = express.Router();
const generalCrudController = require('../controllers/generalCrudController');

router.post('/:modelName', generalCrudController.createRecord);
router.get('/:modelName', generalCrudController.getAllRecords);
router.get('/:modelName/:id', generalCrudController.getRecordById);
router.put('/:modelName/:id', generalCrudController.updateRecord);
router.delete('/:modelName/:id', generalCrudController.deleteRecord);

module.exports = router;
