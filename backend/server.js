import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

const PROXY_KEY = process.env.WEBSCRAPING_AI_KEY;

// LOG EVERY REQUEST FOR DEBUGGING
app.use((req, res, next) => {
  console.log(`Incoming: ${req.method} ${req.url}`);
  next();
});

// The main scan route
app.post("/api/auto-scan", async (req, res) => {
  const { query } = req.body;
  if (!PROXY_KEY) return res.status(500).json({ error: "Missing API Key" });

  try {
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_KEY}&url=${encodeURIComponent(targetUrl)}&proxy=datacenter&js=false`;

    const response = await axios.get(proxyUrl, { timeout: 25000 });
    const foundLinks = [];
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
    let match;
    while ((match = linkRegex.exec(response.data)) !== null && foundLinks.length < 10) {
      if (match[1].startsWith('http') && !match[1].includes('google.com')) {
        foundLinks.push(match[1]);
      }
    }
    res.json({ success: true, results: foundLinks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// FALLBACK ROUTE: If it hits the wrong path, this will catch it
app.use((req, res) => {
  res.status(404).json({ error: `Path ${req.url} not found on this server.` });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Scanner Active on port ${PORT}`));
