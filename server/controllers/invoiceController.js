const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

// Create new invoice
// controllers/invoiceController.js
const createInvoice = async (req, res) => {
  try {
    const { customer, items = [], ...rest } = req.body;

    if (!customer) {
      return res.status(400).json({ message: 'Customer is required' });
    }

    const customerData = await Customer.findById(customer);
    if (!customerData) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const invoiceData = {
      ...rest,
      customer,
      items,
      billingAddress: customerData.billingAddress,
      trn: customerData.trn || '',
      // Ensure correct types
      taxInclusive: rest.taxInclusive || 'No',
      paymentTerms: rest.paymentTerms || 'Due on Receipt',
      discountMethod: rest.discountMethod || 'Line Wise',
      adjustment: parseFloat(rest.adjustment) || 0
    };

    const invoice = new Invoice(invoiceData);
    await invoice.save();

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Get search parameter
    const search = req.query.search || '';
    
    // Build query object
    let query = {};
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { 'customer.company': { $regex: search, $options: 'i' } },
          { _id: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Get total count for pagination
    const totalCount = await Invoice.countDocuments(query);

    // Get invoices with population and pagination
    const invoices = await Invoice.find(query)
      .populate('customer', 'customer company email billingAddress trn')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single invoice by ID
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'customer company trn billingAddress')
      .exec();

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update invoice
const updateInvoice = async (req, res) => {
  try {
    const { customer } = req.body;

    // If customer changed, update billing address and TRN
    let updatedData = { ...req.body };

    if (customer && customer !== req.body.customer) {
      const customerData = await Customer.findById(customer);
      if (!customerData) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      updatedData.billingAddress = customerData.billingAddress;
      updatedData.trn = customerData.trn || '';
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete invoice
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Generate & Download PDF Invoice
const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'customer company email billingAddress trn')
      .exec();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    // Render EJS template to HTML string
    const templatePath = path.join(__dirname, '..', 'templates', 'invoice-template.ejs');
    const html = await ejs.renderFile(templatePath, { invoice });

    // Launch browser
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set content from rendered HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm'
      }
    });

    await browser.close();

    // Send PDF as response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice._id}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message
    });
  }
};


module.exports = {
  createInvoice,getAllInvoices,
  getInvoiceById,
    updateInvoice,
    deleteInvoice,
    downloadInvoicePDF
};