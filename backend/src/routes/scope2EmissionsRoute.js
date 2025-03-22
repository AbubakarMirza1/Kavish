const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

// Fetch initial data
router.get("/data", async (req, res) => {
  try {
    const fuelTypes = await prisma.FuelType.findMany();
    const units = await prisma.Unit.findMany();

    const fuelTypeRows = fuelTypes.map((ft) => ({
      id: ft.fuelTypeId,
      name: ft.typeName,
      active: true,
    }));

    const unitRows = units.map((u) => ({
      id: u.unitId,
      name: u.unitName,
      active: true,
    }));

    res.json({ fuelTypeRows, unitRows });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch scope 2 data" });
  }
});

// Add new entry
router.post("/add-row/:section", async (req, res) => {
  const { section } = req.params;
  const { name } = req.body;

  try {
    let newEntry;
    switch (section) {
      case "fuelType":
        newEntry = await prisma.fuelType.create({ data: { typeName: name } });
        break;
      case "units":
        newEntry = await prisma.unit.create({ data: { unitName: name } });
        break;
      default:
        return res.status(400).json({ error: "Invalid section" });
    }

    res.json(newEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to add row" });
  }
});

// Delete entry
router.delete("/delete-row/:section/:id", async (req, res) => {
  const { section, id } = req.params;

  try {
    switch (section) {
      case "fuelType":
        await prisma.fuelType.delete({ where: { fuelTypeId: parseInt(id) } });
        break;
      case "units":
        await prisma.unit.delete({ where: { unitId: parseInt(id) } });
        break;
      default:
        return res.status(400).json({ error: "Invalid section" });
    }

    res.json({ message: "Row deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete row" });
  }
});

// Toggle active status
router.put("/toggle-active/:section/:id", async (req, res) => {
  const { section, id } = req.params;
  const { active } = req.body;

  try {
    let updatedEntry;
    switch (section) {
      case "fuelType":
        updatedEntry = await prisma.fuelType.update({
          where: { fuelTypeId: parseInt(id) },
          data: { active },
        });
        break;
      case "units":
        updatedEntry = await prisma.unit.update({
          where: { unitId: parseInt(id) },
          data: { active },
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid section" });
    }

    res.json(updatedEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to toggle active status" });
  }
});

module.exports = router;