from __future__ import annotations
from typing import Optional

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Standard(Base):
    __tablename__ = "standards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    code: Mapped[str] = mapped_column(String, unique=True)
    description: Mapped[str] = mapped_column(Text)
    subject: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    grade_level: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    framework: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    groups: Mapped[list["AssignmentGroup"]] = relationship(back_populates="standard")


class AssignmentGroup(Base):
    __tablename__ = "assignment_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    standard_id: Mapped[Optional[int]] = mapped_column(ForeignKey("standards.id"), nullable=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    position: Mapped[int] = mapped_column(Integer, default=0)

    standard: Mapped[Optional["Standard"]] = relationship(back_populates="groups")
    items: Mapped[list["AssignmentGroupItem"]] = relationship(back_populates="group", order_by="AssignmentGroupItem.position")


class AssignmentGroupItem(Base):
    __tablename__ = "assignment_group_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    group_id: Mapped[int] = mapped_column(ForeignKey("assignment_groups.id", ondelete="CASCADE"))
    assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id"))
    position: Mapped[int] = mapped_column(Integer, default=0)

    group: Mapped["AssignmentGroup"] = relationship(back_populates="items")
