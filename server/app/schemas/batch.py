from datetime import datetime

from pydantic import BaseModel, Field


class BatchCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    year: str = Field(min_length=2, max_length=12)
    subject: str = Field(min_length=2, max_length=120)
    section: str = Field(min_length=1, max_length=16)


class BatchRead(BatchCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

