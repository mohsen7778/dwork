import express from 'express';
import axios from 'axios';
import cors from 'cors';
import 'dotenv/config';

const app = express();
app.use(express.json());
app.use(cors());

const PROXY_API_KEY = process.env.WEBSCRAPING_AI_KEY;

app.post("/api/auto-scan", async (req, res) => {
  const { query } = req.body;
  
  if (!PROXY_API_KEY) {
    console.error("CRITICAL: WEBSCRAPING_AI_KEY is missing from Render Env Variables");
    return res.status(500).json({ success: false, error: "Backend API Key Missing" });
  }

  try {
    // Constructing the URL with fallback proxy settings
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_API_KEY}&url=${encodeURIComponent(targetUrl)}&proxy=datacenter&js=false`;

    console.log(`[Dwork] Scanning: ${query}`);

    const response = await axios.get(proxyUrl, { timeout: 20000 });
    const html = response.data;

    if (!html || typeof html !== 'string') {
      throw new Error("Empty response from proxy");
    }

    const foundLinks = [];
    // Enhanced Regex to grab actual search result links
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && foundLinks.length < 10) {
      const url = match[1];
      if (url.startsWith('http') && !url.includes('google.com') && !url.includes('webcache')) {
        foundLinks.push(url);
      }
    }

    console.log(`[Dwork] Success: Found ${foundLinks.length} results`);
    res.json({ success: true, results: foundLinks });

  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message;
    console.error("[Dwork Backend Error]:", errorMsg);
    
    // Send the actual error back to the UI terminal
    res.status(500).json({ 
      success: false, 
      error: errorMsg 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Dwork Backend Active on Port ${PORT}`));
