// ============================================
// Vocal Bridge Token Server for Profe Matilda
// ============================================
// This server:
//   1. Serves the static index.html app
//   2. Provides /api/voice-token endpoint to securely
//      generate LiveKit tokens via Vocal Bridge API

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Token Endpoint ─────────────────────────
app.post('/api/voice-token', async (req, res) => {
  const apiKey = process.env.VOCAL_BRIDGE_API_KEY;

  if (!apiKey) {
    console.error('❌ VOCAL_BRIDGE_API_KEY not set in .env');
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const participantName = req.body?.participant_name || 'Zaid';

    const response = await fetch('https://vocalbridgeai.com/api/v1/token', {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participant_name: participantName }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Vocal Bridge API error:', response.status, errorText);
      return res.status(response.status).json({
        error: 'Failed to get token from Vocal Bridge',
        details: errorText,
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Token endpoint error:', err.message);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// ── Fallback to index.html ─────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start Server ───────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌟 ¡Súper Zaid! server running at http://localhost:${PORT}`);
  console.log(`🎤 Voice token endpoint: http://localhost:${PORT}/api/voice-token\n`);
});
