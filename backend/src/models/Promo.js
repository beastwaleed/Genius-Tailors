const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'Flat'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true
  },
  minSpend: {
    type: Number,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  requiredTags: [{
    type: String,
    trim: true
  }], // If empty, anyone can use it. If "VIP", only users with "VIP" tag can use it.
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.models.Promo || mongoose.model('Promo', promoSchema);
