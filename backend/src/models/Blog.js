const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  summary: {
    type: String
  },
  featuredImage: {
    type: String
  },
  altText: {
    type: String
  },
  tags: {
    type: [String]
  },
  metaTitle: {
    type: String,
    maxLength: 60
  },
  metaDescription: {
    type: String,
    maxLength: 160
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  sharesCount: {
    type: Number,
    default: 0
  },
  readTimeMinutes: {
    type: Number,
    default: 2
  },
  dailyViews: [{
    date: { type: String }, // Format: YYYY-MM-DD
    count: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
