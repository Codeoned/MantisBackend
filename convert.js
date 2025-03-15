// File: /api/convert.js
// Deploy this file to Vercel as an API endpoint

import { AnthropicApi } from 'anthropic';

// Initialize Anthropic client with API key from environment variables
// Set this in your Vercel project settings
const anthropic = new AnthropicApi({
  apiKey: process.env.CLAUDE_API_KEY
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    // Call Claude API
    const response = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Convert this screenshot into clean, responsive HTML and CSS code. Give me separate HTML and CSS code that recreates this design as closely as possible. Focus on the structure, layout, colors, and spacing. Use modern CSS techniques where appropriate."
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/png",
                data: image
              }
            }
          ]
        }
      ]
    });

    // Extract HTML and CSS from Claude's response
    const content = response.content[0].text;
    
    const htmlMatch = content.match(/```html\s*([\s\S]*?)\s*```/);
    const cssMatch = content.match(/```css\s*([\s\S]*?)\s*```/);
    
    return res.status(200).json({
      html: htmlMatch ? htmlMatch[1].trim() : '',
      css: cssMatch ? cssMatch[1].trim() : '',
      fullResponse: content // Optional: include the full response for debugging
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ 
      error: 'Failed to process image', 
      details: error.message 
    });
  }
}