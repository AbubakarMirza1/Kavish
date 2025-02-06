const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET main dashboard KPIs
router.get('/kpis', dashboardController.getDashboardKPIs);

// GET top 5 emission sources
router.get('/top-sources', dashboardController.getTop5Sources);

module.exports = router;
