const express = require('express');
const router = express.Router();
const scope2Controller = require('../controllers/scope2Controller');

// Electricity
router.post('/electricity', scope2Controller.createElectricity);
router.get('/electricity', scope2Controller.getAllElectricity);
router.get('/electricity/:id', scope2Controller.getElectricityById);
router.put('/electricity/:id', scope2Controller.updateElectricity);
router.delete('/electricity/:id', scope2Controller.deleteElectricity);

// Steam
router.post('/steam', scope2Controller.createSteam);
router.get('/steam', scope2Controller.getAllSteam);
router.get('/steam/:id', scope2Controller.getSteamById);
router.put('/steam/:id', scope2Controller.updateSteam);
router.delete('/steam/:id', scope2Controller.deleteSteam);

module.exports = router;
