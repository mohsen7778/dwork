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
    return res.status(500).json({ success: false, error: "API Key Missing" });
  }

  try {
    // webscraping.ai recommends specific encoding for search queries
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    // We add &proxy=datacenter or &proxy=residential based on your plan 
    // to ensure Google doesn't block the request immediately
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_API_KEY}&url=${encodeURIComponent(targetUrl)}&proxy=residential&js=false`;

    console.log(`[Dwork] Initiating Proxy Scan for: ${query}`);

    const response = await axios.get(proxyUrl, { timeout: 30000 });
    const html = response.data;

    // More aggressive regex to capture Google's changing CSS classes
    const foundLinks = [];
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/g;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && foundLinks.length < 15) {
      const url = match[1];
      // Filter out Google's internal links and keep actual leaks
      if (url.startsWith('http') && !url.includes('google.com') && !url.includes('webcache')) {
        foundLinks.push(url);
      }
    }

    res.json({ 
      success: true, 
      results: foundLinks,
      count: foundLinks.length 
    });

  } catch (error) {
    console.error("[Dwork Error]:", error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.message || "Scan failed or timed out" 
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Dwork Automated Scanner on ${PORT}`));
