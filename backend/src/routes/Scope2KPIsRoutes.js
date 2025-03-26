/***********************************************
 * routes/scope2KPIsRoutes.js
 * Routes for Scope 2 KPIs (Electricity and Steam)
 ***********************************************/

const express = require('express');
const router = express.Router();
const scope2KPIsController = require('../controllers/Scope2KPIsController');

// Scope 2 KPIs for Electricity and Steam
router.get('/', scope2KPIsController.getScope2KPIs);

module.exports = router;
