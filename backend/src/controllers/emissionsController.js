const prisma = require('../utils/prismaClient');

// Example KPI: total CO2e from Refrigeration + Fire Suppression + etc.
// In Stationary and Mobile, you need emission factors or a calculation method.
// Let's assume for demonstration you have constants or you'll just sum up quantities now.
// For a real app, you'd have emission factors in a separate table.

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
  // Example KPI: total refrigeration CO2e
  const refrigData = await prisma.refrigerationAC.findMany();
  const totalRefrigCO2e = refrigData.reduce((sum, r) => sum + r.co2EquivalentEmissionsKg, 0);

  // Example KPI: total fire suppression CO2e
  const fireData = await prisma.fireSuppression.findMany();
  const totalFireCO2e = fireData.reduce((sum, f) => sum + f.co2EquivalentEmissionsKg, 0);

  // For stationary & mobile, if you had emission factors, you'd query them and multiply by quantity.
  // For now, let's just return these two KPIs as demonstration.
  
  res.json({
    totalRefrigerationCO2e: totalRefrigCO2e,
    totalFireCO2e: totalFireCO2e,
    message: "Add logic for stationary & mobile once emission factors are defined."
  });
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
