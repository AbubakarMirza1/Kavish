const express = require('express');
const router = express.Router();
const Scope3KPIsController = require('../controllers/scope3KPIsController');

router.get('/kpis', Scope3KPIsController.getKPIs);

module.exports = router;