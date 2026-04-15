import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map((v) => v.trim()).filter(Boolean);

app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      cb(null, true);
      return;
    }
    cb(new Error("Origin not allowed by CORS"));
  },
}));

function requireApiToken(req, res, next) {
  const secureMode = process.env.REQUIRE_API_TOKEN === "true";
  if (!secureMode) return next();

  const token = req.header("x-api-token");
  if (token && token === process.env.INTERNAL_API_TOKEN) {
    return next();
  }

  return res.status(401).json({ error: "Unauthorized" });
}

app.get("/health", (_, res) => {
  res.json({ status: "ok", service: "drowk-backend", timestamp: new Date().toISOString() });
});

app.post("/api/scan", requireApiToken, (req, res) => {
  const { companyName, domains = [] } = req.body || {};

  if (!companyName) {
    return res.status(400).json({ error: "companyName is required" });
  }

  const normalizedDomains = domains
    .filter((d) => typeof d === "string")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  return res.json({
    status: "queued",
    companyName,
    domains: normalizedDomains,
    message: "Scan queued. Integrate your private leak detection engines here.",
  });
});

app.use((err, _req, res, _next) => {
  const isCorsError = String(err?.message || "").includes("CORS");
  if (isCorsError) {
    return res.status(403).json({ error: "CORS blocked" });
  }

  return res.status(500).json({ error: "Unexpected server error" });
});

app.listen(PORT, () => {
  console.log(`Drowk backend running on port ${PORT}`);
});
