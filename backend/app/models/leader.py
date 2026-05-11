from __future__ import annotations
from typing import Optional

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True)
    role: Mapped[str] = mapped_column(String, default="teacher")  # teacher | leader | admin
    teacher_id: Mapped[Optional[int]] = mapped_column(ForeignKey("teachers.id"), nullable=True)
    clever_id: Mapped[Optional[str]] = mapped_column(String, unique=True, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ActionStepRubric(Base):
    __tablename__ = "action_step_rubrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id"))
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    criteria: Mapped[list["RubricCriteria"]] = relationship(back_populates="rubric", order_by="RubricCriteria.position")


class RubricCriteria(Base):
    __tablename__ = "rubric_criteria"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rubric_id: Mapped[int] = mapped_column(ForeignKey("action_step_rubrics.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    levels_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    position: Mapped[int] = mapped_column(Integer, default=0)

    rubric: Mapped["ActionStepRubric"] = relationship(back_populates="criteria")


class TeacherFeedback(Base):
    __tablename__ = "teacher_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    rubric_id: Mapped[int] = mapped_column(ForeignKey("action_step_rubrics.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    leader_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    criteria_ratings_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    overall_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    reflections: Mapped[list["TeacherReflection"]] = relationship(back_populates="feedback")


class TeacherReflection(Base):
    __tablename__ = "teacher_reflections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    feedback_id: Mapped[int] = mapped_column(ForeignKey("teacher_feedback.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    reflection_text: Mapped[str] = mapped_column(Text)
    submitted_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    feedback: Mapped["TeacherFeedback"] = relationship(back_populates="reflections")
