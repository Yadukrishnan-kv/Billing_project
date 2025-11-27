const Customer = require('../models/Customer');
const { validationResult } = require('express-validator');
const XLSX = require('xlsx');

// Create a new customer
const createCustomer = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create customer object from request body
    const customerData = req.body;
    
    // Create new customer
    const customer = new Customer(customerData);
    
    // Save to database
    await customer.save();
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all customers
// In your customerController.js

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("catalogue", "name")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).populate(
      "catalogue",
      "name"
    );

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
const exportCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().populate("catalogue", "name");

    // Map to desired columns
    const worksheetData = customers.map(c => ({
      'ID': c.customerId || '',
      'Customer Name': c.customer || '',
      'Company': c.company || '',
      'Email': c.email || '',
      'Secondary Email': c.secondaryEmail || '',
      'Phone': c.phone || '',
      'TRN': c.trn || '',
      'Catalogue': c.catalogue?.name || '',
      'Currency': c.currency || '',
      'Tags': Array.isArray(c.tags) ? c.tags.join(', ') : '',
      'Payment Terms': c.paymentTerms || '',
      'Tax Type': c.taxType || '',
      'Place of Supply': c.placeOfSupply || '',
      'Assign Staff': c.assignStaff || '',
      'Opening Balance': c.openingBalance || '',
      'Tax Method': c.taxMethod || '',
      'Billing Address': c.billingAddress?.address || '',
      'Billing City': c.billingAddress?.city || '',
      'Billing State': c.billingAddress?.stateRegion || '',
      'Billing ZIP': c.billingAddress?.zipPostalCode || '',
      'Billing Country': c.billingAddress?.country || '',
      'Shipping Same as Billing': c.shippingAddress?.sameAsBilling ? 'Yes' : 'No',
      'Shipping Contact': c.shippingAddress?.contactPerson || '',
      'Shipping Address': c.shippingAddress?.address || '',
      'Shipping City': c.shippingAddress?.city || '',
      'Shipping State': c.shippingAddress?.stateRegion || '',
      'Shipping ZIP': c.shippingAddress?.zipPostalCode || '',
      'Shipping Country': c.shippingAddress?.country || '',
      'Shipping Phone': c.shippingAddress?.phone || '',
      'Created At': c.createdAt ? new Date(c.createdAt).toLocaleString() : '',
      'Updated At': c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ''
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting customers:', error);
    res.status(500).json({ success: false, message: 'Failed to export customers' });
  }
};

module.exports = {
  createCustomer,
  getCustomers, 
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  exportCustomers
};