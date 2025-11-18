// routes/inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/createInventory', inventoryController.createInventory);
router.get('/getAllInventories', inventoryController.getAllInventories);
router.get('/getInventoryById/:id', inventoryController.getInventoryById);
router.put('/updateInventory/:id', inventoryController.updateInventory);
router.delete('/deleteInventory/:id', inventoryController.deleteInventory);

module.exports = router;