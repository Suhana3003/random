const mongoose = require('mongoose');

const ShiftSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g. "09:00 - 17:00"
  role: { type: String, required: true }
});

module.exports = mongoose.model('Shift', ShiftSchema);
