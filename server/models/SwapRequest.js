const mongoose = require('mongoose');

const swapRequestSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shift: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
  note: { type: String },
  status: { type: String, default: 'pending' }, // pending, volunteered, approved, rejected
  volunteer: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
  }, 
}, { timestamps: true });
module.exports = mongoose.model('SwapRequest', swapRequestSchema);
