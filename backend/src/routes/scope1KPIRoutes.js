/*******************************************************
 * scope1KPIRoutes.js
 *
 * Express router for Scope 1 KPI endpoints.
 *******************************************************/

const express = require('express');
const router = express.Router();
const controller = require('../controllers/scope1KPIController'); 

/**
 * GET /api/scope1/breakdown
 * Returns the breakdown from each table plus total
 */
router.get('/breakdown', controller.getScope1Breakdown);

/**
 * GET /api/scope1/top
 * Returns top 3 emission sources for Scope 1
 */
router.get('/top', controller.getTopEmissionSources);

/**
 * GET /api/scope1/trend
 * Returns monthly or yearly trend
 * Accepts ?period=month or ?period=year
 */
router.get('/trend', controller.getEmissionsTrend);

/**
 * GET /api/scope1/fuel
 * Returns emissions grouped by fuel type
 */
router.get('/fuel', controller.getEmissionsByFuelType);

/**
 * GET /api/scope1/vehicle
 * Returns emissions grouped by vehicle type
 */
router.get('/vehicle', controller.getEmissionsByVehicleType);

/**
 * GET /api/scope1/gas
 * Returns emissions grouped by gas type
 */
router.get('/gas', controller.getEmissionsByGasType);

module.exports = router;
