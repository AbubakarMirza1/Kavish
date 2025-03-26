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
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'userId must be a valid integer' });
    }

    const start = new Date(startDate || '2024-01-01');
    const end = new Date(endDate || new Date());

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate' });
    }

    const kpis = await wasteKPIsService.getWasteKPIs(parsedUserId, start, end);
    return res.status(200).json(kpis);
  } catch (err) {
    console.error('Error in getWasteKPIs:', err);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getWasteKPIs,
};
