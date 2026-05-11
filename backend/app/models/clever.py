from __future__ import annotations
from typing import Optional

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class District(Base):
    __tablename__ = "districts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    clever_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    synced_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    schools: Mapped[list["School"]] = relationship(back_populates="district")


class School(Base):
    __tablename__ = "schools"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    clever_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    district_id: Mapped[int] = mapped_column(ForeignKey("districts.id"))
    name: Mapped[str] = mapped_column(String)
    sis_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    synced_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    district: Mapped["District"] = relationship(back_populates="schools")
    teachers: Mapped[list["Teacher"]] = relationship(back_populates="school")
    sections: Mapped[list["Section"]] = relationship(back_populates="school")
    students: Mapped[list["Student"]] = relationship(back_populates="school")


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    clever_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id"))
    email: Mapped[str] = mapped_column(String)
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    synced_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    school: Mapped["School"] = relationship(back_populates="teachers")
    sections: Mapped[list["Section"]] = relationship(back_populates="teacher")


class Section(Base):
    __tablename__ = "sections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    clever_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id"))
    teacher_id: Mapped[int] = mapped_column(ForeignKey("teachers.id"))
    name: Mapped[str] = mapped_column(String)
    subject: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sis_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    synced_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    school: Mapped["School"] = relationship(back_populates="sections")
    teacher: Mapped["Teacher"] = relationship(back_populates="sections")
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="section")


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    clever_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    school_id: Mapped[int] = mapped_column(ForeignKey("schools.id"))
    first_name: Mapped[str] = mapped_column(String)
    last_name: Mapped[str] = mapped_column(String)
    grade: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sis_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_ml: Mapped[bool] = mapped_column(Boolean, default=False)
    is_dl: Mapped[bool] = mapped_column(Boolean, default=False)
    synced_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    school: Mapped["School"] = relationship(back_populates="students")
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="student")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    section_id: Mapped[int] = mapped_column(ForeignKey("sections.id"))

    student: Mapped["Student"] = relationship(back_populates="enrollments")
    section: Mapped["Section"] = relationship(back_populates="enrollments")
