const { getScope3KPIs } = require('../services/scope3KPIsService');

async function getKPIs(req, res) {
  try {
    const { userId, startDate, endDate, period } = req.query;
    const kpis = await getScope3KPIs(userId, startDate, endDate, period);
    res.status(200).json(kpis);
  } catch (error) {
    console.error('Error fetching Scope 3 KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch Scope 3 KPIs' });
  }
}

module.exports = { getKPIs };