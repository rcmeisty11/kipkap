from __future__ import annotations
from typing import Optional

from datetime import datetime
from pydantic import BaseModel


class UserOut(BaseModel):
    id: int
    email: str
    role: str
    teacher_id: Optional[int]
    clever_id: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class CriteriaCreate(BaseModel):
    title: str
    description: Optional[str] = None
    levels_json: list[dict] = []
    position: int = 0


class RubricCreate(BaseModel):
    title: str
    description: Optional[str] = None
    school_id: int
    criteria: list[CriteriaCreate] = []


class CriteriaOut(BaseModel):
    id: int
    rubric_id: int
    title: str
    description: Optional[str]
    levels_json: Optional[list[dict]]
    position: int
    model_config = {"from_attributes": True}


class RubricOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    school_id: int
    created_by_user_id: int
    created_at: datetime
    criteria: list[CriteriaOut] = []
    model_config = {"from_attributes": True}


class FeedbackCreate(BaseModel):
    rubric_id: int
    teacher_id: int
    criteria_ratings_json: dict = {}
    overall_notes: Optional[str] = None


class FeedbackOut(BaseModel):
    id: int
    rubric_id: int
    teacher_id: int
    leader_id: int
    criteria_ratings_json: Optional[dict]
    overall_notes: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


class ReflectionCreate(BaseModel):
    feedback_id: int
    reflection_text: str


class ReflectionOut(BaseModel):
    id: int
    feedback_id: int
    teacher_id: int
    reflection_text: str
    submitted_at: datetime
    model_config = {"from_attributes": True}


class RollupTeacher(BaseModel):
    teacher_id: int
    teacher_name: str
    school_name: str
    section_count: int
    assignment_count: int
    avg_score: float


class RollupResponse(BaseModel):
    teachers: list[RollupTeacher]
