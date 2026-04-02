from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.models import Batch, Report, SimilarityEdge, Submission, User
from app.schemas.batch import BatchCreate, BatchRead

router = APIRouter()


@router.get("", response_model=list[BatchRead])
def list_batches(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    return db.query(Batch).filter(Batch.owner_id == user.id).order_by(Batch.created_at.desc()).all()


@router.post("", response_model=BatchRead)
def create_batch(
    payload: BatchCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = Batch(**payload.model_dump(), owner_id=user.id)
    db.add(batch)
    db.commit()
    db.refresh(batch)
    return batch


@router.get("/{batch_id}", response_model=BatchRead)
def get_batch(
    batch_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id, Batch.owner_id == user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


@router.delete("/{batch_id}")
def delete_batch(
    batch_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id, Batch.owner_id == user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    submissions = db.query(Submission).filter(Submission.batch_id == batch_id).all()
    submission_ids = [submission.id for submission in submissions]
    reports = db.query(Report).filter(Report.batch_id == batch_id).all()

    for report in reports:
        if report.pdf_path:
            pdf_path = Path(report.pdf_path)
            if pdf_path.exists():
                pdf_path.unlink(missing_ok=True)

    for submission in submissions:
        upload_path = Path(settings.upload_dir) / f"{batch_id}_{submission.student_name}_{submission.filename}"
        if upload_path.exists():
            upload_path.unlink(missing_ok=True)

    if submission_ids:
        (
            db.query(SimilarityEdge)
            .filter(
                or_(
                    SimilarityEdge.source_submission_id.in_(submission_ids),
                    SimilarityEdge.target_submission_id.in_(submission_ids),
                )
            )
            .delete(synchronize_session=False)
        )

    db.query(Report).filter(Report.batch_id == batch_id).delete(synchronize_session=False)
    db.query(Submission).filter(Submission.batch_id == batch_id).delete(synchronize_session=False)
    db.delete(batch)
    db.commit()

    return {"status": "deleted", "batchId": batch_id}
