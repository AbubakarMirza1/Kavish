// routes/scope1EmissionsRoutes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Fetch initial data
router.get('/data', async (req, res) => {
  try {
    const fuelTypes = await prisma.FuelType.findMany();
    const vehicleTypes = await prisma.VehicleType.findMany();
    const equipmentTypes = await prisma.EquipmentType.findMany();
    const wasteTypes = await prisma.WasteType.findMany();
    const units = await prisma.Unit.findMany();

    const stationaryCombustionRows = fuelTypes.map((ft) => ({
      id: ft.fuelTypeId,
      name: ft.typeName,
      active: true,
    }));

    const mobileRows = vehicleTypes.map((vt) => ({
      id: vt.vehicleTypeId,
      name: vt.typeName,
      active: true,
    }));

    const refrigerationRows = equipmentTypes.map((et) => ({
      id: et.equipmentTypeId,
      name: et.typeName,
      active: true,
    }));

    const fireSuppressionRows = fuelTypes.map((ft) => ({
      id: ft.fuelTypeId,
      name: ft.typeName,
      active: true,
    }));

    const purchasedGasesRows = fuelTypes.map((ft) => ({
      id: ft.fuelTypeId,
      name: ft.typeName,
      active: true,
    }));

    const unitRows = units.map((u) => ({
      id: u.unitId,
      name: u.unitName,
      active: true,
    }));
    console.log({
      stationaryCombustionRows,
      mobileRows,
      refrigerationRows,
      fireSuppressionRows,
      purchasedGasesRows,
      unitRows,
    });

    res.json({
      stationaryCombustionRows,
      mobileRows,
      refrigerationRows,
      fireSuppressionRows,
      purchasedGasesRows,
      unitRows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scope 1 data' });
  }
});

// Add new entry
router.post('/add-row/:section', async (req, res) => {
  const { section } = req.params;
  const { name } = req.body;

  try {
    let newEntry;
    switch (section) {
      case 'stationaryCombustion':
        newEntry = await prisma.fuelType.create({ data: { typeName: name } });
        break;
      case 'mobile':
        newEntry = await prisma.vehicleType.create({ data: { typeName: name } });
        break;
      case 'refrigeration':
        newEntry = await prisma.equipmentType.create({ data: { typeName: name } });
        break;
      case 'fireSuppression':
        newEntry = await prisma.fuelType.create({ data: { typeName: name } });
        break;
      case 'purchasedGases':
        newEntry = await prisma.fuelType.create({ data: { typeName: name } });
        break;
      case 'units':
        newEntry = await prisma.unit.create({ data: { unitName: name } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid section' });
    }

    res.json(newEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add row' });
  }
});

// Delete entry
router.delete('/delete-row/:section/:id', async (req, res) => {
  const { section, id } = req.params;

  try {
    switch (section) {
      case 'stationaryCombustion':
        await prisma.fuelType.delete({ where: { fuelTypeId: parseInt(id) } });
        break;
      case 'mobile':
        await prisma.vehicleType.delete({ where: { vehicleTypeId: parseInt(id) } });
        break;
      case 'refrigeration':
        await prisma.equipmentType.delete({ where: { equipmentTypeId: parseInt(id) } });
        break;
      case 'fireSuppression':
        await prisma.fuelType.delete({ where: { fuelTypeId: parseInt(id) } });
        break;
      case 'purchasedGases':
        await prisma.fuelType.delete({ where: { fuelTypeId: parseInt(id) } });
        break;
      case 'units':
        await prisma.unit.delete({ where: { unitId: parseInt(id) } });
        break;
      default:
        return res.status(400).json({ error: 'Invalid section' });
    }

    res.json({ message: 'Row deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete row' });
  }
});

// Toggle active status
router.put('/toggle-active/:section/:id', async (req, res) => {
  const { section, id } = req.params;
  const { active } = req.body;

  try {
    let updatedEntry;
    switch (section) {
      case 'stationaryCombustion':
        updatedEntry = await prisma.fuelType.update({
          where: { fuelTypeId: parseInt(id) },
          data: { active },
        });
        break;
      case 'mobile':
        updatedEntry = await prisma.vehicleType.update({
          where: { vehicleTypeId: parseInt(id) },
          data: { active },
        });
        break;
      case 'refrigeration':
        updatedEntry = await prisma.equipmentType.update({
          where: { equipmentTypeId: parseInt(id) },
          data: { active },
        });
        break;
      case 'fireSuppression':
        updatedEntry = await prisma.fuelType.update({
          where: { fuelTypeId: parseInt(id) },
          data: { active },
        });
        break;
      case 'purchasedGases':
        updatedEntry = await prisma.fuelType.update({
          where: { fuelTypeId: parseInt(id) },
          data: { active },
        });
        break;
      case 'units':
        updatedEntry = await prisma.unit.update({
          where: { unitId: parseInt(id) },
          data: { active },
        });
        break;
      default:
        return res.status(400).json({ error: 'Invalid section' });
    }

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle active status' });
  }
});

module.exports = router;