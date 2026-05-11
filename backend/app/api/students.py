from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db import get_db
from app.models import Student, Enrollment, StudentScore, Section, User
from app.schemas.clever import StudentOut, StudentUpdate, SectionOut
from app.schemas.assessments import StudentScoreOut

router = APIRouter()


@router.get("/", response_model=list[StudentOut])
async def list_students(
    section_id: Optional[int] = None,
    school_id: Optional[int] = None,
    is_ml: Optional[bool] = None,
    is_dl: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if section_id:
        enroll_result = await db.execute(
            select(Enrollment.student_id).where(Enrollment.section_id == section_id)
        )
        student_ids = [r[0] for r in enroll_result.all()]
        q = select(Student).where(Student.id.in_(student_ids))
    else:
        q = select(Student)

    if school_id:
        q = q.where(Student.school_id == school_id)
    if is_ml is not None:
        q = q.where(Student.is_ml == is_ml)
    if is_dl is not None:
        q = q.where(Student.is_dl == is_dl)

    result = await db.execute(q.order_by(Student.last_name, Student.first_name))
    return result.scalars().all()


@router.get("/sections", response_model=list[SectionOut])
async def list_sections(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(Section)
    if user.teacher_id:
        q = q.where(Section.teacher_id == user.teacher_id)
    result = await db.execute(q.order_by(Section.name))
    return result.scalars().all()


@router.get("/{student_id}", response_model=StudentOut)
async def get_student(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    return student


@router.patch("/{student_id}", response_model=StudentOut)
async def update_student(
    student_id: int,
    body: StudentUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    student = await db.get(Student, student_id)
    if not student:
        raise HTTPException(404, "Student not found")
    if body.is_ml is not None:
        student.is_ml = body.is_ml
    if body.is_dl is not None:
        student.is_dl = body.is_dl
    await db.commit()
    await db.refresh(student)
    return student


@router.get("/{student_id}/scores", response_model=list[StudentScoreOut])
async def get_student_scores(
    student_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(StudentScore).where(StudentScore.student_id == student_id)
    )
    return result.scalars().all()
