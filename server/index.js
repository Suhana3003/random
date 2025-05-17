const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing JSON body

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/shiftswap', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ MongoDB Connected');
}).catch((err) => {
  console.error('❌ Mongo Error:', err);
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shifts', require('./routes/shift'));
app.use('/api/swaps', require('./routes/swapRequests'));

// Root route
app.get('/', (req, res) => {
  res.send('ShiftSwap Backend is running ✅');
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
