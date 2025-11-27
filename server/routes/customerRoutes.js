const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

// GET all customers
router.get('/getCustomers', customerController.getCustomers);

// GET single customer
router.get('/getCustomerById/:id', customerController.getCustomerById);

// POST create customer
router.post('/createCustomer', customerController.createCustomer);

// PUT update customer
router.put('/updateCustomer/:id', customerController.updateCustomer);

// DELETE customer
router.delete('/deleteCustomer/:id', customerController.deleteCustomer);
// At the top with other routes
router.get('/exportCustomers', customerController.exportCustomers);

module.exports = router;