// server.js

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Enable CORS for all routes and methods
app.use(cors({
  origin: '*', // Allow all origins, can restrict to specific domains if needed
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Set request body size limits for large payloads (base64 images)
app.use(bodyParser.json({ limit: '20mb' })); // Increased limit to 20mb for larger images
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// ✅ Proxy endpoint to handle Anthropic API requests
app.post('/api/claude', async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY; // Read API key securely from environment variables
  const payload = req.body;

  if (!apiKey) {
    return res.status(500).json({ error: 'Anthropic API key not configured on server.' });
  }

  try {
    // Call Anthropic's API
    const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      }
    });

    // Return Claude API response to client
    res.json(response.data);
  } catch (error) {
    console.error('Claude API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to communicate with Claude API.', details: error.response?.data || error.message });
  }
});

// ✅ Start server and listen on defined port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
