# Iteanary.ai

Premium AI travel assistant web app with a cinematic React frontend and a Node/Express backend designed for structured itinerary generation and conversational editing.

## Stack

- Frontend: React + Vite + Tailwind CSS + Framer Motion + GSAP + Lucide React
- Backend: Node.js + Express + MongoDB + Mongoose
- AI: OpenAI chat completions with JSON-only itinerary output

## Project structure

```text
iteanary-ai/
  frontend/
    src/
      components/
      data/
      utils/
  backend/
    src/
      config/
      models/
      routes/
      services/
      utils/
```

## Setup

### 1. Install dependencies

```bash
cd /Users/admin/Documents/Playground/iteanary-ai/frontend
npm install

cd /Users/admin/Documents/Playground/iteanary-ai/backend
npm install
```

### 2. Configure environment

```bash
cd /Users/admin/Documents/Playground/iteanary-ai/backend
cp .env.example .env
```

Fill in:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` such as `gpt-4.1-mini` or your preferred latest supported JSON-capable model
- `MONGODB_URI`

Optional frontend env:

```bash
echo 'VITE_API_URL=http://localhost:5050' > /Users/admin/Documents/Playground/iteanary-ai/frontend/.env
```

### 3. Run the app

Backend:

```bash
cd /Users/admin/Documents/Playground/iteanary-ai/backend
npm run dev
```

Frontend:

```bash
cd /Users/admin/Documents/Playground/iteanary-ai/frontend
npm run dev
```

### 4. Open

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5050/health`

## API routes

- `POST /generate-itinerary`
- `POST /modify-itinerary`
- `POST /save-itinerary`
- `GET /itinerary/:shareId`

## Notes

- If `OPENAI_API_KEY` is missing or unavailable, the backend falls back to a polished demo itinerary so the UI remains usable.
- Itinerary history supports undo/redo and version restore in the client.
- Export uses the browser print flow for a fast PDF path without extra dependencies.
