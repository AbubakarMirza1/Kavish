/***********************************************
 * controllers/scope3Controller.js
 * Controller for Scope 3 CRUD operations and KPIs:
 *  - BusinessTravel
 *  - Waste
 *  - Scope 3 KPIs
 ***********************************************/

const scope3Service = require('../services/scope3Service');
const generalCrudService = require('../services/generalCrudService'); // Import generalCrudService to access prisma

// ----------------- BUSINESS TRAVEL -----------------
async function createBusinessTravel(req, res) {
  try {
    console.log('Received request to create Business Travel record:', req.body);
    let { scopeTypeId, sourceDescription, vehicleType, vehicleMiles, co2Kg, ch4g, n20g, date } = req.body;

    // If scopeTypeId is not provided, default to 301 (Scope 3)
    if (!scopeTypeId) {
      console.log('scopeTypeId not provided; defaulting to 301 (Scope 3)');
      scopeTypeId = 301;

      // Check if scopeTypeId 301 exists in the ScopeType table
      const scopeTypeRecord = await generalCrudService.prisma.scopeType.findUnique({
        where: { scopeTypeId: 301 },
      });

      if (!scopeTypeRecord) {
        console.log('scopeTypeId 301 not found; creating ScopeType for Scope 3');
        // Assume userId 1 for now; in a real app, this should come from req.user or session
        const userId = 1;
        await scope3Service.createScopeType('Scope3', userId);
      }
    }

    // Validate required fields
    if (!sourceDescription) {
      console.log('Validation failed: sourceDescription is missing');
      return res.status(400).json({ error: 'sourceDescription is required.' });
    }
    if (!vehicleType) {
      console.log('Validation failed: vehicleType is missing');
      return res.status(400).json({ error: 'vehicleType is required.' });
    }
    if (!vehicleMiles) {
      console.log('Validation failed: vehicleMiles is missing');
      return res.status(400).json({ error: 'vehicleMiles is required.' });
    }
    if (!co2Kg) {
      console.log('Validation failed: co2Kg is missing');
      return res.status(400).json({ error: 'co2Kg is required.' });
    }
    if (!ch4g) {
      console.log('Validation failed: ch4g is missing');
      return res.status(400).json({ error: 'ch4g is required.' });
    }
    if (!n20g) {
      console.log('Validation failed: n20g is missing');
      return res.status(400).json({ error: 'n20g is required.' });
    }

    // Parse numeric fields
    const parsedScopeTypeId = parseInt(scopeTypeId, 10);
    const parsedVehicleMiles = parseInt(vehicleMiles, 10);
    const parsedCo2Kg = parseInt(co2Kg, 10);
    const parsedCh4g = parseInt(ch4g, 10);
    const parsedN20g = parseInt(n20g, 10);

    // Validate parsed values
    if (isNaN(parsedScopeTypeId)) {
      console.log('Validation failed: scopeTypeId is not a valid integer');
      return res.status(400).json({ error: 'scopeTypeId must be a valid integer.' });
    }
    if (isNaN(parsedVehicleMiles)) {
      console.log('Validation failed: vehicleMiles is not a valid integer');
      return res.status(400).json({ error: 'vehicleMiles must be a valid integer.' });
    }
    if (isNaN(parsedCo2Kg)) {
      console.log('Validation failed: co2Kg is not a valid integer');
      return res.status(400).json({ error: 'co2Kg must be a valid integer.' });
    }
    if (isNaN(parsedCh4g)) {
      console.log('Validation failed: ch4g is not a valid integer');
      return res.status(400).json({ error: 'ch4g must be a valid integer.' });
    }
    if (isNaN(parsedN20g)) {
      console.log('Validation failed: n20g is not a valid integer');
      return res.status(400).json({ error: 'n20g must be a valid integer.' });
    }

    // Find the vehicleTypeId from the VehicleType table
    console.log(`Looking up vehicle type: ${vehicleType}`);
    const vehicleTypeRecord = await scope3Service.getVehicleTypeByName(vehicleType);
    if (!vehicleTypeRecord) {
      console.log(`Vehicle type "${vehicleType}" not found in the database`);
      return res.status(400).json({ error: `Vehicle type "${vehicleType}" not found.` });
    }
    console.log('Vehicle type found:', vehicleTypeRecord);

    // Create the BusinessTravel record
    console.log('Creating Business Travel record with data:', {
      scopeTypeId: parsedScopeTypeId,
      sourceDescription,
      vehicleTypeId: vehicleTypeRecord.vehicleTypeId,
      vehicleMiles: parsedVehicleMiles,
      co2Kg: parsedCo2Kg,
      ch4g: parsedCh4g,
      n20g: parsedN20g,
      date: date ? new Date(date) : new Date(),
    });
    const record = await scope3Service.createBusinessTravel({
      scopeTypeId: parsedScopeTypeId,
      sourceDescription,
      vehicleTypeId: vehicleTypeRecord.vehicleTypeId,
      vehicleMiles: parsedVehicleMiles,
      co2Kg: parsedCo2Kg,
      ch4g: parsedCh4g,
      n20g: parsedN20g,
      date: date ? new Date(date) : new Date(),
    });

    console.log('Business Travel record created successfully:', record);
    return res.status(201).json(record);
  } catch (err) {
    console.error('Error creating Business Travel record:', err);
    return res.status(400).json({ error: err.message });
  }
}

