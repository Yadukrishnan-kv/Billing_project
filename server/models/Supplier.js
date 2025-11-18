// models/Supplier.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Static counter (persists in memory while server runs)
let supplierCounter = 0;

const supplierSchema = new Schema(
  {
    supplierId: {
      type: String,
      unique: true,
      sparse: true,
    },
    supplierName: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    taxType: {
      type: String,
      enum: ["Vat Registered", "Non Vat Registered"],
      default: "Vat Registered",
    },
    sourceOfSupply: { type: String, trim: true },
    trn: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    secondaryEmail: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    catalogue: { type: String, default: "Default" },
    currency: { type: String, default: "United Arab Emirates Dirham - AED" },
    tags: { type: String, trim: true },
    paymentTerms: { type: String, default: "Default" },
    openingBalance: {
      type: String,
      default: "Amount Receivable/Amount Payable",
    },
    taxMethod: {
      type: String,
      enum: ["Tax Inclusive", "Tax Exclusive"],
      default: "Tax Exclusive",
    },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: "United Arab Emirates" },
  },
  { timestamps: true }
);

// Auto-increment on save (simple & clean — same as your Customer)
supplierSchema.pre("save", async function (next) {
  if (this.isNew && !this.supplierId) {
    try {
      // Find the highest existing number
      const lastSupplier = await this.constructor.findOne(
        { supplierId: { $exists: true } },
        {},
        { sort: { supplierId: -1 } }
      );

      let nextNum = 1;
      if (lastSupplier && lastSupplier.supplierId) {
        const match = lastSupplier.supplierId.match(/SUP-(\d+)/);
        if (match) nextNum = parseInt(match[1]) + 1;
      }

      this.supplierId = `SUP-${String(nextNum).padStart(4, "0")}`;
    } catch (err) {
      return next(err);
    }
  }
  next();
});

const Supplier = model("Supplier", supplierSchema);
module.exports = Supplier;
