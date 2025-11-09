const mongoose = require('mongoose');

const MovementSchema = new mongoose.Schema({
  insumo: { type: mongoose.Schema.Types.ObjectId, ref: 'Insumo', required: true },
  tipo: { type: String, enum: ['entrada','salida'], required: true },
  cantidad: { type: Number, required: true },
  motivo: { type: String },
  proveedor: { type: String },
  fecha: { type: Date, default: Date.now },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Movement', MovementSchema);
