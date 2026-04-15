app.post("/api/auto-scan", async (req, res) => {
  const { query } = req.body;
  
  if (!PROXY_API_KEY) {
    console.error("Missing WEBSCRAPING_AI_KEY in Environment Variables");
    return res.status(500).json({ success: false, error: "Server API Key not configured" });
  }

  try {
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    const proxyUrl = `https://api.webscraping.ai/v1?api_key=${PROXY_API_KEY}&url=${encodeURIComponent(targetUrl)}`;

    console.log(`Scanning: ${targetUrl}`);
    
    const response = await axios.get(proxyUrl, { timeout: 15000 });
    const html = response.data;

    const foundLinks = [];
    const linkRegex = /<a href="\/url\?q=(.*?)&amp;/g;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && foundLinks.length < 10) {
      if (!match[1].includes("google.com")) {
        foundLinks.push(decodeURIComponent(match[1]));
      }
    }

    res.json({ success: true, results: foundLinks });
  } catch (error) {
    console.error("Scan Failed:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.status === 403 ? "Proxy Auth Failed" : "Scan Timeout/Block" 
    });
  }
});
