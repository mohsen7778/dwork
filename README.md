# Drowk

Private cybersecurity leak-discovery tooling split across:

- **Frontend (Vite + React)** → deploy on **Vercel**
- **Backend (Node + Express)** → deploy on **Render**

## Project structure

- `frontend/`: UI app and dork console.
- `backend/`: private API service for scan orchestration.
- `render.yaml`: Infrastructure blueprint for Render.

## Local setup

### 1) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### 2) Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Deploy backend to Render

### Option A: `render.yaml` Blueprint (recommended)

1. Push repository to GitHub.
2. In Render, choose **New +** → **Blueprint**.
3. Select this repository.
4. Render reads `render.yaml` and creates `drowk-backend`.
5. Set secure env vars in Render dashboard:
   - `CORS_ORIGINS=https://<your-vercel-domain>`
   - `INTERNAL_API_TOKEN=<long random token>`
6. Deploy and confirm health check:

```bash
curl https://<your-render-domain>/health
```

## Deploy frontend to Vercel

1. Import repo in Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**.
4. Add environment variables:
   - `VITE_API_BASE_URL=https://<your-render-domain>`
5. Deploy.

## Wire frontend to backend

When you add API calls from the frontend, include your private token on server-to-server requests only.
Do **not** expose internal tokens in browser code.

## Security hardening checklist

- Keep `REQUIRE_API_TOKEN=true` in production.
- Restrict `CORS_ORIGINS` to your Vercel domain.
- Rotate `INTERNAL_API_TOKEN` on a schedule.
- Add persistent storage for scan jobs and findings.
- Add authentication (SSO/JWT) before exposing scan endpoints to analysts.
- Add background workers/queues for long scans.

## API endpoints

- `GET /health` → service health.
- `POST /api/scan` → queue scan payload:

```json
{
  "companyName": "Acme Corp",
  "domains": ["acme.com", "acme.io"]
}
```

