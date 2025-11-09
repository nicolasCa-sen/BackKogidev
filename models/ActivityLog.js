const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g. "CREATE_INSUMO", "LOGIN"
  resource: { type: String }, // e.g. "Insumo:607..."
  details: { type: mongoose.Schema.Types.Mixed }, // any extra data
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
