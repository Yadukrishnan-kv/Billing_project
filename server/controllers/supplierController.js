const Supplier = require('../models/Supplier');
const XLSX = require('xlsx');

// Create a new supplier
const createSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const savedSupplier = await supplier.save();
    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: savedSupplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating supplier',
      error: error.message,
    });
  }
};

// Get all suppliers
const getAllSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching suppliers',
      error: error.message,
    });
  }
};

// Get supplier by ID
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }
    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching supplier',
      error: error.message,
    });
  }
};

// Update supplier
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating supplier',
      error: error.message,
    });
  }
};

// Delete supplier
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting supplier',
      error: error.message,
    });
  }
};
// Export suppliers as Excel (.xlsx)
const exportSuppliers = async (req, res) => {
  try {
    // Fetch all suppliers
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    // Format data for Excel
    const worksheetData = suppliers.map(s => ({
      'ID': s.supplierId || s._id?.toString().slice(-6).toUpperCase() || '',
      'Name': s.supplierName || '',
      'Company': s.company || '',
      'Tax Type': s.taxType || '',
      'Source of Supply': s.sourceOfSupply || '',
      'TRN': s.trn || '',
      'Email': s.email || '',
      'Secondary Email': s.secondaryEmail || '',
      'Phone': s.phone || '',
      'Catalogue': s.catalogue || '',
      'Currency': s.currency || '',
      'Tags': s.tags || '',
      'Payment Terms': s.paymentTerms || '',
      'Opening Balance': s.openingBalance || '',
      'Tax Method': s.taxMethod || '',
      'Address': s.address || '',
      'City': s.city || '',
      'State': s.state || '',
      'ZIP Code': s.zipCode || '',
      'Country': s.country || '',
      'Created At': s.createdAt ? new Date(s.createdAt).toLocaleString() : ''
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=suppliers.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting suppliers:', error);
    res.status(500).json({ success: false, message: 'Failed to export suppliers' });
  }
};

module.exports = {
  createSupplier,
  getAllSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier,
    exportSuppliers
};