/***********************************************
 * controllers/scope2KPIsController.js
 * Controller for Scope 2 KPIs (Electricity and Steam)
 ***********************************************/

const scope2KPIsService = require('../services/Scope2KPIsService');

/**
 * Controller to get Scope 2 KPIs.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
async function getScope2KPIs(req, res) {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required query parameters: userId, startDate, endDate.' });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: 'userId must be a valid integer.' });
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedStartDate) || isNaN(parsedEndDate)) {
      return res.status(400).json({ error: 'Invalid date format for startDate or endDate.' });
    }

    const kpis = await scope2KPIsService.getScope2KPIs(parsedUserId, parsedStartDate, parsedEndDate);
    res.json(kpis);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getScope2KPIs,
};
