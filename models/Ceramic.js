const mongoose = require('mongoose');

const CeramicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  price: { type: Number, required: true, min: 0 },
  active: { type: Boolean, default: true },
  imgUrl: { type: String, trim: true, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Ceramic', CeramicSchema);