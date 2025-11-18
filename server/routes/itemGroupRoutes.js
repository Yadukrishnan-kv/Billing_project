// routes/itemGroupRoutes.js
const express = require('express');
const router = express.Router();
const itemGroupController = require('../controllers/itemGroupController');

router.post('/createItemGroup', itemGroupController.createItemGroup);
router.get('/getAllItemGroups', itemGroupController.getAllItemGroups);
router.get('/getItemGroupById/:id', itemGroupController.getItemGroupById);
router.put('/updateItemGroup/:id', itemGroupController.updateItemGroup);
router.delete('/deleteItemGroup/:id', itemGroupController.deleteItemGroup);

module.exports = router;