const express = require('express');
const router = express.Router();
const emissionsController = require('../controllers/emissionsController');

// Scope-based totals
router.get('/scope1', emissionsController.getScope1Emissions);
router.get('/scope2', emissionsController.getScope2Emissions);
router.get('/scope3', emissionsController.getScope3Emissions);

// Combined total
router.get('/total', emissionsController.getTotalEmissions);

// Additional KPIs
router.get('/scope-contributions', emissionsController.getScopeContributions);
router.get('/emissions-per-kwh', emissionsController.getEmissionsPerKwh);
router.get('/steam-efficiency', emissionsController.getSteamSystemEfficiency);
router.get('/emissions-per-mile', emissionsController.getEmissionsPerMile);

module.exports = router;
