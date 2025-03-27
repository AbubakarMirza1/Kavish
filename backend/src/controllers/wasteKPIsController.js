/***********************************************
 * controllers/wasteKPIsController.js
 * Controller for Waste KPIs
 ***********************************************/

const wasteKPIsService = require('../services/wasteKPIsService');

/**
 * Controller to get Waste KPIs.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
async function getWasteKPIs(req, res) {
  console.log('Received request to /api/waste/kpis');
  try {
    const { userId, startDate, endDate } = req.query;

    console.log('Request query params:', { userId, startDate, endDate });

    if (!userId) {
      console.log('Missing userId in request');
      return res.status(400).json({ error: 'userId is required' });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      console.log('Invalid userId:', userId);
      return res.status(400).json({ error: 'userId must be a valid integer' });
    }

    const start = startDate ? new Date(startDate) : new Date('2024-01-01');
    const end = endDate ? new Date(endDate) : new Date();

    if (isNaN(start) || isNaN(end)) {
      console.log('Invalid dates:', { startDate, endDate });
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate' });
    }

    console.log('Parsed dates:', { start: start.toISOString(), end: end.toISOString() });

    const kpis = await wasteKPIsService.getWasteKPIs(parsedUserId, start, end);
    console.log('Returning KPIs:', kpis);
    return res.status(200).json(kpis);
  } catch (err) {
    console.error('Error in getWasteKPIs:', err.message);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getWasteKPIs,
};
