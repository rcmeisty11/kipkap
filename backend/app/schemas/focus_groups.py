from __future__ import annotations
from typing import Optional

from datetime import datetime
from pydantic import BaseModel


class FocusGroupCreate(BaseModel):
    name: str
    section_id: int
    color: str = "#6366f1"


class FocusGroupOut(BaseModel):
    id: int
    name: str
    section_id: int
    teacher_id: int
    color: str
    created_at: datetime
    member_ids: list[int] = []
    model_config = {"from_attributes": True}


class FocusGroupMemberUpdate(BaseModel):
    student_ids: list[int]
