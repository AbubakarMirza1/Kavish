// backend/controllers/analyticsController.js
const analyticsService = require('../services/analyticsService');

const getAnalyticsData = async (req, res) => {
  try {
    const userId = req.query.userId || 'default-user-id'; // Use query param or default
    const analyticsData = await analyticsService.getAnalyticsData(userId);
    res.json(analyticsData);
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAnalyticsData,
};
