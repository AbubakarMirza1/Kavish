/*******************************************************
 * testKPIService.js
 *
 * Purpose:
 * 1. Test your Scope 1 KPI functions (totals, each source).
 * 2. Test the new getEmissionsTrend function for both
 *    'month' and 'year' groupings.
 * 3. Compare sums of grouped data to the overall total
 *    Scope 1 emissions for consistency.
 *******************************************************/

const {
    calculateTotalScope1Emissions,
    calculateStationaryCombustionEmissions,
    calculateMobileSourceEmissions,
    calculateRefrigerationEmissions,
    calculateFireSuppressionEmissions,
    calculatePurchasedGasEmissions,
    getEmissionsTrend, // The new function that handles month/year
  } = require('../src/services/scope1KPIService.js'); // Adjust import path
  
  const testUserId = 1; // or whichever user you want to test
  
  (async function runTests() {
    try {
      console.log('--- Testing KPI Service Functions ---');
  
      // 1. Check total Scope 1 emissions
      const totalScope1 = await calculateTotalScope1Emissions(testUserId);
      console.log('Total Scope 1 Emissions (all-time):', totalScope1);
  
      // 2. Check each individual source (optional but good for context)
      const stationary = await calculateStationaryCombustionEmissions(testUserId);
      const mobile = await calculateMobileSourceEmissions(testUserId);
      const refrigeration = await calculateRefrigerationEmissions(testUserId);
      const fire = await calculateFireSuppressionEmissions(testUserId);
      const purchasedGas = await calculatePurchasedGasEmissions(testUserId);
  
      console.log('Stationary Combustion Emissions:', stationary);
      console.log('Mobile Source Emissions:', mobile);
      console.log('Refrigeration & AC Emissions:', refrigeration);
      console.log('Fire Suppression Emissions:', fire);
      console.log('Purchased Gas Emissions:', purchasedGas);
  
      // 3. Test the new Trend KPI: Monthly
      console.log('\n--- Testing getEmissionsTrend (Monthly) ---');
      const monthlyTrend = await getEmissionsTrend(testUserId, 'month');
      console.log('Trend Data (Monthly):', monthlyTrend);
  
      // Sum of all monthly periods
      const monthlySum = monthlyTrend.reduce((acc, item) => acc + (item.totalEmissions || 0), 0);
      console.log('Sum of Monthly Totals:', monthlySum);
  
      // Compare to totalScope1
      const monthlyDiff = Math.abs(monthlySum - totalScope1);
      if (monthlyDiff < 1e-6) {
        console.log('SUCCESS (Monthly): The sum of monthly totals matches the total Scope 1 emissions.');
      } else {
        console.warn(`WARNING (Monthly): The sum of monthly totals (${monthlySum}) differs from total Scope 1 (${totalScope1}) by ${monthlyDiff}.`);
      }
  
      // 4. Test the new Trend KPI: Yearly
      console.log('\n--- Testing getEmissionsTrend (Yearly) ---');
      const yearlyTrend = await getEmissionsTrend(testUserId, 'year');
      console.log('Trend Data (Yearly):', yearlyTrend);
  
      // Sum of all yearly periods
      const yearlySum = yearlyTrend.reduce((acc, item) => acc + (item.totalEmissions || 0), 0);
      console.log('Sum of Yearly Totals:', yearlySum);
  
      // Compare to totalScope1
      const yearlyDiff = Math.abs(yearlySum - totalScope1);
      if (yearlyDiff < 1e-6) {
        console.log('SUCCESS (Yearly): The sum of yearly totals matches the total Scope 1 emissions.');
      } else {
        console.warn(`WARNING (Yearly): The sum of yearly totals (${yearlySum}) differs from total Scope 1 (${totalScope1}) by ${yearlyDiff}.`);
      }
  
      // 5. Check for negative or null periods
      // (Optional additional checks)
      monthlyTrend.forEach(item => {
        if (!item.period) {
          console.error(`Monthly Trend has null period with emissions = ${item.totalEmissions}`);
        }
        if (item.totalEmissions < 0) {
          console.error(`Monthly Trend has negative emissions for period ${item.period}`);
        }
      });
  
      yearlyTrend.forEach(item => {
        if (!item.period) {
          console.error(`Yearly Trend has null period with emissions = ${item.totalEmissions}`);
        }
        if (item.totalEmissions < 0) {
          console.error(`Yearly Trend has negative emissions for period ${item.period}`);
        }
      });
  
      console.log('\n--- All tests completed ---');
    } catch (error) {
      console.error('Error during KPI service tests:', error);
    } finally {
      // If you use PrismaClient, you could optionally close the connection here.
      process.exit(0);
    }
  })();
  