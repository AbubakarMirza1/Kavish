/*******************************************************
 * scope1KPIController.js
 *
 * Controller functions that handle HTTP requests
 * for Scope 1 KPIs. Uses scope1KPIService.js
 * to perform calculations.
 *******************************************************/

const scope1Service = require('../services/scope1KPIService'); 


async function getScope1Breakdown(req, res, next) {
    try {
      const userId = parseInt(req.query.userId || '1', 10);
  
      // Call each function individually
      const stationary = await scope1Service.calculateStationaryCombustionEmissions(userId);
      const mobile = await scope1Service.calculateMobileSourceEmissions(userId);
      const refrigeration = await scope1Service.calculateRefrigerationEmissions(userId);
      const fire = await scope1Service.calculateFireSuppressionEmissions(userId);
      const purchasedGas = await scope1Service.calculatePurchasedGasEmissions(userId);
  
      // Sum them up for total
      const total = stationary + mobile + refrigeration + fire + purchasedGas;
  
      // Return them all in one JSON response
      return res.json({
        breakdown: {
          stationaryCombustion: stationary,
          mobileSources: mobile,
          refrigerationAndAC: refrigeration,
          fireSuppression: fire,
          purchasedGas: purchasedGas,
        },
        totalScope1Emissions: total,
      });
    } catch (error) {
      next(error);
    }
  }


/**
 * Returns the top 3 emission sources within Scope 1.
 */
async function getTopEmissionSources(req, res, next) {
  try {
    const userId = parseInt(req.query.userId || '1', 10);

    const topSources = await scope1Service.getTopEmissionSources(userId);
    return res.json({ topSources });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns the monthly or yearly trend for Scope 1 emissions.
 * Accepts a 'period' query param: 'month' (default) or 'year'.
 */
async function getEmissionsTrend(req, res, next) {
  try {
    const userId = parseInt(req.query.userId || '1', 10);
    const period = req.query.period === 'year' ? 'year' : 'month';

    const trend = await scope1Service.getEmissionsTrend(userId, period);
    return res.json({ trend });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns emissions grouped by fuel type (Stationary + Fire).
 */
async function getEmissionsByFuelType(req, res, next) {
  try {
    const userId = parseInt(req.query.userId || '1', 10);

    const fuelTypeEmissions = await scope1Service.getEmissionsByFuelType(userId);
    return res.json({ fuelTypeEmissions });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns emissions grouped by vehicle type (MobileSource).
 */
async function getEmissionsByVehicleType(req, res, next) {
  try {
    const userId = parseInt(req.query.userId || '1', 10);

    const vehicleTypeEmissions = await scope1Service.getEmissionsByVehicleType(userId);
    return res.json({ vehicleTypeEmissions });
  } catch (error) {
    next(error);
  }
}

/**
 * Returns emissions grouped by gas type (Refrigeration + PurchasedGas).
 */
async function getEmissionsByGasType(req, res, next) {
  try {
    const userId = parseInt(req.query.userId || '1', 10);

    const gasTypeEmissions = await scope1Service.getEmissionsByGasType(userId);
    return res.json({ gasTypeEmissions });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getScope1Breakdown,
  getTopEmissionSources,
  getEmissionsTrend,
  getEmissionsByFuelType,
  getEmissionsByVehicleType,
  getEmissionsByGasType,
};
