from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.auth import get_current_user
from app.db import get_db
from app.models import Standard, AssignmentGroup, AssignmentGroupItem, User
from app.schemas.standards import (
    StandardCreate, StandardOut, AssignmentGroupCreate,
    AssignmentGroupOut, MoveAssignmentRequest,
)

router = APIRouter()


@router.get("/", response_model=list[StandardOut])
async def list_standards(
    subject: Optional[str] = None,
    grade_level: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(Standard)
    if subject:
        q = q.where(Standard.subject == subject)
    if grade_level:
        q = q.where(Standard.grade_level == grade_level)
    result = await db.execute(q.order_by(Standard.code))
    return result.scalars().all()


@router.post("/", response_model=StandardOut)
async def create_standard(
    body: StandardCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    std = Standard(**body.model_dump())
    db.add(std)
    await db.commit()
    await db.refresh(std)
    return std


@router.get("/groups", response_model=list[AssignmentGroupOut])
async def list_groups(
    section_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AssignmentGroup)
        .where(AssignmentGroup.section_id == section_id)
        .options(selectinload(AssignmentGroup.items))
        .order_by(AssignmentGroup.position)
    )
    return result.scalars().all()


@router.post("/groups", response_model=AssignmentGroupOut)
async def create_group(
    body: AssignmentGroupCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    group = AssignmentGroup(
        name=body.name,
        standard_id=body.standard_id,
        section_id=body.section_id,
        teacher_id=user.teacher_id or 0,
    )
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return AssignmentGroupOut(
        id=group.id, name=group.name, standard_id=group.standard_id,
        section_id=group.section_id, teacher_id=group.teacher_id,
        position=group.position, items=[],
    )


@router.put("/groups/{group_id}", response_model=AssignmentGroupOut)
async def update_group(
    group_id: int,
    body: AssignmentGroupCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    group = await db.get(AssignmentGroup, group_id)
    if not group:
        raise HTTPException(404, "Group not found")
    group.name = body.name
    group.standard_id = body.standard_id
    await db.commit()
    await db.refresh(group)
    result = await db.execute(
        select(AssignmentGroup)
        .where(AssignmentGroup.id == group_id)
        .options(selectinload(AssignmentGroup.items))
    )
    return result.scalar_one()


@router.delete("/groups/{group_id}")
async def delete_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    group = await db.get(AssignmentGroup, group_id)
    if not group:
        raise HTTPException(404, "Group not found")
    await db.delete(group)
    await db.commit()
    return {"ok": True}


@router.post("/groups/move-assignment")
async def move_assignment(
    body: MoveAssignmentRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(AssignmentGroupItem).where(
            AssignmentGroupItem.assignment_id == body.assignment_id
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        existing.group_id = body.target_group_id
        existing.position = body.position
    else:
        item = AssignmentGroupItem(
            group_id=body.target_group_id,
            assignment_id=body.assignment_id,
            position=body.position,
        )
        db.add(item)
    await db.commit()
    return {"ok": True}
