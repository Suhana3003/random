// models/SwapAudit.js
const mongoose = require('mongoose');

const SwapAuditSchema = new mongoose.Schema({
  swapRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'SwapRequest', required: true },
  action: { type: String, enum: ['created', 'volunteered', 'approved', 'rejected'], required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }, // optional notes or details
});

module.exports = mongoose.model('SwapAudit', SwapAuditSchema);
