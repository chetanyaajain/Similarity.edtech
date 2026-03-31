# Public Deployment Guide

This project is ready to be deployed as:

- Frontend on Vercel
- Backend on Render
- ML service on Render
- PostgreSQL on Render Postgres

## Recommended Public Setup

### 1. Deploy backend and ML on Render

This repo includes a root-level [render.yaml](/Users/admin/Documents/Playground/render.yaml) file.

In Render:

1. Open Render Dashboard
2. Click `New` -> `Blueprint`
3. Connect the GitHub repo
4. Select this repository
5. Deploy the Blueprint

This creates:
- `iteanary-ai-ml`
- `iteanary-ai-api`
- `iteanary-ai-db`

### 2. Set backend environment values in Render

After the Blueprint is created, set these manually in the API service if needed:

- `CLIENT_URL`
  Use your final Vercel frontend URL

- SMTP variables if you want email support:
  - `SMTP_HOST`
  - `SMTP_USERNAME`
  - `SMTP_PASSWORD`
  - `SMTP_FROM`

## 3. Deploy frontend on Vercel

In Vercel:

1. Import the GitHub repository
2. Set the Root Directory to `client`
3. Framework preset should be detected as Next.js
4. Add these environment variables:

- `NEXT_PUBLIC_API_URL`
  Example: `https://your-render-api.onrender.com/api`

- `NEXT_PUBLIC_WS_URL`
  Example: `wss://your-render-api.onrender.com/ws`

5. Deploy

## 4. Update Render API with the Vercel frontend URL

After Vercel gives you the public frontend URL:

1. Go back to Render
2. Open `iteanary-ai-api`
3. Set `CLIENT_URL` to your Vercel domain
4. Redeploy the API

## 5. Add Live Links to GitHub

Once deployed, add these to your GitHub repo description or README:

- `Live Demo: https://your-vercel-app.vercel.app`
- `API Docs: https://your-render-api.onrender.com/docs`

## Important Notes

- Scanned PDFs are supported through OCR fallback, but OCR quality depends on scan clarity
- Free/starter plans may sleep when idle
- If you want better responsiveness for demos or interviews, avoid sleeping plans

