from __future__ import annotations
from typing import Optional

from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Assignment(Base):
    __tablename__ = "assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    subject: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    max_score: Mapped[float] = mapped_column(Float, default=100.0)
    due_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    illuminate_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    scores: Mapped[list["StudentScore"]] = relationship(back_populates="assignment")


class StudentScore(Base):
    __tablename__ = "student_scores"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    assignment_id: Mapped[int] = mapped_column(ForeignKey("assignments.id"))
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    override_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    edited_by_teacher_id: Mapped[Optional[int]] = mapped_column(ForeignKey("teachers.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    assignment: Mapped["Assignment"] = relationship(back_populates="scores")
