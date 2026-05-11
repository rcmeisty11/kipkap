from __future__ import annotations
from typing import Optional

from datetime import date, datetime
from pydantic import BaseModel


class AssignmentCreate(BaseModel):
    title: str
    subject: Optional[str] = None
    max_score: float = 100.0
    due_date: Optional[date] = None
    section_id: int


class AssignmentOut(BaseModel):
    id: int
    title: str
    subject: Optional[str]
    max_score: float
    due_date: Optional[date]
    illuminate_id: Optional[str]
    section_id: int
    teacher_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class ScoreUpdate(BaseModel):
    score: Optional[float] = None
    override_score: Optional[float] = None
    notes: Optional[str] = None


class StudentScoreOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    score: Optional[float]
    override_score: Optional[float]
    notes: Optional[str]
    edited_by_teacher_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
