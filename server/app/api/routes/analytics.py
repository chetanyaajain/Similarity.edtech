from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Batch, SimilarityEdge, Submission, User

router = APIRouter()


@router.get("/dashboard")
def dashboard_metrics(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    batch_ids = [batch_id for (batch_id,) in db.query(Batch.id).filter(Batch.owner_id == user.id).all()]

    total_submissions = (
        db.query(func.count(Submission.id)).filter(Submission.batch_id.in_(batch_ids)).scalar() or 0
    )
    total_batches = len(batch_ids)
    avg_originality = (
        db.query(func.avg(Submission.originality_score))
        .filter(Submission.batch_id.in_(batch_ids))
        .scalar()
        or 0
    )
    flagged_pairs = (
        db.query(func.count(SimilarityEdge.id))
        .join(Submission, SimilarityEdge.source_submission_id == Submission.id)
        .filter(Submission.batch_id.in_(batch_ids), SimilarityEdge.similarity_percentage >= 70)
        .scalar()
        or 0
    )

    leaderboard = (
        db.query(Submission.student_name, Submission.originality_score)
        .filter(Submission.batch_id.in_(batch_ids))
        .order_by(Submission.originality_score.desc())
        .limit(5)
        .all()
    )

    return {
        "cards": {
            "totalBatches": total_batches,
            "totalSubmissions": total_submissions,
            "averageOriginality": round(float(avg_originality), 2),
            "flaggedPairs": flagged_pairs,
        },
        "leaderboard": [
            {"studentName": student_name, "originalityScore": originality_score}
            for student_name, originality_score in leaderboard
        ],
    }

