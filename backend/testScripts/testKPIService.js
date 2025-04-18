// scripts/test-kpi-service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const kpiService = require('../src/services/scope1KPIService.js');
const kpiConfig = require('../src/config/kpiConfig');

/// Test configuration
const TEST_USER_ID = 1;
const TEST_PERIOD = 'year';
const REGRESSION_TOLERANCE = 0.01; // 1% variance allowed

async function main() {
  try {
    console.log('🚀 Starting KPI Service Tests...\n');
    await prisma.$connect();
    console.log('✅ Database connection established');

    // 1. Core Calculations with Actual Values
    console.log('\n🔢 Core Emission Values:');
    
    const tests = {
      totalEmissions: await kpiService.calculateTotalScope1Emissions(TEST_USER_ID),
      stationary: await kpiService.calculateStationaryCombustionEmissions(TEST_USER_ID),
      mobile: await kpiService.calculateMobileSourceEmissions(TEST_USER_ID),
      refrigeration: await kpiService.calculateRefrigerationEmissions(TEST_USER_ID),
      fireSuppression: await kpiService.calculateFireSuppressionEmissions(TEST_USER_ID),
      purchasedGas: await kpiService.calculatePurchasedGasEmissions(TEST_USER_ID),
      topSources: await kpiService.getTopEmissionSources(TEST_USER_ID),
      mainTrend: await kpiService.getEmissionsTrend(TEST_USER_ID, TEST_PERIOD),
      sourceTrends: await kpiService.getEmissionsTrendBySourceType(TEST_USER_ID, TEST_PERIOD),
      fuelTrends: await kpiService.getEmissionsTrendByFuelType(TEST_USER_ID, TEST_PERIOD),
      vehicleTrends: await kpiService.getEmissionsTrendByVehicleType(TEST_USER_ID, TEST_PERIOD),
      gasTrends: await kpiService.getEmissionsTrendByGasType(TEST_USER_ID, TEST_PERIOD)
    };

    // 2. Display Actual Values
    console.log('\n📊 Actual Emission Values:');
    console.log(`- Total Scope 1: ${tests.totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} kg CO₂e`);
    console.log(`- Stationary Combustion: ${tests.stationary.toFixed(2)} kg`);
    console.log(`- Mobile Sources: ${tests.mobile.toFixed(2)} kg`);
    console.log(`- Refrigeration: ${tests.refrigeration.toFixed(2)} kg`);
    console.log(`- Fire Suppression: ${tests.fireSuppression.toFixed(2)} kg`);
    console.log(`- Purchased Gases: ${tests.purchasedGas.toFixed(2)} kg`);

    // 3. Detailed Trend Validation
    console.log('\n📈 Trend Analysis:');
    
    // Main Trend Check
    const firstTrend = tests.mainTrend.trend[0];
    const lastTrend = tests.mainTrend.trend.slice(-1)[0];
    console.log(`Main Trend: ${tests.mainTrend.trend.length} periods`);
    console.log(`- First Period: ${firstTrend?.period} = ${firstTrend?.emissions.toFixed(2)} kg`);
    console.log(`- Last Period: ${lastTrend?.period} = ${lastTrend?.emissions.toFixed(2)} kg`);

    // Regression Validation
    console.log('\n🧮 Regression Validation:');
    const regressionValid = tests.mainTrend.regression.every((point, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1].predictedValue;
      return Math.abs((point.predictedValue - prev) / prev) < REGRESSION_TOLERANCE;
    });
    console.log(`- Regression Line Consistency: ${regressionValid ? '✅' : '❌'}`);

    // 4. Source Type Trend Verification
    console.log('\n🔍 Source Type Trends:');
    tests.sourceTrends.forEach(source => {
      console.log(`\n${source.sourceType}:`);
      console.log(`- Periods: ${source.trend.length}`);
      console.log(`- Regression Points: ${source.regression.length}`);
      console.log(`- First Prediction: ${source.regression[0]?.predictedValue.toFixed(2)} kg`);
      console.log(`- Last Prediction: ${source.regression.slice(-1)[0]?.predictedValue.toFixed(2)} kg`);
    });

    // 5. Final Validation Checks
    console.log('\n🎯 Final Validation:');
    
    // Value Consistency Check
    const totalFromComponents = tests.stationary + tests.mobile + tests.refrigeration + 
                               tests.fireSuppression + tests.purchasedGas;
    const totalMatch = Math.abs(tests.totalEmissions - totalFromComponents) < 0.01;
    console.log(`Total Emissions Match: ${totalMatch ? '✅' : '❌'}`);

    // Regression Line Sanity Check
    const hasValidRegression = tests.mainTrend.regression.length > 0 &&
                              tests.mainTrend.regression.every(p => p.predictedValue > 0);
    console.log(`Valid Regression Data: ${hasValidRegression ? '✅' : '❌'}`);

    // Top Sources Check
    const topSourcesValid = tests.topSources.length === 3 && 
                           tests.topSources.every(s => s.emissions > 0);
    console.log(`Valid Top Sources: ${topSourcesValid ? '✅' : '❌'}`);

    // Configuration Validation
    const fuelTypes = await prisma.fuelType.findMany();
    const vehicleTypes = await prisma.vehicleType.findMany();
    const configValid = fuelTypes.every(ft => ft.fuelTypeId in kpiConfig.fuelEmissionFactors) &&
                       vehicleTypes.every(vt => vt.vehicleTypeId in kpiConfig.vehicleEmissionFactors);
    console.log(`Configuration Coverage: ${configValid ? '✅' : '❌'}`);

    console.log('\n🧪 All Validation Checks Completed');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    if (error.stack) console.log('Error Context:', error.stack.split('\n')[1]);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

main();