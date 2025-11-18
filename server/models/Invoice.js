// models/Invoice.js
const { Schema, model } = require("mongoose");

const invoiceSchema = new Schema({
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  title: {
    type: String,
    required: [true, 'Invoice title is required']
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  billingAddress: {
    address: String,
    city: String,
    stateRegion: String,
    zipPostalCode: String,
    country: String
  },
  shippingAddress: {
    sameAsBilling: { type: Boolean, default: false },
    contactPerson: String,
    address: String,
    city: String,
    stateRegion: String,
    zipPostalCode: String,
    country: String,
    phone: String
  },
  date: { type: Date, default: Date.now },
  paymentTerms: {
    type: String,
    enum: [
      'Due on Receipt',
      'Net 1', 'Net 3', 'Net 7', 'Net 10', 'Net 15',
      'Net 30', 'Net 45', 'Net 60'
    ],
    default: 'Due on Receipt'
  },
  discountMethod: {
    type: String,
    enum: ['Line Wise', 'Bill Wise Before Tax', 'Bill Wise After Tax'],
    default: 'Line Wise'
  },
  taxInclusive: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  showQuantityAs: {
    type: String,
    enum: ['Qty', 'Hours', 'Days', 'Units'],
    default: 'Qty'
  },
  trn: String,
  reference: String,
  salesPerson: { type: String, default: '' },
  items: [
    {
      itemName: { type: String },
      qty: { type: Number, min: 0 },
      price: { type: Number, min: 0 },
      discount: { type: Number, min: 0, max: 100 },
      taxRate: { type: Number },
      total: { type: Number }
    }
  ],
  subtotal: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  adjustment: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  terms: {
    type: String,
    default: 'Bank Details: Account Name : ZYDANS TECHNOLOGIES L.L.C\nBank Name : RAK\nA/c. No. : 0333620685001'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save: Calculate totals
invoiceSchema.pre('save', function(next) {
  let subtotal = 0;
  let totalTax = 0;
  let lineDiscountTotal = 0;

  this.items.forEach(item => {
    const lineTotal = item.qty * item.price;
    const lineDiscount = lineTotal * (item.discount / 100);
    const taxable = lineTotal - lineDiscount;
    const tax = taxable * (item.taxRate / 100);
    const lineNet = taxable + tax;

    item.total = parseFloat(lineNet.toFixed(2));
    subtotal += taxable;
    totalTax += tax;
    lineDiscountTotal += lineDiscount;
  });

  this.subtotal = parseFloat(subtotal.toFixed(2));

  // Bill-wise discount (add input later)
  let discountAmount = 0;
  if (this.discountMethod === 'Bill Wise Before Tax') {
    discountAmount = 0; // Placeholder
  } else if (this.discountMethod === 'Bill Wise After Tax') {
    discountAmount = 0;
  }
  this.discountAmount = parseFloat(discountAmount.toFixed(2));

  const grandTotal = subtotal + totalTax - discountAmount + (this.adjustment || 0);
  this.total = parseFloat(grandTotal.toFixed(2));

  next();
});

module.exports = model('Invoice', invoiceSchema);