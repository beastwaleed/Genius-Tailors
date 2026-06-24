const mongoose = require('mongoose');

const loyaltyRecordSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Reference to the order that triggered this transaction (optional for redemptions)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  // 'earned' when an order is placed, 'redeemed' when points are used for a discount
  type: {
    type: String,
    enum: ['earned', 'redeemed'],
    required: true
  },
  points: {
    type: Number,
    required: true // Positive for earned, positive value representing the points redeemed
  },
  description: {
    type: String // e.g., "Points earned on order #12345" or "Points redeemed for Rs.200 discount"
  }
}, { timestamps: true });

module.exports = mongoose.models.LoyaltyRecord || mongoose.model('LoyaltyRecord', loyaltyRecordSchema);
