const mongoose = require('mongoose');

const ProductSaleItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const CeramicSaleItemSchema = new mongoose.Schema({
  ceramicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ceramic', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const SaleSchema = new mongoose.Schema({
  products: { type: [ProductSaleItemSchema], default: [] },
  ceramics: { type: [CeramicSaleItemSchema], default: [] },
  totalAmount: { 
    type: Number, 
    required: true
    // ⭐ REMOVIDO: min: 0 para permitir gastos negativos
  },
  customer: { type: String, trim: true, default: '' },
  date: { type: Date, default: Date.now },
  // ⭐ NUEVO: Campo para identificar gastos fácilmente
  isExpense: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Índice para consultas por fecha
SaleSchema.index({ date: -1 });

module.exports = mongoose.model('Sale', SaleSchema);