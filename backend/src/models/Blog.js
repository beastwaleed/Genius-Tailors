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
  }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
