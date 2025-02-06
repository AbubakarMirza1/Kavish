/****************************************************
 * dashboardService.js
 *
 * Provides high-level KPIs for the main dashboard:
 *  - Total Scope 1, 2, 3 Emissions
 *  - Combined total
 *  - Scope contribution percentages
 *  - Optional: emissions per kWh, steam efficiency, etc.
 *  - Possibly: top 5 emission sources (hotspot analysis)
 ****************************************************/

const emissionsService = require('./emissionsService');

/**
 * Get the main dashboard KPIs for a given scopeTypeId (or all if none).
 *
 * This function compiles all the big-picture numbers:
 *  - total scope1, scope2, scope3
 *  - combined total
 *  - scope contribution percentages
 *  - optional metrics like emissionsPerKwh or steamSystemEfficiency
 */
async function getDashboardKPIs(scopeTypeId) {
  // 1) Get total scope-based emissions from emissionsService
  const { scope1, scope2, scope3, total } = await emissionsService.getTotalEmissions(scopeTypeId);

  // 2) Calculate scope contribution percentages
  const { scope1Percent, scope2Percent, scope3Percent } =
    emissionsService.calculateScopeContributions(scope1, scope2, scope3);

  // 3) Optional advanced KPIs
  // e.g., scope2: emissions / kWh
  const emissionsPerKwh = await emissionsService.getEmissionsPerKwh(scopeTypeId);

  // e.g., average steam boiler efficiency
  const steamSystemEfficiency = await emissionsService.getSteamSystemEfficiency(scopeTypeId);

  // e.g., scope3: emissions per mile
  const emissionsPerMile = await emissionsService.getEmissionsPerMile(scopeTypeId);

  // 4) Return an object with all the KPIs you want on the dashboard
  return {
    scope1,
    scope2,
    scope3,
    total,
    scope1Percent,
    scope2Percent,
    scope3Percent,
    emissionsPerKwh,
    steamSystemEfficiency,
    emissionsPerMile,
  };
}

/**
 * Example: get the top 5 emission sources (hotspot analysis).
 *
 * We can either:
 *  A) do a single query across all tables,
 *  B) or we can fetch each scope's data separately and combine them.
 * 
 * For simplicity, let's do an approach that sums co2e for each record 
 * across scope1,2,3 and then picks the top 5. This is more advanced 
 * and might require some custom logic.
 */
async function getTop5Sources(scopeTypeId) {
  // This is pseudo-logic: you'd need to fetch each table's rows,
  // sum their co2e, and attach e.g. a "type" label and "description."

  // EXAMPLE approach: fetch the "raw" scope1,2,3 data from emissionsService
  const scope1Data = await emissionsService.getScope1Data(scopeTypeId); // contains arrays
  const scope2Data = await emissionsService.getScope2Data(scopeTypeId);
  const scope3Data = await emissionsService.getScope3Data(scopeTypeId);

  // Convert them into a single array of { source, co2e } objects
  // This can get quite large; consider limiting or filtering 
  // based on your requirements.

  const items = [];

  // Stationary Combustion
  for (const sc of scope1Data.stationaryData) {
    items.push({
      source: `StationaryComb: ${sc.sourceDescription}`,
      co2e: sc.co2eKg || 0, // or compute if not stored
    });
  }
  // Do similarly for mobileData, refrigerationData, etc.
  // Then for scope2 (electricity, steam), scope3 (travel, waste)...

  // Summarize by source if needed, or if each record is distinct, 
  // just keep them separate. Then sort:
  items.sort((a, b) => b.co2e - a.co2e);

  // Return top 5
  return items.slice(0, 5);
}

module.exports = {
  getDashboardKPIs,
  getTop5Sources,
};
