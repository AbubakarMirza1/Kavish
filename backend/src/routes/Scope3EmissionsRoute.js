const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();

// ------------------- FETCH INITIAL DATA -------------------
router.get("/data", async (req, res) => {
  try {
    // Fetch all relevant data for Scope 3 setup
    const vehicleTypes = await prisma.VehicleType.findMany();
    const units = await prisma.Unit.findMany();
    const wasteMaterials = await prisma.WasteType.findMany();
    
    // Transform data into a format suitable for the frontend
    const vehicleTypeRows = vehicleTypes.map((vt) => ({
      id: vt.vehicleTypeId,
      name: vt.typeName,
      active: vt.active || false,
    }));

    const unitRows = units.map((u) => ({
      id: u.unitId,
      name: u.unitName,
      active: u.active || false,
    }));

    const wasteMaterialRows = wasteMaterials.map((wm) => ({
      id: wm.wasteTypeId,
      name: wm.typeName,
      active: wm.active || false,
    }));


    // Return the data as JSON
    res.json({
      vehicleTypes: vehicleTypeRows,
      units: unitRows,
      wasteMaterials: wasteMaterialRows,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Scope 3 data" });
  }
});

// ------------------- ADD NEW ROW -------------------
router.post("/add-row/:section", async (req, res) => {
  const { section } = req.params;
  const { name } = req.body;

  try {
    let newEntry;
    switch (section) {
      case "vehicleType":
        newEntry = await prisma.vehicleType.create({
          data: { typeName: name, active: true },
        });
        break;
      case "units":
        newEntry = await prisma.unit.create({
          data: { unitName: name, active: true },
        });
        break;
      case "wasteMaterial":
        newEntry = await prisma.wasteType.create({
          data: { typeName: name, active: true },
        });
        break;
      
      default:
        return res.status(400).json({ error: "Invalid section" });
    }

    res.json(newEntry);
  } catch (error) {
    res.status(500).json({ error: "Failed to add row" });
  }
});

// ------------------- DELETE ROW -------------------
router.delete("/delete-row/:section/:id", async (req, res) => {
  const { section, id } = req.params;

  try {
    switch (section) {
      case "vehicleType":
        await prisma.vehicleType.delete({
          where: { vehicleTypeId: parseInt(id) },
        });
        break;
      case "units":
        await prisma.unit.delete({
          where: { unitId: parseInt(id) },
        });
        break;
      case "wasteMaterial":
        await prisma.wasteType.delete({
          where: { wasteTypeId: parseInt(id) },
        });
        break;
      
      default:
        return res.status(400).json({ error: "Invalid section" });
    }

    res.json({ message: "Row deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete row" });
  }
});

// ------------------- TOGGLE ACTIVE STATUS -------------------
router.put("/toggle-active/:section/:id", async (req, res) => {
  const { section, id } = req.params;
  const { active } = req.body;

  try {
    let updatedEntry;
    switch (section) {
      case "vehicleType":
        updatedEntry = await prisma.vehicleType.update({
          where: { vehicleTypeId: parseInt(id) },
          data: { active },
        });
        break;
      case "units":
        updatedEntry = await prisma.unit.update({
          where: { unitId: parseInt(id) },
          data: { active },
        });
        break;
      case "wasteMaterial":
        updatedEntry = await prisma.wasteType.update({
          where: { wasteTypeId: parseInt(id) },
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