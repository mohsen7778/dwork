import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());

// ── CORS: allow Vercel frontend and local dev ────────────────────
const allowedOrigins = [
  process.env.ALLOWED_ORIGIN,
  'http://localhost:5173', // For local dev
  'https://dwork-frontend-rho.vercel.app' // Your Vercel frontend
].filter(Boolean); // Remove empty/undefined values

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-api-key'],
}));

// ── API key middleware ────────────────────────────────────────────
const requireApiKey = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if (!process.env.APP_API_KEY || key !== process.env.APP_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: missing or invalid x-api-key header.' });
  }
  next();
};

// ── Request logger ────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Health check (no auth needed for Render uptime pings) ─────────
app.get('/', (_req, res) => res.json({ status: 'Dwork Backend Online' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Main scan endpoint ────────────────────────────────────────────
app.post('/api/auto-scan', requireApiKey, async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid "query" in request body.' });
  }

  const PROXY_KEY = process.env.WEBSCRAPING_AI_KEY;
  if (!PROXY_KEY) {
    return res.status(500).json({ error: 'RENDER_CONFIG_ERROR: WEBSCRAPING_AI_KEY is not set.' });
  }

  console.log(`[SCAN] Query: ${query.slice(0, 120)}`);

  try {
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=10`;

    // Updated proxy URL with proxy=residential and js=true
    const proxyUrl =
      `https://api.webscraping.ai/html` +
      `?api_key=${PROXY_KEY}` +
      `&url=${encodeURIComponent(googleUrl)}` +
      `&proxy=residential` +  // Updated to residential
      `&js=true` +
      `&timeout=15000`;

    const response = await axios.get(proxyUrl, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = response.data;

    // Check if the response is HTML (likely a CAPTCHA or error page)
    if (html.includes('<html') || html.includes('CAPTCHA')) {
      return res.status(500).json({
        error: 'PROXY_BLOCKED: Google returned a CAPTCHA or error page. Check your proxy or IP.'
      });
    }

    // Extract links from Google search results
    const foundLinks = [];
    const googleLinkRegex = /href="\/url\?q=(https?[^&"]+)/g;
    let match;

    while ((match = googleLinkRegex.exec(html)) !== null && foundLinks.length < 10) {
      try {
        const decoded = decodeURIComponent(match[1]);
        // Filter out Google's own internal links and ad tracking URLs
        if (
          !decoded.includes('google.com') &&
          !decoded.includes('googleadservices') &&
          !decoded.includes('accounts.google') &&
          decoded.startsWith('http')
        ) {
          if (!foundLinks.includes(decoded)) {
            foundLinks.push(decoded);
          }
        }
      } catch {
        // skip malformed URLs
      }
    }

    console.log(`[SCAN] Extracted ${foundLinks.length} links.`);
    res.json({ success: true, results: foundLinks });

  } catch (error) {
    const detail = error.response?.data?.message || error.message;
    console.error('[PROXY_CRASH]:', detail);

    // Surface the real error so the frontend log terminal shows it
    res.status(500).json({ error: `PROXY_FAIL: ${detail}` });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Dwork backend active on port ${PORT}`));