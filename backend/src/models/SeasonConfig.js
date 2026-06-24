const mongoose = require('mongoose');

/**
 * SeasonConfig — tracks peak tailoring seasons (Ramazan, Eid).
 *
 * Only ONE season should be active at a time. When a season is active,
 * the order placement route automatically tags new orders with the season
 * name and grants Gold members priority status (PDF §14).
 */
const seasonConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // e.g., "Ramazan 2026", "Eid ul Fitr 2026"
  },
  type: {
    type: String,
    enum: ['Ramazan', 'Eid', 'Normal'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  // Optional message shown to customers during this season
  announcement: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.models.SeasonConfig || mongoose.model('SeasonConfig', seasonConfigSchema);
