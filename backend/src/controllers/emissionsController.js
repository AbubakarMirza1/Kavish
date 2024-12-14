const prisma = require('../utils/prismaClient');

// Example KPI: total CO2e from Refrigeration + Fire Suppression + etc.
// In Stationary and Mobile, you need emission factors or a calculation method.
// Let's assume for demonstration you have constants or you'll just sum up quantities now.
// For a real app, you'd have emission factors in a separate table.

// Emission Factors (example values)
const STATIONARY_FACTORS = {
  "Natural Gas": 0.202, // kg CO₂e per m³
  "Diesel": 2.68 // kg CO₂e per liter
};

const MOBILE_FACTORS = {
  "Diesel": 2.68, // kg CO₂e per liter
  "Gasoline": 2.31 // kg CO₂e per liter
};

async function getStationaryEmissions(req, res) {
  const data = await prisma.stationaryCombustion.findMany({
    include: { source: true }
  });
  res.json(data);
}

async function getMobileEmissions(req, res) {
  const data = await prisma.mobileSource.findMany({ include: { source: true } });
  res.json(data);
}

async function getRefrigerationEmissions(req, res) {
  const data = await prisma.refrigerationAC.findMany({ include: { source: true } });
  res.json(data);
}

async function getFireSuppressionEmissions(req, res) {
  const data = await prisma.fireSuppression.findMany({ include: { source: true } });
  res.json(data);
}

async function getPurchasedGasEmissions(req, res) {
  const data = await prisma.purchasedGas.findMany({ include: { source: true } });
  res.json(data);
}

async function getScope1KPIs(req, res) {
  try {
    // Fetch all data
    const stationaryData = await prisma.stationaryCombustion.findMany();
    const mobileData = await prisma.mobileSource.findMany();
    const refrigerationData = await prisma.refrigerationAC.findMany();
    const fireData = await prisma.fireSuppression.findMany();
    const purchasedData = await prisma.purchasedGas.findMany();

    // Calculate CO₂e for Stationary
    const stationaryEmissions = stationaryData.map(item => {
      const factor = STATIONARY_FACTORS[item.fuelCombusted] || 0;
      const co2e = item.quantity * factor;
      return {
        date: item.date,
        co2e,
        sourceId: item.sourceId,
        category: 'Stationary'
      };
    });

    // Calculate CO₂e for Mobile
    // We need to guess the fuel type from `fuelUsage`. If it's Diesel or Gasoline.
    const mobileEmissions = mobileData.map(item => {
      const factor = MOBILE_FACTORS[item.fuelUsage] || 0;
      const co2e = item.milesTravelled * factor; 
      // Actually, we should have quantity of fuel used, not miles. If `milesTravelled` was actually fuel quantity, rename field. 
      // If `milesTravelled` is distance only, we need a different approach. Let's assume `milesTravelled` is actually liters consumed 
      // for simplicity. Otherwise, you'd need a fuel economy factor.
      return {
        date: new Date(), // If you have no date field in mobile, add one in schema. For demonstration, we skip date or assume a date field.
        co2e,
        sourceId: item.sourceId,
        category: 'Mobile'
      };
    });

    // Refrigeration and Fire have direct CO₂e
    const refrigerationEmissions = refrigerationData.map(item => ({
      date: new Date(), // If no date in refrigeration, consider adding one. Otherwise, group by ID or just show total.
      co2e: item.co2EquivalentEmissionsKg,
      sourceId: item.sourceId,
      category: 'Refrigeration'
    }));

    const fireEmissions = fireData.map(item => ({
      date: item.date,
      co2e: item.co2EquivalentEmissionsKg,
      sourceId: item.sourceId,
      category: 'Fire Suppression'
    }));

    // For purchased gases, we skip emissions since no factor given. Or just track quantity.
    // We won't include purchased in total emissions right now.

    // Combine all emissions that have CO2e
    const allEmissions = [...stationaryEmissions, ...mobileEmissions, ...refrigerationEmissions, ...fireEmissions];

    // KPI 1: Total Scope 1 Emissions Over Time (by month-year)
    const emissionsOverTimeMap = {};
    allEmissions.forEach(e => {
      const monthYear = `${e.date.getFullYear()}-${String(e.date.getMonth()+1).padStart(2,'0')}`;
      if (!emissionsOverTimeMap[monthYear]) emissionsOverTimeMap[monthYear] = 0;
      emissionsOverTimeMap[monthYear] += e.co2e;
    });
    const emissionsOverTime = Object.entries(emissionsOverTimeMap).map(([period, co2e]) => ({ period, co2e }));

    // KPI 2: Breakdown by Category
    const categoryTotals = { Stationary:0, Mobile:0, Refrigeration:0, "Fire Suppression":0 };
    allEmissions.forEach(e => {
      categoryTotals[e.category] += e.co2e;
    });
    const categoryBreakdown = Object.keys(categoryTotals).map(cat => ({ name: cat, value: categoryTotals[cat] }));

    // KPI 3: Top Emitting Sources
    const sourceMap = {};
    allEmissions.forEach(e => {
      if (!sourceMap[e.sourceId]) sourceMap[e.sourceId] = 0;
      sourceMap[e.sourceId] += e.co2e;
    });
    const sourcesArr = Object.entries(sourceMap).map(([sourceId, co2e]) => ({ sourceId, co2e }));
    sourcesArr.sort((a,b) => b.co2e - a.co2e);
    const topSources = sourcesArr.slice(0,5);

    // KPI 4: Emissions by Fuel Type (from stationary+mobile)
    const fuelMap = {};
    stationaryData.forEach(item => {
      const factor = STATIONARY_FACTORS[item.fuelCombusted] || 0;
      const co2e = item.quantity * factor;
      if (!fuelMap[item.fuelCombusted]) fuelMap[item.fuelCombusted] = 0;
      fuelMap[item.fuelCombusted] += co2e;
    });

    mobileData.forEach(item => {
      const factor = MOBILE_FACTORS[item.fuelUsage] || 0;
      const co2e = item.milesTravelled * factor;
      if (!fuelMap[item.fuelUsage]) fuelMap[item.fuelUsage] = 0;
      fuelMap[item.fuelUsage] += co2e;
    });

    const fuelBreakdown = Object.entries(fuelMap).map(([fuel, value]) => ({ fuel, value }));

    res.json({
      emissionsOverTime,
      categoryBreakdown,
      topSources,
      fuelBreakdown
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching KPIs' });
  }
}

async function createStationaryEmission(req, res) {
  const { sourceId, description, date, fuelCombusted, quantity, units } = req.body;
  try {
    const newRecord = await prisma.stationaryCombustion.create({
      data: {
        sourceId,
        description,
        date: new Date(date),
        fuelCombusted,
        quantity: parseFloat(quantity),
        units
      }
    });
    res.status(201).json(newRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating record' });
  }
}

async function deleteStationaryEmission(req, res) {
  const { id } = req.params;
  try {
    await prisma.stationaryCombustion.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting record' });
  }
}

module.exports = {
  getStationaryEmissions,
  getMobileEmissions,
  getRefrigerationEmissions,
  getFireSuppressionEmissions,
  getPurchasedGasEmissions,
  getScope1KPIs,
  createStationaryEmission,
  deleteStationaryEmission
};
