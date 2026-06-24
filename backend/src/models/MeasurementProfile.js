const mongoose = require('mongoose');

const measurementProfileSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  profileName: {
    type: String,
    required: true,
    trim: true // e.g., "Office Wear", "Eid Suit", "Casual"
  },
  measurements: {
    // We use a Map to store flexible key-value pairs (e.g., "chest": "40", "length": "38")
    // This allows different garments to have different measurement fields
    type: Map,
    of: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.models.MeasurementProfile || mongoose.model('MeasurementProfile', measurementProfileSchema);