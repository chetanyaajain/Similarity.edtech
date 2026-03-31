from datetime import datetime

from pydantic import BaseModel


class ReportRead(BaseModel):
    id: int
    batch_id: int
    title: str
    report_payload: dict
    pdf_path: str | None
    emailed: bool
    created_at: datetime

    class Config:
        from_attributes = True

