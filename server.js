// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config(); // For environment variables

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.post('/api/claude', async (req, res) => {
    const apiKey = process.env.ANTHROPIC_API_KEY; // Store securely in .env file
    const payload = req.body;

    try {
        const response = await axios.post('https://api.anthropic.com/v1/messages', payload, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Claude API Error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to communicate with Claude API.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
