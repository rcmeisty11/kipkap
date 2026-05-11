from __future__ import annotations
from typing import Optional

from pydantic import BaseModel


class StandardCreate(BaseModel):
    code: str
    description: str
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    framework: Optional[str] = None


class StandardOut(BaseModel):
    id: int
    code: str
    description: str
    subject: Optional[str]
    grade_level: Optional[str]
    framework: Optional[str]
    model_config = {"from_attributes": True}


class AssignmentGroupItemOut(BaseModel):
    id: int
    group_id: int
    assignment_id: int
    position: int
    model_config = {"from_attributes": True}


class AssignmentGroupCreate(BaseModel):
    name: str
    standard_id: Optional[int] = None
    section_id: int


class AssignmentGroupOut(BaseModel):
    id: int
    name: str
    standard_id: Optional[int]
    section_id: int
    teacher_id: int
    position: int
    items: list[AssignmentGroupItemOut] = []
    model_config = {"from_attributes": True}


class MoveAssignmentRequest(BaseModel):
    assignment_id: int
    target_group_id: int
    position: int = 0
