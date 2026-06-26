const mongoose = require('mongoose');

const abandonedCartSchema = new mongoose.Schema({
  customer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: false // Might be a guest user or unauthenticated
  },
  customerEmail: { type: String, required: false },
  customerPhone: { type: String, required: false },
  customerName:  { type: String, required: false },
  
  serviceName: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  
  // Array of steps the customer completed before dropping off
  // e.g., ['Measurements', 'Fabric Selection', 'Address Input']
  completedSteps: [String],
  
  // Where exactly did they abandon?
  dropoffStep: { type: String, default: 'Checkout' },
  
  // Status of recovery (Pending, Recovered, Lost)
  recoveryStatus: {
    type: String,
    enum: ['Pending', 'Recovered', 'Lost'],
    default: 'Pending'
  },
  
  // Has an automated recovery message been sent?
  recoveryMessageSent: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.models.AbandonedCart || mongoose.model('AbandonedCart', abandonedCartSchema);
