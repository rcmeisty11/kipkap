from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.db import get_db
from app.models import (
    User, Teacher, School, Section, Assignment, StudentScore,
    ActionStepRubric, RubricCriteria, TeacherFeedback, TeacherReflection,
)
from app.schemas.leader import (
    RubricCreate, RubricOut, FeedbackCreate, FeedbackOut,
    ReflectionCreate, ReflectionOut, RollupTeacher, RollupResponse,
)

router = APIRouter()


@router.get("/rollup", response_model=RollupResponse)
async def get_rollup(
    school_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(Teacher)
    if school_id:
        q = q.where(Teacher.school_id == school_id)
    teachers_result = await db.execute(q)
    teachers = teachers_result.scalars().all()

    rollup = []
    for t in teachers:
        school = await db.get(School, t.school_id)
        sections = await db.execute(
            select(func.count()).where(Section.teacher_id == t.id)
        )
        section_count = sections.scalar() or 0

        assignments = await db.execute(
            select(func.count()).where(Assignment.teacher_id == t.id)
        )
        assignment_count = assignments.scalar() or 0

        avg_result = await db.execute(
            select(func.avg(StudentScore.score))
            .join(Assignment, StudentScore.assignment_id == Assignment.id)
            .where(Assignment.teacher_id == t.id)
        )
        avg_score = avg_result.scalar() or 0.0

        rollup.append(RollupTeacher(
            teacher_id=t.id,
            teacher_name=f"{t.first_name} {t.last_name}",
            school_name=school.name if school else "",
            section_count=section_count,
            assignment_count=assignment_count,
            avg_score=round(float(avg_score), 1),
        ))

    return RollupResponse(teachers=rollup)


@router.post("/rubrics", response_model=RubricOut)
async def create_rubric(
    body: RubricCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rubric = ActionStepRubric(
        title=body.title, description=body.description,
        school_id=body.school_id, created_by_user_id=user.id,
    )
    db.add(rubric)
    await db.flush()

    for c in body.criteria:
        criteria = RubricCriteria(
            rubric_id=rubric.id, title=c.title,
            description=c.description, levels_json=c.levels_json,
            position=c.position,
        )
        db.add(criteria)

    await db.commit()
    result = await db.execute(
        select(ActionStepRubric)
        .where(ActionStepRubric.id == rubric.id)
        .options(selectinload(ActionStepRubric.criteria))
    )
    return result.scalar_one()


@router.get("/rubrics", response_model=list[RubricOut])
async def list_rubrics(
    school_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(ActionStepRubric).options(selectinload(ActionStepRubric.criteria))
    if school_id:
        q = q.where(ActionStepRubric.school_id == school_id)
    result = await db.execute(q.order_by(ActionStepRubric.created_at.desc()))
    return result.scalars().all()


@router.get("/rubrics/{rubric_id}", response_model=RubricOut)
async def get_rubric(
    rubric_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(ActionStepRubric)
        .where(ActionStepRubric.id == rubric_id)
        .options(selectinload(ActionStepRubric.criteria))
    )
    rubric = result.scalar_one_or_none()
    if not rubric:
        raise HTTPException(404, "Rubric not found")
    return rubric


@router.post("/feedback", response_model=FeedbackOut)
async def create_feedback(
    body: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fb = TeacherFeedback(
        rubric_id=body.rubric_id, teacher_id=body.teacher_id,
        leader_id=user.id, criteria_ratings_json=body.criteria_ratings_json,
        overall_notes=body.overall_notes,
    )
    db.add(fb)
    await db.commit()
    await db.refresh(fb)
    return fb


@router.get("/feedback", response_model=list[FeedbackOut])
async def list_feedback(
    teacher_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(TeacherFeedback)
    if teacher_id:
        q = q.where(TeacherFeedback.teacher_id == teacher_id)
    result = await db.execute(q.order_by(TeacherFeedback.created_at.desc()))
    return result.scalars().all()


@router.post("/reflections", response_model=ReflectionOut)
async def create_reflection(
    body: ReflectionCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ref = TeacherReflection(
        feedback_id=body.feedback_id,
        teacher_id=user.teacher_id or 0,
        reflection_text=body.reflection_text,
    )
    db.add(ref)
    await db.commit()
    await db.refresh(ref)
    return ref


@router.get("/reflections", response_model=list[ReflectionOut])
async def list_reflections(
    feedback_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(TeacherReflection)
    if feedback_id:
        q = q.where(TeacherReflection.feedback_id == feedback_id)
    result = await db.execute(q.order_by(TeacherReflection.submitted_at.desc()))
    return result.scalars().all()
