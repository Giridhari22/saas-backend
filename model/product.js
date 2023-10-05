const mongoose = require('mongoose');
const Customer = require("./customer");
const Organization = require("./organization")

const productSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Customer,
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Organization,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },

}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;