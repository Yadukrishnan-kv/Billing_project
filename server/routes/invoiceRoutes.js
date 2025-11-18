const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

// GET single invoice by ID
router.get('/getInvoiceById/:id', invoiceController.getInvoiceById);

// PUT update invoice
router.put('/updateInvoice/:id', invoiceController.updateInvoice);

// DELETE invoice
router.delete('/deleteInvoice/:id', invoiceController.deleteInvoice);

// POST create invoice
router.post('/createInvoice', invoiceController.createInvoice);

// GET download invoice as PDF
router.get('/downloadInvoicePDF/:id/download', invoiceController.downloadInvoicePDF);

// GET all invoices (for view page)
router.get('/getAllInvoices', invoiceController.getAllInvoices);

module.exports = router;