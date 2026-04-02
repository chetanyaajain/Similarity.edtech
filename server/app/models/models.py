from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(32), default="teacher")
    preferred_language: Mapped[str] = mapped_column(String(8), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    batches: Mapped[list["Batch"]] = relationship(back_populates="owner")


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    year: Mapped[str] = mapped_column(String(12))
    subject: Mapped[str] = mapped_column(String(120))
    section: Mapped[str] = mapped_column(String(16))
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped["User"] = relationship(back_populates="batches")
    submissions: Mapped[list["Submission"]] = relationship(back_populates="batch")


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"), index=True)
    student_prn: Mapped[str | None] = mapped_column(String(64), index=True, nullable=True)
    student_name: Mapped[str] = mapped_column(String(120), index=True)
    student_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    filename: Mapped[str] = mapped_column(String(255))
    file_type: Mapped[str] = mapped_column(String(16))
    version: Mapped[int] = mapped_column(Integer, default=1)
    extracted_text: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text, default="")
    keywords: Mapped[list[str]] = mapped_column(JSON, default=list)
    originality_score: Mapped[float] = mapped_column(Float, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    batch: Mapped["Batch"] = relationship(back_populates="submissions")
    source_links: Mapped[list["SimilarityEdge"]] = relationship(
        back_populates="source_submission",
        foreign_keys="SimilarityEdge.source_submission_id",
    )
    target_links: Mapped[list["SimilarityEdge"]] = relationship(
        back_populates="target_submission",
        foreign_keys="SimilarityEdge.target_submission_id",
    )


class SimilarityEdge(Base):
    __tablename__ = "similarity_edges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    source_submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id"))
    target_submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id"))
    similarity_percentage: Mapped[float] = mapped_column(Float)
    tfidf_score: Mapped[float] = mapped_column(Float)
    semantic_score: Mapped[float] = mapped_column(Float)
    explanation: Mapped[str] = mapped_column(Text)
    matched_segments: Mapped[list[dict]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    source_submission: Mapped["Submission"] = relationship(
        back_populates="source_links", foreign_keys=[source_submission_id]
    )
    target_submission: Mapped["Submission"] = relationship(
        back_populates="target_links", foreign_keys=[target_submission_id]
    )


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    batch_id: Mapped[int] = mapped_column(ForeignKey("batches.id"), index=True)
    generated_by_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(255))
    report_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    pdf_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    emailed: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
