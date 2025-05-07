const { getWasteKPIs } = require('../services/wasteKPIsService');

async function getKPIs(req, res) {
  try {
    const { userId, startDate, endDate, period } = req.query;
    const kpis = await getWasteKPIs(userId, startDate, endDate, period);
    res.status(200).json(kpis);
  } catch (error) {
    console.error('Error fetching Waste KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch Waste KPIs' });
  }
}

module.exports = { getKPIs };