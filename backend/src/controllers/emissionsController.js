/***********************************************
 * emissionsController.js
 * 
 * Controller for emission-related endpoints:
 *  - Get total Scope 1, 2, 3 emissions
 *  - Get combined total
 *  - Compute optional KPIs like scope contributions,
 *    emissions per kWh, steam system efficiency, etc.
 ***********************************************/

const emissionsService = require('../services/emissionsService');

/**
 * GET /emissions/scope1
 * Optionally accepts ?scopeTypeId=XYZ to filter by a specific scope entry.
 */
async function getScope1Emissions(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const total = await emissionsService.getTotalScope1Emissions(scopeTypeId);
    return res.json({ scope1Emissions: total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /emissions/scope2
 * Optionally accepts ?scopeTypeId=XYZ
 */
async function getScope2Emissions(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const total = await emissionsService.getTotalScope2Emissions(scopeTypeId);
    return res.json({ scope2Emissions: total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /emissions/scope3
 * Optionally accepts ?scopeTypeId=XYZ
 */
async function getScope3Emissions(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const total = await emissionsService.getTotalScope3Emissions(scopeTypeId);
    return res.json({ scope3Emissions: total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /emissions/total
 * Returns { scope1, scope2, scope3, total }
 * Optionally accepts ?scopeTypeId=XYZ
 */
async function getTotalEmissions(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const emissions = await emissionsService.getTotalEmissions(scopeTypeId);
    // emissions => { scope1, scope2, scope3, total }
    return res.json(emissions);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /emissions/scope-contributions
 * Returns the percentage contribution of Scope 1, 2, 3
 * Optionally accepts ?scopeTypeId=XYZ
 */
async function getScopeContributions(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const { scope1, scope2, scope3, total } = await emissionsService.getTotalEmissions(scopeTypeId);

    // { scope1Percent, scope2Percent, scope3Percent }
    const contributions = emissionsService.calculateScopeContributions(scope1, scope2, scope3);
    return res.json({
      scope1,
      scope2,
      scope3,
      total,
      ...contributions, // e.g. scope1Percent, scope2Percent, scope3Percent
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /emissions/emissions-per-kwh
 * Example advanced KPI for Scope 2 (electricity + steam).
 * Optionally accepts ?scopeTypeId=XYZ
 */
async function getEmissionsPerKwh(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const result = await emissionsService.getEmissionsPerKwh(scopeTypeId);
    // returns a single number (kg CO2e / kWh)
    return res.json({ emissionsPerKwh: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /emissions/steam-efficiency
 * Example KPI for average boiler efficiency for steam.
 */
async function getSteamSystemEfficiency(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const result = await emissionsService.getSteamSystemEfficiency(scopeTypeId);
    return res.json({ steamSystemEfficiency: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /emissions/emissions-per-mile
 * Example KPI for Scope 3 (business travel).
 */
async function getEmissionsPerMile(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const result = await emissionsService.getEmissionsPerMile(scopeTypeId);
    return res.json({ emissionsPerMile: result });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getScope1Emissions,
  getScope2Emissions,
  getScope3Emissions,
  getTotalEmissions,
  getScopeContributions,
  getEmissionsPerKwh,
  getSteamSystemEfficiency,
  getEmissionsPerMile,
};
