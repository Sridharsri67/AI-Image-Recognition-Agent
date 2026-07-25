const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const imageAgent = require('../agents/imageAgent');
const geminiService = require('../services/geminiService');

/**
 * @route   POST /api/analyze
 * @desc    Analyze uploaded image with LangGraph StateGraph AI Agent
 * @access  Public
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  const startTime = Date.now();
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided. Please upload an image.' });
    }

    const apiKey = req.headers['x-gemini-api-key'] || req.body.apiKey || process.env.GEMINI_API_KEY || '';
    const imageBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;

    const analysis = await geminiService.analyzeImage({
      imageBuffer,
      mimeType,
      apiKey,
      filename: req.file.originalname
    });

    const endTime = Date.now();

    return res.status(200).json({
      framework: 'Google Gemini API (Direct)',
      agent: 'VisionCore Agent v1.0',
      status: 'success',
      executionTimeMs: endTime - startTime,
      timestamp: new Date().toISOString(),
      analysis
    });
  } catch (error) {
    console.error('Error in /api/analyze:', error);
    return res.status(500).json({
      error: 'Failed to complete image analysis',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/health
 * @desc    Health check & environment diagnostics
 * @access  Public
 */
router.get('/health', (req, res) => {
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  const hasKey = apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';

  return res.status(200).json({
    status: 'online',
    framework: 'Google Gemini API (Direct)',
    system: 'AI Image Recognition Agent',
    geminiConfigured: hasKey,
    mode: hasKey ? 'live' : 'fallback-demo',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
