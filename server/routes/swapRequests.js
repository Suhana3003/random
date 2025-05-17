const express = require('express');
const router = express.Router();
const SwapRequest = require('../models/SwapRequest');
const SwapAudit = require('../models/SwapAudit');
const Shift = require('../models/Shift');
const authMiddleware = require('../middleware/auth');

// POST /api/swaps - create a swap request
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { shiftId, note } = req.body;
    if (!shiftId) {
      return res.status(400).json({ message: 'Shift ID is required' });
    }

    const newSwap = new SwapRequest({
      requester: req.user.id,
      shift: shiftId,
      note,
      status: 'pending',  // default status
    });

    await newSwap.save();

    // Log audit:
    await SwapAudit.create({
      swapRequestId: newSwap._id,
      action: 'created',
      performedBy: req.user.id,
      details: 'Swap request created',
    });

    res.status(201).json(newSwap);
  } catch (error) {
    console.error('Error creating swap request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/swaps/open - get all pending swaps to volunteer
router.get('/open', authMiddleware, async (req, res) => {
  try {
    const swaps = await SwapRequest.find({ status: 'pending' })
      .populate('requester', 'name email')
      .populate('shift')
      .exec();

    res.json(swaps);
  } catch (err) {
    console.error('Error fetching open swaps:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/swaps/volunteer/:id - volunteer for a swap request
router.post('/volunteer/:id', authMiddleware, async (req, res) => {
  try {
    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (swap.status !== 'pending') {
      return res.status(400).json({ message: 'Swap request not available for volunteering' });
    }

    swap.status = 'volunteered';
    swap.volunteer = {
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
    };

    await swap.save();

    // Log audit:
    await SwapAudit.create({
      swapRequestId: swap._id,
      action: 'volunteered',
      performedBy: req.user.id,
      details: 'User volunteered for swap',
    });

    res.json({ message: 'You have volunteered for this swap request', swap });
  } catch (error) {
    console.error('Error volunteering for swap:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/swaps/for-approval - manager gets swaps with volunteers
router.get('/for-approval', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const swaps = await SwapRequest.find({ status: 'volunteered' })
      .populate('requester', 'name email')
      .populate('shift')
      .exec();

    res.json(swaps);
  } catch (error) {
    console.error('Error fetching swaps for approval:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/swaps/:id - update swap status (approve/reject)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'rejected', 'volunteered'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const swap = await SwapRequest.findById(req.params.id);
    if (!swap) {
      return res.status(404).json({ message: 'Swap request not found' });
    }

    if (status === 'approved') {
      if (!swap.volunteer || !swap.volunteer.userId) {
        return res.status(400).json({ message: 'No volunteer assigned for this swap' });
      }

      // Change shift ownership to volunteer
      await Shift.findByIdAndUpdate(swap.shift, { staffId: swap.volunteer.userId });
    }

    swap.status = status;
    await swap.save();

    // Log audit
    await SwapAudit.create({
      swapRequestId: swap._id,
      action: status,
      performedBy: req.user.id,
      details: `Swap request ${status} by manager`,
    });

    // Populate before sending response
    const updatedSwap = await swap
      .populate('requester', 'name email')
      .populate('shift')
      .execPopulate();

    res.json(updatedSwap);
  } catch (error) {
    console.error('Error updating swap request status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional: GET /api/swaps/audit/:swapRequestId - get audit log for a swap request (manager only)
router.get('/audit/:swapRequestId', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const auditLogs = await SwapAudit.find({ swapRequestId: req.params.swapRequestId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: 1 });

    res.json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/audit', authMiddleware, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { from, to, action } = req.query;
  const filter = {};

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  if (action) {
    filter.action = action;
  }

  try {
    const audits = await SwapAudit.find(filter)
  .populate({
    path: 'swapRequestId',
    populate: [
      { path: 'requester', select: 'name email' },
      { path: 'volunteer', select: 'name email' },
      { path: 'shift' }, // add any fields you need from the shift, e.g. date, type
    ],
  })
  .populate('performedBy', 'name email')
  .sort({ timestamp: -1 });


    res.json(audits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.get('/audit', authMiddleware, async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const { from, to, action } = req.query;
  const filter = {};

  if (from || to) {
    filter.timestamp = {};
    if (from) filter.timestamp.$gte = new Date(from);
    if (to) filter.timestamp.$lte = new Date(to);
  }

  if (action) {
    filter.action = action;
  }

  try {
    const audits = await SwapAudit.find(filter)
      .populate('swapRequestId', 'shiftDate shiftType requestedBy status')  // Populate specific swap request fields
      .populate('performedBy', 'name email')
      .sort({ timestamp: -1 });

    res.json(audits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// module.exports must remain at the end of the file
module.exports = router;
