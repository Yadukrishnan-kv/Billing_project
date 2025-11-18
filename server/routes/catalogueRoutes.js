// routes/catalogueRoutes.js
const express = require('express');
const router = express.Router();
const catalogueController = require('../controllers/catalogueController');

router.post('/createCatalogue', catalogueController.createCatalogue);
router.get('/getAllCatalogues', catalogueController.getAllCatalogues);
router.get('/getCatalogueById/:id', catalogueController.getCatalogueById);
router.put('/updateCatalogue/:id', catalogueController.updateCatalogue);
router.delete('/deleteCatalogue/:id', catalogueController.deleteCatalogue);

module.exports = router;