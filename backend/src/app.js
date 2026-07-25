const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const imageRoutes = require('./routes/imageRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// API Routes
app.use('/api', imageRoutes);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Image Recognition Agent API',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      analyze: 'POST /api/analyze (multipart/form-data with "image")',
      chat: 'POST /api/chat (multipart/form-data or json)'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

module.exports = app;
