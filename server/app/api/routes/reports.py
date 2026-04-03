from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.models import Batch, Report, SimilarityEdge, Submission, User
from app.schemas.chat import ChatRequest
from app.schemas.report import ReportRead
from app.services.reports import build_report_payload
from app.utils.pdf import generate_report_pdf

router = APIRouter()


def get_owned_batch(batch_id: int, user: User, db: Session) -> Batch:
    batch = db.query(Batch).filter(Batch.id == batch_id, Batch.owner_id == user.id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    return batch


def get_owned_report(report_id: int, user: User, db: Session) -> Report:
    report = (
        db.query(Report)
        .join(Batch, Batch.id == Report.batch_id)
        .filter(Report.id == report_id, Batch.owner_id == user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.post("/batch/{batch_id}", response_model=ReportRead)
def create_report(
    batch_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    batch = get_owned_batch(batch_id, user, db)

    submissions = db.query(Submission).filter(Submission.batch_id == batch_id).all()
    edges = (
        db.query(SimilarityEdge)
        .join(Submission, SimilarityEdge.source_submission_id == Submission.id)
        .filter(Submission.batch_id == batch_id)
        .all()
    )
    payload = build_report_payload(batch, submissions, edges)
    pdf_path = generate_report_pdf(
        Path(settings.report_dir) / f"report_{batch_id}.pdf",
        f"{batch.name} Similarity Report",
        [
            f"Subject: {batch.subject} | Section: {batch.section} | Year: {batch.year}",
            f"Submissions: {payload['totals']['submissions']}",
            f"Comparisons: {payload['totals']['comparisons']}",
            f"High-risk pairs: {payload['totals']['highRiskPairs']}",
        ]
        + [
            f"{edge['sourceStudentName']} vs {edge['targetStudentName']}: "
            f"{edge['similarityPercentage']}% | {edge['explanation']}"
            for edge in payload["edges"][:15]
        ],
    )
    report = Report(
        batch_id=batch_id,
        generated_by_id=user.id,
        title=f"{batch.name} Similarity Report",
        report_payload=payload,
        pdf_path=pdf_path,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("/batch/{batch_id}/latest", response_model=ReportRead)
def get_latest_report_for_batch(
    batch_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    get_owned_batch(batch_id, user, db)
    report = (
        db.query(Report)
        .filter(Report.batch_id == batch_id)
        .order_by(Report.created_at.desc())
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.get("/{report_id}", response_model=ReportRead)
def get_report(
    report_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_owned_report(report_id, user, db)


@router.get("/{report_id}/download")
def download_report(
    report_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = get_owned_report(report_id, user, db)
    if not report.pdf_path:
        raise HTTPException(status_code=404, detail="Report PDF not found")

    pdf_path = Path(report.pdf_path)
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="Report PDF not found")

    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=pdf_path.name,
    )


@router.post("/{report_id}/chat")
def chat_about_report(
    report_id: int,
    payload: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = get_owned_report(report_id, user, db)

    question = payload.question.lower()
    totals = report.report_payload.get("totals", {})
    if "highest" in question or "most similar" in question:
        top_edge = max(
            report.report_payload.get("edges", []),
            key=lambda edge: edge.get("similarityPercentage", 0),
            default=None,
        )
        if not top_edge:
            return {"answer": "No similarity edges are available for this report yet."}
        return {
            "answer": (
                f"The highest-risk pair in this report is between "
                f"{top_edge['sourceStudentName']} and {top_edge['targetStudentName']} "
                f"at {top_edge['similarityPercentage']}% similarity. "
                f"{top_edge['explanation']}"
            )
        }
    return {
        "answer": (
            f"This batch contains {totals.get('submissions', 0)} submissions, "
            f"{totals.get('comparisons', 0)} pairwise comparisons, and "
            f"{totals.get('highRiskPairs', 0)} high-risk pairs. "
            f"Ask about the highest-risk pair or review the highlighted matched segments."
        )
    }
