const mongoose = require('mongoose');
const Organization = require('./organization');
const Subscription = require('./subscription');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: Organization,
    required: true
  },
  // subscriptionId:{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: Subscription,
  //   required: true
  // },
 
  isActive: {
    type: Boolean,
    default: true
  },
  
}, {timestamps: true});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;