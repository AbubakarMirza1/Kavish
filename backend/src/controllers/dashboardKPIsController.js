const { getDashboardKPIs } = require('../services/dashboardKPIsService');

async function getKPIs(req, res) {
  try {
    const { userId, startDate, endDate, period } = req.query;
    const kpis = await getDashboardKPIs(userId, startDate, endDate, period);
    res.status(200).json(kpis);
  } catch (error) {
    console.error('Error fetching Dashboard KPIs:', error);
    res.status(500).json({ error: 'Failed to fetch Dashboard KPIs' });
  }
}

module.exports = { getKPIs };