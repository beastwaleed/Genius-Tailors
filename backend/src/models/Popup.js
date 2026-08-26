const mongoose = require('mongoose');

const popupSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true 
  },
  description: { 
    type: String, 
    default: '',
    trim: true 
  },
  imageUrl: { 
    type: String, 
    default: '' 
  },
  imagePlacement: { 
    type: String, 
    enum: ['left', 'right', 'top', 'bottom'], 
    default: 'left' 
  },
  badgeText: { 
    type: String, 
    default: '🔥 SPECIAL OFFER',
    trim: true 
  },
  badgeBgColor: { 
    type: String, 
    default: '#ef4444' 
  },
  badgeTextColor: { 
    type: String, 
    default: '#ffffff' 
  },
  // Call to Action (CTA)
  ctaType: { 
    type: String, 
    enum: ['link', 'form'], 
    default: 'link' 
  },
  ctaText: { 
    type: String, 
    default: 'Claim Offer Now',
    trim: true 
  },
  ctaLink: { 
    type: String, 
    default: '/booking',
    trim: true 
  },
  ctaSuccessMessage: { 
    type: String, 
    default: 'Thank you! Our master tailor will call you shortly.',
    trim: true 
  },
  // Styling & Colors
  backgroundColor: { 
    type: String, 
    default: '#ffffff' 
  },
  titleColor: { 
    type: String, 
    default: '#0f172a' 
  },
  descriptionColor: { 
    type: String, 
    default: '#475569' 
  },
  ctaBgColor: { 
    type: String, 
    default: '#0f172a' 
  },
  ctaTextColor: { 
    type: String, 
    default: '#ffffff' 
  },
  // Countdown Timer
  enableCountdown: { 
    type: Boolean, 
    default: false 
  },
  countdownEndTime: { 
    type: Date, 
    default: null 
  },
  timerBgColor: { 
    type: String, 
    default: '#f1f5f9' 
  },
  timerTextColor: { 
    type: String, 
    default: '#0f172a' 
  },
  // Target Pages Rules
  targetPages: {
    type: String,
    enum: ['all', 'home', 'booking', 'services', 'custom'],
    default: 'all'
  },
  customPagePath: {
    type: String,
    default: '',
    trim: true
  },
  // Smart Trigger Options
  triggerType: {
    type: String,
    enum: ['time_delay', 'scroll_percentage', 'exit_intent', 'immediate'],
    default: 'time_delay'
  },
  scrollPercentage: {
    type: Number,
    default: 30
  },
  delaySeconds: { 
    type: Number, 
    default: 2 
  },
  showOncePerSession: { 
    type: Boolean, 
    default: true 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  // Analytics Tracking
  impressionsCount: { 
    type: Number, 
    default: 0 
  },
  clicksCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.models.Popup || mongoose.model('Popup', popupSchema);
