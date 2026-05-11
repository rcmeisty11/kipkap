from __future__ import annotations
from typing import Optional

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class FocusGroup(Base):
    __tablename__ = "focus_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    color: Mapped[str] = mapped_column(String, default="#6366f1")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    members: Mapped[list["FocusGroupMember"]] = relationship(back_populates="focus_group")


class FocusGroupMember(Base):
    __tablename__ = "focus_group_members"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    focus_group_id: Mapped[int] = mapped_column(ForeignKey("focus_groups.id", ondelete="CASCADE"))
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))

    focus_group: Mapped["FocusGroup"] = relationship(back_populates="members")
