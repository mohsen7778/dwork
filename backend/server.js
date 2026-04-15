import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

const PROXY_KEY = process.env.WEBSCRAPING_AI_KEY;

// LOG EVERYTHING
app.use((req, res, next) => {
  console.log(`[HANDSHAKE] ${req.method} ${req.path}`);
  next();
});

// THE EXACT ROUTE YOUR FRONTEND IS CALLING
app.post("/api/auto-scan", async (req, res) => {
  const { query } = req.body;
  console.log(`[SCANNING]: ${query}`);

  if (!PROXY_KEY) {
    return res.status(500).json({ error: "RENDER_CONFIG_ERROR: API Key is missing in Render settings." });
  }

  try {
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_KEY}&url=${encodeURIComponent(targetUrl)}&proxy=datacenter&js=false`;

    const response = await axios.get(proxyUrl, { timeout: 30000 });
    
    const foundLinks = [];
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
    let match;
    while ((match = linkRegex.exec(response.data)) !== null && foundLinks.length < 10) {
      const url = match[1];
      if (url.startsWith('http') && !url.includes('google.com')) {
        foundLinks.push(url);
      }
    }

    res.json({ success: true, results: foundLinks });

  } catch (error) {
    const detail = error.response?.data?.message || error.message;
    console.error("[PROXY_CRASH]:", detail);
    res.status(500).json({ error: `PROXY_FAIL: ${detail}` });
  }
});

// Default root route so the URL doesn't show an error in the browser
app.get("/", (req, res) => res.json({ status: "Dwork Backend Online" }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Scanner Brain Active on Port ${PORT}`));
