// models/ItemGroup.js
const { Schema, model } = require('mongoose');

const itemGroupSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true
  }
}, { timestamps: true });

const ItemGroup = model('ItemGroup', itemGroupSchema);  
module.exports = ItemGroup;