async function getAllBusinessTravel(req, res) {
  try {
    const records = await scope3Service.getAllBusinessTravel();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getBusinessTravelById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope3Service.getBusinessTravelById(id);
    if (!record) {
      return res.status(404).json({ error: 'Business Travel record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateBusinessTravel(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope3Service.updateBusinessTravel(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteBusinessTravel(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID must be a valid integer.' });
    }
    const deleted = await scope3Service.deleteBusinessTravel(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Business Travel record not found' });
    }
    return res.json({ message: 'Business Travel record deleted successfully', deleted });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- WASTE -----------------
async function createWaste(req, res) {
  try {
    const { scopeTypeId, sourceDescription, wasteType, disposalMethod, weight, unit, co2eKg, date } = req.body;

    // Validate scopeTypeId
    if (!scopeTypeId) {
      return res.status(400).json({ error: 'scopeTypeId is required.' });
    }

    // Find the wasteTypeId from the WasteType table
    const wasteTypeRecord = await scope3Service.getWasteTypeByName(wasteType);
    if (!wasteTypeRecord) {
      return res.status(400).json({ error: `Waste type "${wasteType}" not found.` });
    }

    // Find the unitId from the Unit table
    const unitRecord = await scope3Service.getUnitByName(unit);
    if (!unitRecord) {
      return res.status(400).json({ error: `Unit "${unit}" not found.` });
    }

    // Create the Waste record
    const record = await scope3Service.createWaste({
      scopeTypeId,
      sourceDescription,
      wasteTypeId: wasteTypeRecord.wasteTypeId,
      disposalMethod,
      weight,
      unitId: unitRecord.unitId,
      co2eKg,
      date: new Date(date),
    });

    return res.status(201).json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getAllWaste(req, res) {
  try {
    const records = await scope3Service.getAllWaste();
    return res.json(records);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function getWasteById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const record = await scope3Service.getWasteById(id);
    if (!record) {
      return res.status(404).json({ error: 'Waste record not found' });
    }
    return res.json(record);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function updateWaste(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const updated = await scope3Service.updateWaste(id, data);
    return res.json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

async function deleteWaste(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const deleted = await scope3Service.deleteWaste(id);
    return res.json(deleted);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

// ----------------- SCOPE 3 KPIs -----------------
/**
 * Controller to get Scope 3 KPIs.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
async function getScope3KPIs(req, res) {
  try {
    const { userId, startDate, endDate } = req.query;

    // Validate query parameters
    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required query parameters: userId, startDate, endDate.' });
    }

    // Parse dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate.' });
    }

    // Fetch KPIs
    const kpis = await scope3Service.getScope3KPIs(userId, parsedStartDate, parsedEndDate);
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  // Business Travel
  createBusinessTravel,
  getAllBusinessTravel,
  getBusinessTravelById,
  updateBusinessTravel,
  deleteBusinessTravel,



  // Waste
  createWaste,
  getAllWaste,
  getWasteById,
  updateWaste,
  deleteWaste,

  // Scope 3 KPIs
  getScope3KPIs,
};
