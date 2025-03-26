const express = require('express');
const router = express.Router();
const scope3Controller = require('../controllers/scope3Controller');

// Business Travel
router.post('/travel', scope3Controller.createBusinessTravel);
router.get('/travel', scope3Controller.getAllBusinessTravel);
router.get('/travel/:id', scope3Controller.getBusinessTravelById);
router.put('/travel/:id', scope3Controller.updateBusinessTravel);
router.delete('/travel/:id', scope3Controller.deleteBusinessTravel);

// Waste
router.post('/waste', scope3Controller.createWaste);
router.get('/waste', scope3Controller.getAllWaste);
router.get('/waste/:id', scope3Controller.getWasteById);
router.put('/waste/:id', scope3Controller.updateWaste);
router.delete('/waste/:id', scope3Controller.deleteWaste);

module.exports = router;
