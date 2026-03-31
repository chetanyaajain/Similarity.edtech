from fastapi import FastAPI
from pydantic import BaseModel

from app.engines.hybrid_similarity import HybridSimilarityEngine

app = FastAPI(title="AI Assignment Similarity Checker ML Service")
engine = HybridSimilarityEngine()


class AnalyzeRequest(BaseModel):
    documents: list[dict]


@app.get("/health")
def healthcheck():
    return {"status": "ok"}


@app.post("/analyze")
def analyze(payload: AnalyzeRequest):
    return engine.analyze(payload.documents)

