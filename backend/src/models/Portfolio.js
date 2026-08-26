const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  category: { 
    type: String, 
    default: 'Kameez Shalwar',
    trim: true
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  altText: { 
    type: String, 
    default: '',
    trim: true
  },
  description: { 
    type: String, 
    default: '' 
  },
  featuredOnHome: { 
    type: Boolean, 
    default: true 
  },
  sortOrder: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema);
