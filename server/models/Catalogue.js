// models/Catalogue.js
const { Schema, model } = require('mongoose');

const catalogueSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true
  },
  module: {
    type: String,
    enum: ['sale', 'purchase'],
    required: [true, 'Module is required']
  }
}, { timestamps: true });

const Catalogue = model('Catalogue', catalogueSchema);
module.exports = Catalogue;