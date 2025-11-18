// controllers/purchaseController.js
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');

const createPurchase = async (req, res) => {
  try {
    const { supplier, billNumber, items = [], ...rest } = req.body;

    if (!supplier || !billNumber) {
      return res.status(400).json({ message: 'Supplier and Bill Number are required' });
    }

    const existingBill = await Purchase.findOne({ billNumber });
    if (existingBill) {
      return res.status(400).json({ message: 'Bill number already exists' });
    }

    const supplierData = await Supplier.findById(supplier);
    if (!supplierData) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    const purchaseData = {
      ...rest,
      supplier,
      billNumber,
      items,
      billingAddress: supplierData.billingAddress || {},
      shippingAddress: supplierData.shippingAddress || {}
    };

    const purchase = new Purchase(purchaseData);
    await purchase.save();

    res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: purchase
    });
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getAllPurchases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    let query = {};
    if (search) {
      query = {
        $or: [
          { billNumber: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { 'supplier.companyName': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const totalCount = await Purchase.countDocuments(query);
    const purchases = await Purchase.find(query)
      .populate('supplier', 'companyName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: purchases,
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

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplier', 'companyName email billingAddress shippingAddress')
      .populate('items.itemId', 'name sku');

    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });

    res.status(200).json({ success: true, data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const { supplier } = req.body;
    let updatedData = { ...req.body };

    if (supplier) {
      const supplierData = await Supplier.findById(supplier);
      if (!supplierData) return res.status(404).json({ message: 'Supplier not found' });

      updatedData.billingAddress = supplierData.billingAddress;
      updatedData.shippingAddress = supplierData.shippingAddress;
    }

    const purchase = await Purchase.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });

    res.status(200).json({ success: true, message: 'Purchase updated', data: purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ success: false, message: 'Purchase not found' });

    res.status(200).json({ success: true, message: 'Purchase deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase
};