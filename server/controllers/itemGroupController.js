// controllers/itemGroupController.js
const ItemGroup = require('../models/ItemGroup');

const createItemGroup = async (req, res) => {
  try {
    const itemGroupData = req.body;
    const itemGroup = new ItemGroup(itemGroupData);
    await itemGroup.save();
    res.status(201).json({ success: true, message: 'Item Group created successfully', data: itemGroup });
  } catch (error) {
    console.error('Error creating item group:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllItemGroups = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = { name: { $regex: search, $options: 'i' } };
    }

    const totalCount = await ItemGroup.countDocuments(query);
    const itemGroups = await ItemGroup.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: itemGroups,
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

const getItemGroupById = async (req, res) => {
  try {
    const itemGroup = await ItemGroup.findById(req.params.id);
    if (!itemGroup) return res.status(404).json({ success: false, message: 'Item Group not found' });
    res.status(200).json({ success: true, data: itemGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateItemGroup = async (req, res) => {
  try {
    const itemGroup = await ItemGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!itemGroup) return res.status(404).json({ success: false, message: 'Item Group not found' });
    res.status(200).json({ success: true, message: 'Item Group updated', data: itemGroup });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteItemGroup = async (req, res) => {
  try {
    const itemGroup = await ItemGroup.findByIdAndDelete(req.params.id);
    if (!itemGroup) return res.status(404).json({ success: false, message: 'Item Group not found' });
    res.status(200).json({ success: true, message: 'Item Group deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createItemGroup,
  getAllItemGroups,
  getItemGroupById,
  updateItemGroup,
  deleteItemGroup
};