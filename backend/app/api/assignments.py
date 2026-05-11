from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db import get_db
from app.models import Assignment, StudentScore, User
from app.schemas.assessments import AssignmentCreate, AssignmentOut, ScoreUpdate, StudentScoreOut

router = APIRouter()


@router.get("/", response_model=list[AssignmentOut])
async def list_assignments(
    section_id: Optional[int] = None,
    teacher_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(Assignment)
    if section_id:
        q = q.where(Assignment.section_id == section_id)
    if teacher_id:
        q = q.where(Assignment.teacher_id == teacher_id)
    result = await db.execute(q.order_by(Assignment.due_date.desc()))
    return result.scalars().all()


@router.post("/", response_model=AssignmentOut)
async def create_assignment(
    body: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    assignment = Assignment(
        title=body.title,
        subject=body.subject,
        max_score=body.max_score,
        due_date=body.due_date,
        notes=body.notes,
        section_id=body.section_id,
        teacher_id=user.teacher_id or 0,
    )
    db.add(assignment)
    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.get("/{assignment_id}", response_model=AssignmentOut)
async def get_assignment(
    assignment_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    return assignment


@router.put("/{assignment_id}", response_model=AssignmentOut)
async def update_assignment(
    assignment_id: int,
    body: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    assignment.title = body.title
    assignment.subject = body.subject
    assignment.max_score = body.max_score
    assignment.due_date = body.due_date
    assignment.notes = body.notes
    await db.commit()
    await db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    assignment = await db.get(Assignment, assignment_id)
    if not assignment:
        raise HTTPException(404, "Assignment not found")
    await db.delete(assignment)
    await db.commit()
    return {"ok": True}


@router.get("/{assignment_id}/scores", response_model=list[StudentScoreOut])
async def list_scores(
    assignment_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(StudentScore).where(StudentScore.assignment_id == assignment_id)
    )
    return result.scalars().all()


@router.put("/{assignment_id}/scores/{student_id}", response_model=StudentScoreOut)
async def upsert_score(
    assignment_id: int,
    student_id: int,
    body: ScoreUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(StudentScore).where(
            StudentScore.assignment_id == assignment_id,
            StudentScore.student_id == student_id,
        )
    )
    score = result.scalar_one_or_none()
    if score:
        if body.score is not None:
            score.score = body.score
        if body.override_score is not None:
            score.override_score = body.override_score
        if body.notes is not None:
            score.notes = body.notes
        score.edited_by_teacher_id = user.teacher_id
    else:
        score = StudentScore(
            assignment_id=assignment_id,
            student_id=student_id,
            score=body.score,
            override_score=body.override_score,
            notes=body.notes,
            edited_by_teacher_id=user.teacher_id,
        )
        db.add(score)
    await db.commit()
    await db.refresh(score)
    return score
