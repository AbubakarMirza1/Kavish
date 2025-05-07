const express = require('express');
const router = express.Router();
const Scope2KPIsController = require('../controllers/Scope2KPIsController');

router.get('/kpis', Scope2KPIsController.getKPIs);

module.exports = router;