const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  customerNumber: { type: String, unique: true },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Guest', 'Customer', 'Admin'],
    default: 'Customer'
  },
  phone: {
    type: String,
    required: false
  },
  location: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    country: { type: String, required: false, default: 'Pakistan' }
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  membershipLevel: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold'],
    default: 'Bronze'
  },

  // ── CRM & Marketing Modules ──────────────────────────────────────
  ltv: {
    type: Number,
    default: 0,
    index: true // Indexed for fast filtering by Lifetime Value
  },
  orderCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    index: true // Indexed for Custom Audience/Marketing segmentation
  }],
  adminNotes: {
    type: String,
    trim: true,
    default: ''
  },

  // ── Feature 6: Password Reset ────────────────────────────────────
  // Hashed reset token stored temporarily; expires after 15 minutes.
  resetPasswordToken:   { type: String,  default: null },
  resetPasswordExpires: { type: Date,    default: null }

}, { 
  timestamps: true // Automatically adds createdAt and updatedAt dates
});

userSchema.pre('save', async function() {
  if (!this.customerNumber) {
    this.customerNumber = 'CUS-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);