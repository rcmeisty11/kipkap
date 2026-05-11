from __future__ import annotations
from typing import Optional

from datetime import datetime
from pydantic import BaseModel


class DistrictOut(BaseModel):
    id: int
    clever_id: str
    name: str
    synced_at: datetime
    model_config = {"from_attributes": True}


class SchoolOut(BaseModel):
    id: int
    clever_id: str
    district_id: int
    name: str
    sis_id: Optional[str]
    synced_at: datetime
    model_config = {"from_attributes": True}


class TeacherOut(BaseModel):
    id: int
    clever_id: str
    school_id: int
    email: str
    first_name: str
    last_name: str
    synced_at: datetime
    model_config = {"from_attributes": True}


class SectionOut(BaseModel):
    id: int
    clever_id: str
    school_id: int
    teacher_id: int
    name: str
    subject: Optional[str]
    grade: Optional[str]
    sis_id: Optional[str]
    synced_at: datetime
    model_config = {"from_attributes": True}


class StudentOut(BaseModel):
    id: int
    clever_id: str
    school_id: int
    first_name: str
    last_name: str
    grade: Optional[str]
    sis_id: Optional[str]
    is_ml: bool
    is_dl: bool
    synced_at: datetime
    model_config = {"from_attributes": True}


class StudentUpdate(BaseModel):
    is_ml: Optional[bool] = None
    is_dl: Optional[bool] = None


class EnrollmentOut(BaseModel):
    id: int
    student_id: int
    section_id: int
    model_config = {"from_attributes": True}


class SyncResponse(BaseModel):
    status: str
    districts_synced: int = 0
    schools_synced: int = 0
    teachers_synced: int = 0
    sections_synced: int = 0
    students_synced: int = 0
