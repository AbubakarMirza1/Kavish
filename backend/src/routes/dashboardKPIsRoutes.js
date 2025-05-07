const express = require('express');
const router = express.Router();
const DashboardKPIsController = require('../controllers/dashboardKPIsController');

router.get('/kpis', DashboardKPIsController.getKPIs);

module.exports = router;