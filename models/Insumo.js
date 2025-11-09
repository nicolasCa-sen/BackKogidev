const mongoose = require('mongoose');

const InsumoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String },
  categoria: { type: String, required: true },
  cantidad: { type: Number, required: true, default: 0 },
  proveedor: { type: String },
  fechaIngreso: { type: Date, default: Date.now },
  precioUnitario: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

InsumoSchema.pre('save', function(next){
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Insumo', InsumoSchema);
