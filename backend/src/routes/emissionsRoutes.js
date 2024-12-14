const express = require('express');
const router = express.Router();
const {
  getStationaryEmissions,
  getMobileEmissions,
  getRefrigerationEmissions,
  getFireSuppressionEmissions,
  getPurchasedGasEmissions,
  getScope1KPIs
} = require('../controllers/emissionsController');

router.get('/stationary', getStationaryEmissions);
router.get('/mobile', getMobileEmissions);
router.get('/refrigeration', getRefrigerationEmissions);
router.get('/fire', getFireSuppressionEmissions);
router.get('/purchased', getPurchasedGasEmissions);
router.get('/kpis', getScope1KPIs);

module.exports = router;
