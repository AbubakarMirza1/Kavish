/***********************************************
 * routes/scope3KPIsRoutes.js
 * Routes for Scope 3 KPIs (Business Travel)
 ***********************************************/

const express = require('express');
const router = express.Router();
const scope3KPIsController = require('../controllers/scope3KPIsController'); // Fixed case: "scope3KPIsController"

// Scope 3 KPIs for Business Travel
router.get('/', scope3KPIsController.getScope3KPIs);

module.exports = router;
