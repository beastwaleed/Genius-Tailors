const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  hex: { type: String, required: true }
});

const fabricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  desc: { type: String, default: '' },
  category: { type: String, default: 'General' },
  imageUrl: { type: String, default: '' },
  colors: [colorSchema]
}, { timestamps: true });

module.exports = mongoose.models.Fabric || mongoose.model('Fabric', fabricSchema);
