from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.models import Batch, User
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

