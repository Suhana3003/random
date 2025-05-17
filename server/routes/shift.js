const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = '123456';

// 🔐 Middleware to get current user from token
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// 📥 POST /api/shifts/import — manually add a few shifts (simulate CSV)
router.post('/import', async (req, res) => {
  const { shifts } = req.body; // array of shifts

  try {
    const savedShifts = await Shift.insertMany(shifts);
    res.json({ message: 'Shifts imported', data: savedShifts });
  } catch (err) {
    res.status(500).json({ message: 'Error importing shifts', error: err });
  }
});

// POST /api/shifts/bulk — upload multiple shifts from CSV (only managers)
router.post('/bulk', authMiddleware, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can upload shifts' });
  }

  const shiftData = req.body.shifts;

  if (!Array.isArray(shiftData)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  try {
    const shifts = shiftData.map(({ staffId, date, time, role }) => ({
      staffId,
      date: new Date(date),
      time,
      role,
    }));

    await Shift.insertMany(shifts);
    res.json({ message: 'Shifts uploaded successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 📤 GET /api/shifts/my — get shifts for logged-in user
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const shifts = await Shift.find({ staffId: req.user.id });
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching shifts' });
  }
});

module.exports = router;
