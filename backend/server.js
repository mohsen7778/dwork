import "dotenv/config";
import cors from "cors";
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());
app.use(cors());

const PROXY_API_KEY = process.env.WEBSCRAPING_AI_KEY;

app.post("/api/auto-scan", async (req, res) => {
  const { query } = req.body;
  
  try {
    // 1. We send the dork to the proxy instead of Google directly
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_API_KEY}&url=${encodeURIComponent(targetUrl)}`;

    const response = await axios.get(proxyUrl);
    const html = response.data;

    // 2. Simple logic to find links (H3 tags in Google results)
    // This is a basic example; you can refine this with 'cheerio' later
    const foundLinks = [];
    const linkRegex = /<a href="\/url\?q=(.*?)&amp;/g;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && foundLinks.length < 5) {
      if (!match[1].includes("google.com")) {
        foundLinks.push(decodeURIComponent(match[1]));
      }
    }

    res.json({ success: true, results: foundLinks });
  } catch (error) {
    console.error("Scan Failed:", error.message);
    res.status(500).json({ success: false, error: "Scan timed out or blocked" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Dwork Automated Scanner on ${PORT}`));
