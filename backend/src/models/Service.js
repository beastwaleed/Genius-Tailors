const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // e.g., "Shalwar Kameez", "Kurta Pajama"
  },
  description: {
    type: String
  },
  basePrice: {
    type: Number,
    required: true
  },
  images: [{
    type: String
  }],
  // The customization options available for this specific garment
  customizations: {
    collarStyles: [{ type: String }], // e.g., ["Ban", "Classic", "Sherwani"]
    sleeveStyles: [{ type: String }], // e.g., ["Cuff", "Open"]
    frontStyles: [{ type: String }], // e.g., ["Hidden Placket", "Visible Buttons"]
    backStyles: [{ type: String }], // e.g., ["Plain", "Pleated"] — for shirts (PDF §5.1)
    bottomStyles: [{ type: String }]  // e.g., ["Straight Shalwar", "Pajama"]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.models.Service || mongoose.model('Service', serviceSchema);