from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db import get_db
from app.models import FocusGroup, FocusGroupMember, User
from app.schemas.focus_groups import FocusGroupCreate, FocusGroupOut, FocusGroupMemberUpdate

router = APIRouter()


def _to_out(fg: FocusGroup, member_ids: list[int]) -> FocusGroupOut:
    return FocusGroupOut(
        id=fg.id, name=fg.name, section_id=fg.section_id,
        teacher_id=fg.teacher_id, color=fg.color,
        created_at=fg.created_at, member_ids=member_ids,
    )


@router.get("/", response_model=list[FocusGroupOut])
async def list_focus_groups(
    section_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = select(FocusGroup)
    if section_id:
        q = q.where(FocusGroup.section_id == section_id)
    result = await db.execute(q.order_by(FocusGroup.name))
    groups = result.scalars().all()

    out = []
    for fg in groups:
        members = await db.execute(
            select(FocusGroupMember.student_id).where(FocusGroupMember.focus_group_id == fg.id)
        )
        out.append(_to_out(fg, [r[0] for r in members.all()]))
    return out


@router.post("/", response_model=FocusGroupOut)
async def create_focus_group(
    body: FocusGroupCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fg = FocusGroup(
        name=body.name, section_id=body.section_id,
        teacher_id=user.teacher_id or 0, color=body.color,
    )
    db.add(fg)
    await db.commit()
    await db.refresh(fg)
    return _to_out(fg, [])


@router.put("/{group_id}", response_model=FocusGroupOut)
async def update_focus_group(
    group_id: int,
    body: FocusGroupCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fg = await db.get(FocusGroup, group_id)
    if not fg:
        raise HTTPException(404, "Focus group not found")
    fg.name = body.name
    fg.color = body.color
    await db.commit()
    await db.refresh(fg)
    members = await db.execute(
        select(FocusGroupMember.student_id).where(FocusGroupMember.focus_group_id == fg.id)
    )
    return _to_out(fg, [r[0] for r in members.all()])


@router.delete("/{group_id}")
async def delete_focus_group(
    group_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fg = await db.get(FocusGroup, group_id)
    if not fg:
        raise HTTPException(404, "Focus group not found")
    await db.delete(fg)
    await db.commit()
    return {"ok": True}


@router.put("/{group_id}/members", response_model=FocusGroupOut)
async def set_members(
    group_id: int,
    body: FocusGroupMemberUpdate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    fg = await db.get(FocusGroup, group_id)
    if not fg:
        raise HTTPException(404, "Focus group not found")

    existing = await db.execute(
        select(FocusGroupMember).where(FocusGroupMember.focus_group_id == group_id)
    )
    for m in existing.scalars().all():
        await db.delete(m)

    for sid in body.student_ids:
        db.add(FocusGroupMember(focus_group_id=group_id, student_id=sid))

    await db.commit()
    return _to_out(fg, body.student_ids)
