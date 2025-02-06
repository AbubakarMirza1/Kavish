const express = require('express');
const router = express.Router();
const scope1Controller = require('../controllers/scope1Controller');

// STATIONARY COMBUSTION
router.post('/stationary', scope1Controller.createStationaryCombustion);
router.get('/stationary', scope1Controller.getAllStationaryCombustion);
router.get('/stationary/:id', scope1Controller.getStationaryCombustionById);
router.put('/stationary/:id', scope1Controller.updateStationaryCombustion);
router.delete('/stationary/:id', scope1Controller.deleteStationaryCombustion);

// MOBILE SOURCE
router.post('/mobile', scope1Controller.createMobileSource);
router.get('/mobile', scope1Controller.getAllMobileSources);
router.get('/mobile/:id', scope1Controller.getMobileSourceById);
router.put('/mobile/:id', scope1Controller.updateMobileSource);
router.delete('/mobile/:id', scope1Controller.deleteMobileSource);

// REFRIGERATION & AC
router.post('/refrigeration', scope1Controller.createRefrigerationAndAC);
router.get('/refrigeration', scope1Controller.getAllRefrigerationAndAC);
router.get('/refrigeration/:id', scope1Controller.getRefrigerationAndACById);
router.put('/refrigeration/:id', scope1Controller.updateRefrigerationAndAC);
router.delete('/refrigeration/:id', scope1Controller.deleteRefrigerationAndAC);

// FIRE SUPPRESSION
router.post('/fire', scope1Controller.createFireSuppression);
router.get('/fire', scope1Controller.getAllFireSuppression);
router.get('/fire/:id', scope1Controller.getFireSuppressionById);
router.put('/fire/:id', scope1Controller.updateFireSuppression);
router.delete('/fire/:id', scope1Controller.deleteFireSuppression);

// PURCHASED GAS
router.post('/purchased-gas', scope1Controller.createPurchasedGas);
router.get('/purchased-gas', scope1Controller.getAllPurchasedGas);
router.get('/purchased-gas/:gasId', scope1Controller.getPurchasedGasById);
router.put('/purchased-gas/:gasId', scope1Controller.updatePurchasedGas);
router.delete('/purchased-gas/:gasId', scope1Controller.deletePurchasedGas);

module.exports = router;
