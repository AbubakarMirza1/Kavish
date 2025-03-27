/***********************************************
 * routes/wasteKPIsRoutes.js
 * Routes for Waste Management KPIs
 ***********************************************/

const express = require('express');
const router = express.Router();
const wasteKPIsController = require('../controllers/wasteKPIsController');

// Log to confirm this file is loaded
console.log('Loading wasteKPIsRoutes.js');

// Waste Management KPIs
router.get('/kpis', (req, res, next) => {
  console.log('Route handler for /kpis triggered');
  wasteKPIsController.getWasteKPIs(req, res, next);
});

module.exports = router;
