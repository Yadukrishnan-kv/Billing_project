const { Schema, model } = require("mongoose");

// --- Counter Model (for auto-increment) ---
const CounterSchema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = model("Counter", CounterSchema);

// --- Customer Schema ---
const customerSchema = new Schema({
  // Auto-generated ID: CUS-0001, CUS-0002, ...
  customerId: {
    type: String,
    unique: true,
  },

  customer: {
    type: String,
    required: [true, 'Customer name is required']
  },
  company: {
    type: String
  },
  taxType: {
    type: String,
    enum: [
      'Vat Registered',
      'Non-Vat Registered',
      'Vat Registered - Designated ozones',
      'Non Vat Registered - Designated ozones',
      'GCC Vat Registered',
      'GCC Non Vat Registered',
      'Non-GCC'
    ],
    default: 'Vat Registered'
  },
  placeOfSupply: {
    type: String,
    enum: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah'],
    default: 'Abu Dhabi'
  },
  trn: {
    type: String
  },
  email: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,3}$/, 'Please enter a valid email']
  },
  secondaryEmail: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*\.\w{2,3}$/, 'Please enter a valid email']
  },
  phone: {
    type: String
  },
 catalogue: {
    type: Schema.Types.ObjectId,
    ref: "Catalogue",
    required: [true, "Please select a catalogue"],
    default: null,
  },
  currency: {
    type: String,
    enum: ['United Arab Emirates Dirham - AED', 'Qatari Riyal - QAR'],
    default: 'United Arab Emirates Dirham - AED'
  },
  tags: {
    type: [String]
  },
  paymentTerms: {
    type: String,
    enum: [
      'Default', 'Net 1','Net 3','Net 7','Net 10','Net 15',
      'Net 30','Net 45', 'Net 60', 'Due on Receipt'
    ],
    default: 'Default'
  },
  assignStaff: {
    type: String
  },
  openingBalance: {
    type: String,
    enum: ['Amount Receivable & Amount Payable', 'Amount Receivable', 'Amount Payable'],
    default: 'Amount Receivable'
  },
  taxMethod: {
    type: String,
    enum: ['Tax Exclusive', 'Tax Inclusive'],
    default: 'Tax Exclusive'
  },
  billingAddress: {
    address: { type: String },
    city: { type: String },
    stateRegion: { type: String },
    zipPostalCode: { type: String },
    country: {
      type: String,
      enum: [
        "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia",
        "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
        "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia",
        "Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros",
        "Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Democratic Republic of the Congo",
        "Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea",
        "Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada",
        "Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
        "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
        "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
        "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
        "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
        "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
        "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
        "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
        "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
        "Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
        "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
      ]
    },
  },
  shippingAddress: {
    sameAsBilling: { type: Boolean, default: false },
    contactPerson: { type: String },
    address: { type: String },
    city: { type: String },
    stateRegion: { type: String },
    zipPostalCode: { type: String },
    country: {
      type: String,
      enum: [
        "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia",
        "Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
        "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia",
        "Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros",
        "Congo (Congo-Brazzaville)","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Democratic Republic of the Congo",
        "Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea",
        "Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada",
        "Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland",
        "Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon",
        "Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
        "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
        "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway",
        "Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
        "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe",
        "Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa",
        "South Korea","South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
        "Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates",
        "United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
      ],
      
    },
    phone: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// --- Pre-save Hook: Generate CUS-0001, CUS-0002... ---
customerSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    const counter = await Counter.findOneAndUpdate(
      { _id: "customerId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.customerId = `CUS-${String(counter.seq).padStart(4, "0")}`;
    next();
  } catch (err) {
    next(err);
  }
});

const Customer = model("Customer", customerSchema);
module.exports = Customer;