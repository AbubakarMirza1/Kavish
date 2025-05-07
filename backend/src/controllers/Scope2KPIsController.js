const { getScope2KPIs } = require('../services/Scope2KPIsService');

async function getKPIs(req, res) {
  try {
    const { userId, startDate, endDate, period } = req.query;
    const kpis = await getScope2KPIs(userId, startDate, endDate, period);
    res.status(200).json(kpis);
  } catch (error) {
    console.error('Error fetching Scope 2 KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch Scope 2 KPIs' });
  }
}

module.exports = { getKPIs };
