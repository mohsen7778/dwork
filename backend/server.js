import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

const PROXY_KEY = process.env.WEBSCRAPING_AI_KEY;

app.post("/api/auto-scan", async (req, res) => {
  const { query } = req.body;
  
  if (!PROXY_KEY) {
    return res.status(500).json({ success: false, error: "RENDER_ENV_MISSING: WEBSCRAPING_AI_KEY not found in Render." });
  }

  try {
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    // We use datacenter proxy here because residential often fails on free/trial accounts
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_KEY}&url=${encodeURIComponent(targetUrl)}&proxy=datacenter&js=false`;

    console.log(`Scanning Google for: ${query}`);

    const response = await axios.get(proxyUrl, { timeout: 25000 });
    
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
    // This captures the EXACT reason from the proxy or network
    const rawError = error.response?.data?.message || error.response?.data || error.message;
    console.error("Backend Error:", rawError);
    
    res.status(500).json({ 
      success: false, 
      error: `PROXY_ERR: ${rawError}` 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Scanner Brain Online`));
