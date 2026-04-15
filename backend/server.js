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
    return res.status(500).json({ success: false, error: "RENDER_ENV_ERROR: WEBSCRAPING_AI_KEY is not set in Render settings." });
  }

  try {
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_KEY}&url=${encodeURIComponent(targetUrl)}&proxy=datacenter&js=false`;

    console.log(`[SCANNING]: ${query}`);

    const response = await axios.get(proxyUrl, { timeout: 30000 });
    
    // Parse links
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
    // THIS CAPTURES THE EXACT LOG
    const detailedError = error.response?.data?.message || error.response?.data || error.message;
    console.error("[BACKEND CRASH]:", detailedError);
    
    res.status(500).json({ 
      success: false, 
      error: `SERVER_LOG: ${detailedError}` 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Scanner Active` Sun Apr 15 2026));
