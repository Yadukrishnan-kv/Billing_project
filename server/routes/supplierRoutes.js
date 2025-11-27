const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');

// CRUD Routes
router.post('/createSupplier', supplierController.createSupplier);
router.get('/getAllSuppliers', supplierController.getAllSuppliers);
router.get('/getSupplierById/:id', supplierController.getSupplierById);
router.put('/updateSupplier/:id', supplierController.updateSupplier);
router.delete('/deleteSupplier/:id', supplierController.deleteSupplier);
router.get('/exportSuppliers', supplierController.exportSuppliers);

module.exports = router;
