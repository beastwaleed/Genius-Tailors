const mongoose = require('mongoose');

const retargetingCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  targetAudience: {
    type: String,
    default: 'all'
  },
  promoCode: {
    type: String,
    default: 'VIP10',
    trim: true
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'Fixed'],
    default: 'Percentage'
  },
  discountValue: {
    type: Number,
    default: 10
  },
  channels: [{
    type: String,
    enum: ['email', 'whatsapp', 'popup']
  }],
  customMessage: {
    type: String,
    default: ''
  },
  totalTargeted: {
    type: Number,
    default: 0
  },
  emailsSent: {
    type: Number,
    default: 0
  },
  whatsappSent: {
    type: Number,
    default: 0
  },
  popupCreated: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    default: 'Completed'
  }
}, { timestamps: true });

module.exports = mongoose.models.RetargetingCampaign || mongoose.model('RetargetingCampaign', retargetingCampaignSchema);
