// routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  exportPurchases
} = require('../controllers/purchaseController');

router.post('/createPurchase', createPurchase);
router.get('/getAllPurchases', getAllPurchases);
router.get('/getPurchaseById/:id', getPurchaseById);
router.put('/updatePurchase/:id', updatePurchase);
router.delete('/deletePurchase/:id', deletePurchase);
router.get('/exportPurchases', exportPurchases);

module.exports = router;