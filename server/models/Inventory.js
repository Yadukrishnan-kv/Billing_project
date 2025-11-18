// models/Inventory.js
const { Schema, model } = require('mongoose');

const purchaseSubSchema = new Schema({
  purchaseAccount: { type: String },
  debitNoteAccount: { type: String },
  rate: { type: Number, min: 0, default: 0 }
});

const salesSubSchema = new Schema({
  saleAccount: { type: String },
  creditPriceType: { type: String },
  noteAccount: { type: String },
  rate: { type: Number, min: 0, default: 0 }
});

const itemAttributeSubSchema = new Schema({
  trackInventory: { type: Boolean, default: false },
  openingStock: { type: Number, default: 0, min: 0 },
  openingStockValue: { type: Number, default: 0, min: 0 }
});

const inventorySchema = new Schema({
  type: {
    type: String,
    enum: ['product', 'service'],
    default: 'product'
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  itemNumber: {
    type: String,
    unique: true,
    sparse: true  // Allows multiple null/undefined values while still enforcing uniqueness when present
  },
  unit: { type: String },
  tax: {
    type: String,
    enum: ['Vat-5.00%', 'zero rate-0.00%'],
    default: 'Vat-5.00%'
  },
  hsnSac: { type: String },
  offer: { type: String },
  description: { type: String },

  purchase: {
    type: [purchaseSubSchema],
    default: [{ purchaseAccount: '', debitNoteAccount: '', rate: 0 }]
  },
  sales: {
    type: [salesSubSchema],
    default: [{ saleAccount: '', creditPriceType: '', noteAccount: '', rate: 0 }]
  },
  itemAttribute: {
    type: [itemAttributeSubSchema],
    default: [{ trackInventory: false, openingStock: 0, openingStockValue: 0 }]
  },
  itemGroup: {
    type: Schema.Types.ObjectId,
    ref: 'ItemGroup'
    // Not required anymore — can be selected optionally
  }
}, { timestamps: true });

// Ensure unique index works properly with optional itemNumber
inventorySchema.index({ itemNumber: 1 }, { unique: true, sparse: true });

const Inventory = model('Inventory', inventorySchema);

module.exports = Inventory;