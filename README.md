# AI Assignment Similarity Checker

A full-stack SaaS application for teachers to upload student assignments, detect similarity and paraphrased plagiarism, and review clean visual reports in a modern dashboard.

This project is built as a production-style monorepo with:
- a premium Next.js frontend
- a FastAPI backend
- a separate Python ML service
- Docker and CI setup

## What This Project Does

Teachers can:
- create batches by year, subject, and section
- upload assignments in `PDF`, `DOCX`, or `TXT`
- compare assignments inside a batch
- view similarity scores, summaries, keywords, and matched sections
- generate report data for review workflows

The system uses a hybrid approach:
- TF-IDF + cosine similarity for lexical overlap
- Sentence-BERT style semantic similarity for paraphrasing signals
- OCR fallback for scanned PDFs on macOS using `sips` + `tesseract`

## Why It Exists

Most plagiarism tools feel either too academic, too technical, or too outdated. This project aims to feel like a real modern SaaS product while still solving a practical education workflow:
- upload assignments
- organize them into batches
- compare them automatically
- give teachers a report they can actually use

## Monorepo Structure

- `client`  
  Next.js 14 frontend with App Router, Tailwind, Framer Motion, reusable UI, auth pages, dashboard, upload, results, and reports

- `server`  
  FastAPI backend with auth, batch management, submission APIs, report generation, upload validation, PDF text extraction, OCR fallback, and WebSocket hooks

- `ml`  
  Hybrid similarity service for preprocessing, embeddings, summaries, keywords, and similarity scoring

- `docker`  
  Dockerfiles and deployment notes

- `docs`  
  Human-friendly project docs

- `sample-data`  
  Example files for testing the system quickly

## Features

### Teacher workflow

- Sign up and log in
- Create and manage batches
- Upload assignments
- Review similarity results
- Generate reports

### Similarity engine

- Text cleaning and preprocessing
- TF-IDF + cosine similarity
- Semantic similarity
- Paraphrase signal detection
- Matching segment extraction
- Summary and keyword generation

### Product features

- Dashboard analytics
- Originality leaderboard
- Submission version tracking
- PDF report generation
- Email hook support
- Real-time processing architecture hooks
- Admin-style reporting views
- AI chatbot endpoint for report explanation

## Tech Stack

### Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- ShadCN-style reusable component structure

### Backend

- FastAPI
- SQLAlchemy
- JWT authentication
- REST APIs
- WebSockets

### Database

- PostgreSQL in the intended Docker/production setup
- SQLite currently supported for local development convenience

### ML

- scikit-learn
- sentence-transformers
- KeyBERT
- OCR fallback for scanned PDFs

## Localhost Links

When running locally:

- Frontend: `http://127.0.0.1:3000`
- Backend docs: `http://127.0.0.1:8000/docs`
- ML docs: `http://127.0.0.1:8001/docs`

## Public Deployment

This repo is prepared for:
- Vercel for the frontend
- Render for the backend and ML service

See [Public Deployment Guide](/Users/admin/Documents/Playground/docs/DEPLOY_PUBLIC.md) for the exact setup.

## Quick Start

### Option 1: Run locally

Frontend:

```bash
cd client
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Backend:

```bash
cd server
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

ML service:

```bash
cd ml
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Option 2: Run with Docker

```bash
docker compose -f docker-compose.yml up --build
```

## Demo Login

For local testing, this project has been used with:

- Email: `teacher2@example.com`
- Password: `Password123`

## Known Limitations

- Scanned PDFs now upload through OCR fallback, but OCR quality depends on scan quality
- Similarity quality is strongest on clean digital text
- Email sending is stubbed unless SMTP is configured
- WebSocket architecture exists, but the frontend live-progress UX can still be expanded
- Report PDF generation is functional but basic compared to a polished export system

## Good First GitHub Impression

If you publish this repo, a layman should understand:
- what the product solves
- who it is for
- how the system is structured
- how to run it locally

That is why the repo also includes:
- [User Guide](/Users/admin/Documents/Playground/docs/USER_GUIDE.md)
- [Architecture Notes](/Users/admin/Documents/Playground/docs/ARCHITECTURE.md)
- [Database Schema](/Users/admin/Documents/Playground/docs/SCHEMA.md)
- [Public Deployment Guide](/Users/admin/Documents/Playground/docs/DEPLOY_PUBLIC.md)
- [Deployment Guide](/Users/admin/Documents/Playground/docker/DEPLOYMENT.md)

## Suggested GitHub Repo Description

`AI-powered assignment similarity checker for educators with FastAPI, Next.js, semantic plagiarism detection, OCR fallback, and report generation.`

## Suggested GitHub Topics

- `nextjs`
- `fastapi`
- `plagiarism-detection`
- `education`
- `machine-learning`
- `nlp`
- `saas`
- `tailwindcss`
- `postgresql`
- `sentence-transformers`
