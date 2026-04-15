# Drowk (Private Cyber Exposure Scanner)

Drowk is a private cybersecurity assistant for companies/firms to quickly run curated OSINT-style checks and detect potential public leaks early.

- **Frontend**: React + Vite, deploy to **Vercel**
- **Backend**: Node.js + Express, deploy to **Render**

> ⚠️ Use this only on authorized targets you own or are contracted to assess.

---

## 1) Project Structure

- `Dwork.jsx`: Main scanner UI.
- `src/`: Vite entry files.
- `backend/`: Express API service (Render deploy target).
- `vercel.json`: Vercel build settings.
- `render.yaml`: Render blueprint for backend.

---

## 2) Local Development

### Frontend

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`.

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Runs at `http://localhost:8080`.

Test backend:

```bash
curl http://localhost:8080/health
```

---

## 3) Deploy Backend on Render

1. Push your repo to GitHub.
2. In Render: **New +** → **Blueprint**.
3. Select this repo. Render will read `render.yaml`.
4. Set secrets in Render dashboard:
   - `APP_API_KEY`: long random token.
   - `ALLOWED_ORIGIN`: your Vercel domain (example: `https://drowk.vercel.app`).
5. Deploy.
6. Copy backend URL, e.g. `https://drowk-backend.onrender.com`.

---

## 4) Deploy Frontend on Vercel

1. In Vercel: **Add New Project** and import this repo.
2. Framework preset should detect **Vite**.
3. Add environment variable:
   - `VITE_API_BASE_URL=https://your-render-service.onrender.com`
4. Deploy.

---

## 5) Keep It Private (Important)

Because your tool is not meant to be public:

1. **Protect Vercel access**:
   - Prefer Vercel Authentication/Team SSO (if available in your plan).
   - At minimum, use deployment protection/password protection features available in your Vercel tier.
2. **Backend API key protection**:
   - Frontend requests should include `x-api-key` only through a secure pattern (prefer server-side proxy where possible).
   - Rotate `APP_API_KEY` regularly.
3. **Restrict CORS**:
   - Keep `ALLOWED_ORIGIN` limited to your exact Vercel domain.
4. **Audit logs**:
   - Enable Render/Vercel logs + alerting.

---

## 6) Next Steps to “Complete” the Product

- Add authentication (Clerk/Auth0/SAML).
- Add a job queue (BullMQ/SQS) for scheduled scans.
- Save findings in Postgres.
- Add notifications (Slack/Email/Webhook).
- Add analyst workflow (confirm false-positive, assign severity, close issue).
- Add legal/compliance controls (scope allowlist + consent records).

---

## 7) API Contract (Current Starter)

### `GET /health`
Returns service status.

### `POST /api/scans` (protected)
Headers:
- `x-api-key: <APP_API_KEY>`

Body:

```json
{
  "target": "example.com",
  "category": "credentials",
  "severity": "high",
  "note": "Quarterly monitoring run"
}
```

Response: queued/accepted placeholder, ready to connect with your real scanner pipeline.
