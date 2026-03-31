import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.models import Batch, SimilarityEdge, Submission, User
from app.schemas.submission import SimilarityEdgeRead, SubmissionRead
from app.services.ml_client import analyze_documents
from app.services.notifier import send_email
from app.services.text_extractor import extract_text
from app.services.ws_manager import ws_manager

router = APIRouter()
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
MAX_FILE_SIZE = 10 * 1024 * 1024


@router.get("/batch/{batch_id}", response_model=list[SubmissionRead])
def list_submissions(
    batch_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id, Batch.owner_id == user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return (
        db.query(Submission)
        .filter(Submission.batch_id == batch_id)
        .order_by(Submission.created_at.desc())
        .all()
    )


@router.get("/batch/{batch_id}/edges", response_model=list[SimilarityEdgeRead])
def list_edges(
    batch_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id, Batch.owner_id == user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return (
        db.query(SimilarityEdge)
        .join(Submission, SimilarityEdge.source_submission_id == Submission.id)
        .filter(Submission.batch_id == batch_id)
        .all()
    )


@router.get("/{submission_id}/history", response_model=list[SubmissionRead])
def submission_history(
    submission_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    submission = db.query(Submission).filter(Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    batch = db.query(Batch).filter(Batch.id == submission.batch_id, Batch.owner_id == user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return (
        db.query(Submission)
        .filter(
            Submission.batch_id == submission.batch_id,
            Submission.student_name == submission.student_name,
        )
        .order_by(Submission.version.desc())
        .all()
    )


@router.post("/upload", response_model=list[SubmissionRead])
async def upload_assignments(
    batch_id: int = Form(...),
    students: str = Form(...),
    files: list[UploadFile] = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = db.query(Batch).filter(Batch.id == batch_id, Batch.owner_id == user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    student_rows = json.loads(students)
    if len(student_rows) != len(files):
        raise HTTPException(status_code=400, detail="Students and files length mismatch")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    created: list[Submission] = []

    await ws_manager.broadcast(batch_id, {"event": "processing", "progress": 10})

    for student, file in zip(student_rows, files):
        suffix = Path(file.filename or "").suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail=f"Invalid file type: {suffix}")
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"{file.filename} exceeds size limit")

        destination = upload_dir / f"{batch_id}_{student['studentName']}_{file.filename}"
        destination.write_bytes(content)
        text = extract_text(destination)
        if not text.strip():
            raise HTTPException(status_code=400, detail=f"No readable text found in {file.filename}")
        previous_version = (
            db.query(Submission)
            .filter(
                Submission.batch_id == batch_id,
                Submission.student_name == student["studentName"],
            )
            .count()
        )
        submission = Submission(
            batch_id=batch_id,
            student_name=student["studentName"],
            student_email=student.get("studentEmail"),
            filename=file.filename or destination.name,
            file_type=suffix.replace(".", ""),
            extracted_text=text,
            version=previous_version + 1,
        )
        db.add(submission)
        db.flush()
        created.append(submission)

    db.commit()
    await ws_manager.broadcast(batch_id, {"event": "processing", "progress": 45})

    all_submissions = (
        db.query(Submission)
        .filter(Submission.batch_id == batch_id)
        .order_by(Submission.created_at.asc())
        .all()
    )
    documents = [
        {"id": submission.id, "student_name": submission.student_name, "text": submission.extracted_text}
        for submission in all_submissions
    ]
    analysis = await analyze_documents(documents)

    for submission in all_submissions:
        enrichment = analysis["documentInsights"][str(submission.id)]
        submission.summary = enrichment["summary"]
        submission.keywords = enrichment["keywords"]
        submission.originality_score = enrichment["originalityScore"]

    submission_ids = [submission.id for submission in all_submissions]
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

    for edge in analysis["edges"]:
        db.add(
            SimilarityEdge(
                source_submission_id=edge["sourceId"],
                target_submission_id=edge["targetId"],
                similarity_percentage=edge["similarityPercentage"],
                tfidf_score=edge["tfidfScore"],
                semantic_score=edge["semanticScore"],
                explanation=edge["explanation"],
                matched_segments=edge["matchedSegments"],
            )
        )

    db.commit()
    await ws_manager.broadcast(batch_id, {"event": "processing", "progress": 100})

    for submission in created:
        if submission.student_email:
            send_email(
                submission.student_email,
                "Assignment processed",
                f"{submission.student_name}, your submission has been analyzed successfully.",
            )

    return created
