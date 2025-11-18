// models/Purchase.js
const { Schema, model } = require("mongoose");

const purchaseItemSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  itemName: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, default: 1, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  total: { type: Number, required: true }
});

const purchaseSchema = new Schema({
  billNumber: {
    type: String,
    unique: true,
    required: [true, 'Bill number is required'],
  },
  supplier: {
    type: Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required']
  },
  title: {
    type: String,
    required: [true, 'Purchase title is required']
  },
  status: {
    type: String,
    enum: ['Draft', 'Published'],
    default: 'Draft'
  },
  taxInclusive: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'No'
  },
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  showQuantityAs: {
    type: String,
    enum: ['Qty', 'Hours', 'Days', 'Units'],
    default: 'Qty'
  },
  date: { type: Date, default: Date.now },
  paymentTerms: {
    type: String,
    enum: [
      'Due on Receipt', 'Net 1', 'Net 3', 'Net 7', 'Net 10',
      'Net 15', 'Net 30', 'Net 45', 'Net 60'
    ],
    default: 'Net 30'
  },
  references: String,
  discountMethod: {
    type: String,
    enum: ['Line Wise', 'Bill Wise Before Tax', 'Bill Wise After Tax'],
    default: 'Line Wise'
  },
  discountValue: { type: Number, default: 0 },
  items: [purchaseItemSchema],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  notes: String
}, { timestamps: true });

// Pre-save hook to calculate totals
purchaseSchema.pre('save', function(next) {
  let subtotal = 0;
  let totalTax = 0;
  let lineDiscountTotal = 0;

  this.items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    const lineDiscount = lineTotal * (item.discount / 100);
    const taxable = lineTotal - lineDiscount;
    const tax = taxable * 0.05; // Assuming 5% VAT (adjust as needed)
    const lineNet = taxable + tax;

    item.total = parseFloat(lineNet.toFixed(2));
    subtotal += taxable;
    totalTax += tax;
    lineDiscountTotal += lineDiscount;
  });

  this.subtotal = parseFloat(subtotal.toFixed(2));
  this.tax = parseFloat(totalTax.toFixed(2));

  let discountAmount = 0;
  if (this.discountMethod === 'Bill Wise Before Tax') {
    discountAmount = subtotal * (this.discountValue / 100);
  } else if (this.discountMethod === 'Bill Wise After Tax') {
    discountAmount = (subtotal + totalTax) * (this.discountValue / 100);
  }

  this.total = parseFloat((subtotal + totalTax - discountAmount).toFixed(2));

  next();
});

const Purchase = model("Purchase", purchaseSchema);
module.exports = Purchase;