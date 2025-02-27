// backend/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/recycling-recommendations', analyticsController.getAnalyticsData);

module.exports = router;
