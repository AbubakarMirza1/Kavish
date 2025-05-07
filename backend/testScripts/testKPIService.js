// scripts/test-dashboard-service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getDashboardKPIs } = require('../src/services/dashboardKPIsService');

async function testDashboardService() {
  try {
    console.log('🚀 Testing Dashboard KPI Service Functionality...\n');
    await prisma.$connect();

    // Test parameters
    const userId = 1;
    const startDate = '2023-01-01';
    const endDate = '2023-12-31';
    const period = 'month';

    // 1. Execute the service
    const dashboardData = await getDashboardKPIs(userId, startDate, endDate, period);

    // 2. Show actual values
    console.log('📊 DASHBOARD METRICS:');
    console.log('Total Emissions by Scope:');
    console.log(`- Scope 1: ${dashboardData.totalEmissionsByScope.scope1.toLocaleString()} kg`);
    console.log(`- Scope 2: ${dashboardData.totalEmissionsByScope.scope2.toLocaleString()} kg`);
    console.log(`- Scope 3: ${dashboardData.totalEmissionsByScope.scope3.toLocaleString()} kg`);
    console.log(`- Total: ${dashboardData.keyMetrics.totalEmissions.toLocaleString()} kg\n`);

    console.log('🔥 Top 3 Emission Sources:');
    dashboardData.topEmissionSources.forEach((source, index) => {
      console.log(`${index + 1}. ${source.name} (${source.scope}): ${source.emissions.toLocaleString()} kg`);
    });

    console.log('\n🗑️ Waste Management Overview:');
    console.log(`- Total Waste: ${dashboardData.wasteManagementOverview.totalWaste.toLocaleString()} kg`);
    console.log(`- Diversion Rate: ${(dashboardData.wasteManagementOverview.diversionRate * 100).toFixed(1)}%`);
    console.log(`- Carbon Footprint: ${dashboardData.wasteManagementOverview.carbonFootprint.toLocaleString()} kg CO₂e\n`);

    console.log('📈 Overall Emissions Trend (First 3 Months):');
    dashboardData.overallEmissionsTrend.historical.slice(0, 3).forEach(period => {
      console.log(`- ${period.period}: ${period.emissions.toLocaleString()} kg`);
    });

    console.log('\n🔮 Overall Regression Predictions (Next 3 Periods):');
    dashboardData.overallEmissionsTrend.regression.slice(-3).forEach(prediction => {
      console.log(`- ${prediction.period}: ${prediction.predictedValue.toFixed(2)} kg`);
    });

    // 3. Core validation checks
    console.log('\n✅ VALIDATION CHECKS:');

    // Check total emissions consistency
    const calculatedTotal = Object.values(dashboardData.totalEmissionsByScope).reduce((a, b) => a + b, 0);
    const totalMatch = Math.abs(calculatedTotal - dashboardData.keyMetrics.totalEmissions) < 0.01;
    console.log(`- Total Emissions Consistency: ${totalMatch ? 'Pass' : 'Fail'}`);

    // Verify trend aggregation
    const validTrendAggregation = dashboardData.overallEmissionsTrend.historical.every(period => {
      const scope1 = dashboardData.totalEmissionsByScope.scope1Historic?.find(p => p.period === period.period)?.emissions || 0;
      const scope2 = dashboardData.scope2?.emissionsTrend.historical.find(p => p.period === period.period)?.emissions || 0;
      const scope3 = dashboardData.scope3?.emissionsTrend.historical.find(p => p.period === period.period)?.emissions || 0;
      return Math.abs(period.emissions - (scope1 + scope2 + scope3)) < 0.01;
    });
    console.log(`- Trend Aggregation Accuracy: ${validTrendAggregation ? 'Pass' : 'Fail'}`);

    // Verify top sources validity
    const validTopSources = dashboardData.topEmissionSources.every(source => 
      source.emissions >= dashboardData.topEmissionSources[0].emissions ||
      source.emissions >= dashboardData.topEmissionSources[1].emissions
    );
    console.log(`- Top Sources Validity: ${validTopSources ? 'Pass' : 'Fail'}`);

    // Check regression properties
    const validRegression = dashboardData.overallEmissionsTrend.regression.length === 
      dashboardData.overallEmissionsTrend.historical.length + 3 &&
      dashboardData.overallEmissionsTrend.regression.every(p => !isNaN(p.predictedValue));
    console.log(`- Regression Integrity: ${validRegression ? 'Pass' : 'Fail'}`);

    // 4. Edge case testing
    console.log('\n🧪 EDGE CASE TESTING:');
    
    // Test invalid user
    try {
      await getDashboardKPIs(9999, startDate, endDate, period);
      console.log('- Invalid User Handling: Fail (no error thrown)');
    } catch (e) {
      console.log('- Invalid User Handling: Pass');
    }

    // Test invalid dates
    try {
      await getDashboardKPIs(userId, 'invalid-date', endDate, period);
      console.log('- Invalid Date Handling: Fail (no error thrown)');
    } catch (e) {
      console.log('- Invalid Date Handling: Pass');
    }

    // Test empty data range
    const emptyData = await getDashboardKPIs(userId, '2024-01-01', '2024-01-31');
    const emptyTotal = Object.values(emptyData.totalEmissionsByScope).every(v => v === 0);
    console.log(`- Empty Data Handling: ${emptyTotal ? 'Pass' : 'Fail'}`);

  } catch (error) {
    console.error('\n❌ Test Failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

testDashboardService();