// controllers/inventoryController.js
const Inventory = require('../models/Inventory');
const ItemGroup = require('../models/ItemGroup');

const createInventory = async (req, res) => {
  try {
    const inventoryData = req.body;
    const inventory = new Inventory(inventoryData);
    await inventory.save();
    res.status(201).json({ success: true, message: 'Inventory created successfully', data: inventory });
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllInventories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { itemNumber: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const totalCount = await Inventory.countDocuments(query);
    const inventories = await Inventory.find(query)
      .populate('itemGroup', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: inventories,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id).populate('itemGroup', 'name');
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });
    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });
    res.status(200).json({ success: true, message: 'Inventory updated', data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });
    res.status(200).json({ success: true, message: 'Inventory deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createInventory,
  getAllInventories,
  getInventoryById,
  updateInventory,
  deleteInventory
};