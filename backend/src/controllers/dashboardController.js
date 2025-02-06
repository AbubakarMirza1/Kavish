/************************************************
 * dashboardController.js
 * 
 * Controller for combined dashboard KPIs:
 *  - getDashboardKPIs (e.g., total scope1,2,3,
 *    percentages, advanced metrics)
 *  - getTop5Sources (optional hotspot analysis)
 ************************************************/
const dashboardService = require('../services/dashboardService');

/**
 * GET /dashboard/kpis
 * Fetch main dashboard KPIs, optionally filtered by scopeTypeId
 * (if you want a specific record, e.g., scopeTypeId=101).
 */
async function getDashboardKPIs(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const data = await dashboardService.getDashboardKPIs(scopeTypeId);
    // data might include: {
    //   scope1, scope2, scope3, total,
    //   scope1Percent, scope2Percent, scope3Percent,
    //   emissionsPerKwh, steamSystemEfficiency, emissionsPerMile, ...
    // }
    return res.json(data);
  } catch (err) {
    console.error('Error in getDashboardKPIs:', err);
    return res.status(500).json({ error: err.message });
  }
}

/**
 * GET /dashboard/top-sources
 * Example advanced KPI to get top 5 emission sources.
 * Optionally accept ?scopeTypeId=XYZ
 */
async function getTop5Sources(req, res) {
  try {
    const scopeTypeId = req.query.scopeTypeId ? parseInt(req.query.scopeTypeId, 10) : undefined;
    const items = await dashboardService.getTop5Sources(scopeTypeId);
    return res.json(items);
  } catch (err) {
    console.error('Error in getTop5Sources:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getDashboardKPIs,
  getTop5Sources,
};
