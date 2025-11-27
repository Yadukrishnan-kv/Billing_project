// controllers/purchaseController.js
const Purchase = require('../models/Purchase');
const Supplier = require('../models/Supplier');
const XLSX = require('xlsx');

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

// Export purchases as Excel (.xlsx)
const exportPurchases = async (req, res) => {
  try {
    // Fetch all purchases with supplier populated
    const purchases = await Purchase.find()
      .populate('supplier', 'companyName')
      .sort({ createdAt: -1 });

    // Format data for Excel
    const worksheetData = purchases.map(p => ({
      'Bill Number': p.billNumber || p._id?.toString().slice(-6).toUpperCase() || '',
      'Title': p.title || '',
      'Supplier': p.supplier?.companyName || '',
      'Status': p.status || '',
      'Date': p.date ? new Date(p.date).toLocaleDateString() : '',
      'Subtotal': p.subtotal ? Number(p.subtotal).toFixed(2) : '0.00',
      'Discount': p.discountValue ? Number(p.discountValue).toFixed(2) : '0.00',
      'Tax': p.tax ? Number(p.tax).toFixed(2) : '0.00',
      'Total': p.total ? Number(p.total).toFixed(2) : '0.00',
      'Payment Terms': p.paymentTerms || '',
      'References': p.references || '',
      'Discount Method': p.discountMethod || '',
      'Show Quantity As': p.showQuantityAs || '',
      'Tax Inclusive': p.taxInclusive || '',
      'Notes': p.notes || '',
      'Created At': p.createdAt ? new Date(p.createdAt).toLocaleString() : ''
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchases');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=purchases.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting purchases:', error);
    res.status(500).json({ success: false, message: 'Failed to export purchases' });
  }
};

module.exports = {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  exportPurchases
};