const express = require('express');
const router = express.Router();
const WasteKPIsController = require('../controllers/wasteKPIsController');

router.get('/kpis', WasteKPIsController.getKPIs);

module.exports = router;