from datetime import datetime

from pydantic import BaseModel


class SubmissionRead(BaseModel):
    id: int
    batch_id: int
    student_prn: str | None
    student_name: str
    student_email: str | None
    filename: str
    file_type: str
    version: int
    summary: str
    keywords: list[str]
    originality_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class SimilarityEdgeRead(BaseModel):
    id: int
    source_submission_id: int
    target_submission_id: int
    similarity_percentage: float
    tfidf_score: float
    semantic_score: float
    explanation: str
    matched_segments: list[dict]

    class Config:
        from_attributes = True
