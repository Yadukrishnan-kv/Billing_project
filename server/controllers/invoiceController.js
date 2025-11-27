const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const XLSX = require('xlsx');
const converter = require('number-to-words');
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



const downloadInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'company billingAddress trn contactPerson phone')
      .exec();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoiceId = invoice._id.toString();
    const shortId = invoiceId.slice(-6).toUpperCase();

    // Amount in Words
    const amountInWords = () => {
      if (!invoice.total || invoice.total === 0) return 'Zero Dirhams Only';
      const whole = Math.floor(invoice.total);
      const decimal = Math.round((invoice.total - whole) * 100);
      let words = converter.toWords(whole);
      words = words.charAt(0).toUpperCase() + words.slice(1);
      if (decimal > 0) {
        words += ` Dirhams and ${converter.toWords(decimal)} Fils Only`;
      } else {
        words += ' Dirhams Only';
      }
      return words;
    };

    const words = amountInWords();
    const taxAmount = invoice.total - invoice.subtotal;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>INV-${shortId}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
    body { font-family: 'Roboto', Arial, sans-serif; margin: 0; padding: 0; background: #f9f9f9; color: #333; }
    .container { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; box-shadow: 0 0 20px rgba(0,0,0,0.1); padding: 25px 30px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 3px solid #e91e63; }
    .header h1 { margin: 0; font-size: 36px; color: #e91e63; font-weight: 700; letter-spacing: 1px; }
    .inv-no { font-size: 20px; font-weight: 600; color: #e91e63; margin: 8px 0; }
    .status-badge {
      display: inline-block; padding: 8px 20px; border-radius: 30px; font-weight: bold; font-size: 14px; margin-top: 10px;
    }
    .unpaid { background: #fdf2f2; color: #e91e63; border: 1px solid #e91e63; }
    .company-info { text-align: right; font-size: 14px; line-height: 1.7; }
    .company-info strong { font-size: 18px; color: #e91e63; }

    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin: 30px 0; }
    .box { background: #f8f9fa; padding: 20px; border-radius: 10px; border-left: 5px solid #e91e63; }
    .box h3 { margin: 0 0 15px 0; color: #e91e63; font-size: 16px; }
    .box p { margin: 6px 0; font-size: 14px; }

    table { width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 14px; }
    th { background: #e91e63; color: white; padding: 15px 10px; text-align: center; font-weight: 600; }
    td { padding: 14px 10px; border-bottom: 1px solid #eee; text-align: center; }
    tr:nth-child(even) { background: #fdf2f2; }
    tr:hover { background: #fce4ec; }

    .totals { width: 380px; margin: 30px 0 30px auto; border: 2px solid #e91e63; border-radius: 10px; overflow: hidden; }
    .totals tr td { padding: 12px 20px; font-size: 15px; }
    .totals tr td:first-child { background: #e91e63; color: white; font-weight: bold; }
    .totals .total-row td { background: #e91e63; color: white; font-size: 18px; font-weight: bold; }

    .amount-words { background: #fff8f9; padding: 20px; border-radius: 10px; border: 2px dashed #e91e63; font-size: 16px; font-weight: 600; margin: 30px 0; text-align: center; color: #e91e63; }

    .terms { margin-top: 50px; font-size: 11px; line-height: 1.8; color: #555; }
    .terms h4 { color: #e91e63; margin-bottom: 15px; font-size: 15px; }
    .bank-details { background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0; }

    @page { margin: 0; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">

    <div class="header">
      <div>
        <h1>INVOICE</h1>
        <div class="inv-no">#INV-${shortId}</div>
        <div class="status-badge unpaid">Unpaid</div>
      </div>
      <div class="company-info">
        <strong>ZYDANS TECHNOLOGIES L.L.C</strong><br>
        Business Bay<br>
        Dubai 0000<br>
        United Arab Emirates<br>
        TRN: 105185032700003
      </div>
    </div>

    <div class="info-grid">
      <div class="box">
        <h3>Bill To</h3>
        <p><strong>${invoice.customer?.company || 'N/A'}</strong></p>
        <p>ATTN: ${invoice.customer?.contactPerson || 'N/A'}</p>
        <p>${invoice.customer?.billingAddress?.address || ''}</p>
        <p>${invoice.customer?.billingAddress?.city || ''}, ${invoice.customer?.billingAddress?.country || ''}</p>
        <p>TRN: ${invoice.trn || 'N/A'}</p>
        <p>Sales Person: ${invoice.salesPerson || 'Balakrishnan'}</p>
      </div>
      <div class="box">
        <h3>Invoice Details</h3>
        <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString('en-GB')}</p>
        <p><strong>Payment Terms:</strong> ${invoice.paymentTerms || 'Due on Receipt'}</p>
        <p><strong>Place of Supply:</strong> Dubai</p>
        <p><strong>Total Amount:</strong> AED ${invoice.total.toFixed(2)}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>S/L</th>
          <th>Item Description</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Tax %</th>
          <th>Tax Amount</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${invoice.items.map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td style="text-align: left; padding-left: 15px;">${item.itemName}</td>
            <td>${item.qty}</td>
            <td>AED ${item.price.toFixed(2)}</td>
            <td>${item.taxRate || 5}%</td>
            <td>AED ${(item.qty * item.price * (item.taxRate || 5) / 100).toFixed(2)}</td>
            <td><strong>AED ${item.total.toFixed(2)}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <table class="totals">
      <tr><td>Subtotal</td><td>AED ${invoice.subtotal.toFixed(2)}</td></tr>
      <tr><td>VAT (5%)</td><td>AED ${taxAmount.toFixed(2)}</td></tr>
      <tr class="total-row"><td>TOTAL</td><td>AED ${invoice.total.toFixed(2)}</td></tr>
    </table>

    <div class="amount-words">
      Amount in Words:<br>
      <span style="font-size: 18px;">${words}</span>
    </div>

    <div class="terms">
      <h4>Terms & Conditions</h4>
      <div class="bank-details">
        <strong>Bank Details:</strong><br>
        Account Name: ZYDANS TECHNOLOGIES L.L.C<br>
        Bank Name: RAKBANK<br>
        A/c No.: 0333620685001<br>
        IBAN: AE860400000333620685001
      </div>
      <ol style="padding-left: 20px; margin: 15px 0;">
        <li>The Invoice to be presented for any warranty for 12 months from the date of Invoice.</li>
        <li>The title of the above goods does not pass to purchase until said goods fully paid.</li>
        <li>Dhs.200 labour will be charged if parts for warranty found not faulty.</li>
        <li>1 year warranty is given for computer systems (software not included).</li>
        <li>All HP, Toshiba, IBM, Dell, Acer, NEC, Canon and Hikvision carry warranty undertaken by the respective agents at their service centers only.</li>
        <li>The above items have been received in good conditions.</li>
      </ol>
    </div>

  </div>
</body>
</html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '15mm', right: '15mm' }
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=INV-${shortId}.pdf`
    });
    res.send(pdf);

  } catch (error) {
    console.error('PDF Generation Failed:', error);
    res.status(500).json({ success: false, message: 'PDF generation failed', error: error.message });
  }
};

const exportInvoices = async (req, res) => {
  try {
    // Fetch all invoices with customer populated (same as getAllInvoices but without pagination)
    const invoices = await Invoice.find()
      .populate('customer', 'customer company')
      .sort({ createdAt: -1 });

    // Format data for Excel
    const worksheetData = invoices.map(inv => ({
      'ID': inv._id ? inv._id.toString().slice(-6).toUpperCase() : '',
      'Title': inv.title || '',
      'Customer': inv.customer?.company || inv.customer?.customer || '',
      'Status': inv.status || '',
      'Date': inv.date ? new Date(inv.date).toLocaleDateString() : '',
      'Subtotal': inv.subtotal ? Number(inv.subtotal).toFixed(2) : '0.00',
      'Discount': inv.discountAmount ? Number(inv.discountAmount).toFixed(2) : '0.00',
      'Total': inv.total ? Number(inv.total).toFixed(2) : '0.00',
      'Payment Terms': inv.paymentTerms || '',
      'TRN': inv.trn || '',
      'Reference': inv.reference || '',
      'Sales Person': inv.salesPerson || '',
      'Items Count': inv.items ? inv.items.length : 0,
      'Created At': inv.createdAt ? new Date(inv.createdAt).toLocaleString() : ''
    }));

    // Create workbook
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Invoices');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Disposition', 'attachment; filename=invoices.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to export invoices' });
  }
};

module.exports = {
  createInvoice,getAllInvoices,
  getInvoiceById,
    updateInvoice,
    deleteInvoice,
    downloadInvoicePDF,exportInvoices
};