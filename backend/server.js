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
    return res.status(500).json({ success: false, error: "CONFIG_ERROR: API Key missing in Render Env" });
  }

  try {
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    // Switched to datacenter for stability testing + added timeout
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_KEY}&url=${encodeURIComponent(targetUrl)}&proxy=datacenter&js=false`;

    console.log(`[SCANNING]: ${query}`);

    const response = await axios.get(proxyUrl, { 
      timeout: 30000,
      headers: { 'Accept-Encoding': 'gzip,deflate,compress' } 
    });
    
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
    // EXTRACTING THE REAL REASON
    let errorMessage = error.message;
    if (error.response && error.response.data) {
      errorMessage = typeof error.response.data === 'string' 
        ? error.response.data 
        : (error.response.data.message || JSON.stringify(error.response.data));
    }

    console.error("[PROXY_CRASH]:", errorMessage);
    res.status(500).json({ 
      success: false, 
      error: `SERVER_LOG: ${errorMessage}` 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Dwork Backend Live`));
