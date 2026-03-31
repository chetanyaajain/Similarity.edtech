# Architecture Notes

## System Overview

This project uses a 3-service architecture:

1. `client`
   Next.js app for UI, routing, upload flow, dashboard, results, and reports

2. `server`
   FastAPI application for auth, batches, submissions, reporting, persistence, and integration with the ML service

3. `ml`
   Python service dedicated to similarity scoring, summaries, keywords, and document comparison logic

## Request Flow

### Upload flow

1. User uploads a file from the frontend
2. FastAPI validates the file and stores it
3. Text is extracted from the file
4. If PDF text extraction is empty, OCR fallback is attempted
5. All submissions in the same batch are sent to the ML service
6. Similarity edges and originality scores are recalculated for the full batch
7. Results and reports become available in the UI

## Why Batch-Wide Recompute Matters

Similarity is not just about the newest file. Every new upload can change the comparison picture for the whole batch. The backend now recomputes similarity across all submissions in the batch after each upload.

## OCR Handling

For scanned PDFs:
- `pypdf` is tried first
- if text is empty, the backend renders the PDF to PNG with `sips`
- `tesseract` OCR extracts fallback text
- OCR text is lightly cleaned before similarity analysis

## Tradeoffs

- This is a strong prototype and production-style scaffold
- It is not yet a Turnitin-scale ingestion or OCR pipeline
- Similarity quality is much stronger for clean digital text than noisy scanned documents

