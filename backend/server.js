import "dotenv/config";
import cors from "cors";
import express from "express";
import helmet from "helmet";

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => res.json({ status: "Dwork API Online" }));

app.post("/api/scans", (req, res) => {
  const { target, dorkLabel } = req.body;
  console.log(`Scan initiated for: ${target} on ${dorkLabel}`);
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
