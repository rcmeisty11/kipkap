"""Initial schema

Revision ID: 001
Revises:
Create Date: 2026-05-10
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "districts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("clever_id", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("synced_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "schools",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("clever_id", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("district_id", sa.Integer(), sa.ForeignKey("districts.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("sis_id", sa.String(), nullable=True),
        sa.Column("synced_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "teachers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("clever_id", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("school_id", sa.Integer(), sa.ForeignKey("schools.id"), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("first_name", sa.String(), nullable=False),
        sa.Column("last_name", sa.String(), nullable=False),
        sa.Column("synced_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "sections",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("clever_id", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("school_id", sa.Integer(), sa.ForeignKey("schools.id"), nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("subject", sa.String(), nullable=True),
        sa.Column("grade", sa.String(), nullable=True),
        sa.Column("sis_id", sa.String(), nullable=True),
        sa.Column("synced_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "students",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("clever_id", sa.String(), unique=True, index=True, nullable=False),
        sa.Column("school_id", sa.Integer(), sa.ForeignKey("schools.id"), nullable=False),
        sa.Column("first_name", sa.String(), nullable=False),
        sa.Column("last_name", sa.String(), nullable=False),
        sa.Column("grade", sa.String(), nullable=True),
        sa.Column("sis_id", sa.String(), nullable=True),
        sa.Column("is_ml", sa.Boolean(), default=False, nullable=False),
        sa.Column("is_dl", sa.Boolean(), default=False, nullable=False),
        sa.Column("synced_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "enrollments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id"), nullable=False),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id"), nullable=False),
    )

    op.create_table(
        "assignments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("subject", sa.String(), nullable=True),
        sa.Column("max_score", sa.Float(), default=100.0, nullable=False),
        sa.Column("due_date", sa.Date(), nullable=True),
        sa.Column("illuminate_id", sa.String(), nullable=True),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id"), nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "student_scores",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("assignment_id", sa.Integer(), sa.ForeignKey("assignments.id"), nullable=False),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id"), nullable=False),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("override_score", sa.Float(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("edited_by_teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "standards",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("code", sa.String(), unique=True, nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("subject", sa.String(), nullable=True),
        sa.Column("grade_level", sa.String(), nullable=True),
        sa.Column("framework", sa.String(), nullable=True),
    )

    op.create_table(
        "assignment_groups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("standard_id", sa.Integer(), sa.ForeignKey("standards.id"), nullable=True),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id"), nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=False),
        sa.Column("position", sa.Integer(), default=0),
    )

    op.create_table(
        "assignment_group_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("group_id", sa.Integer(), sa.ForeignKey("assignment_groups.id", ondelete="CASCADE"), nullable=False),
        sa.Column("assignment_id", sa.Integer(), sa.ForeignKey("assignments.id"), nullable=False),
        sa.Column("position", sa.Integer(), default=0),
    )

    op.create_table(
        "focus_groups",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("section_id", sa.Integer(), sa.ForeignKey("sections.id"), nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=False),
        sa.Column("color", sa.String(), default="#6366f1"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "focus_group_members",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("focus_group_id", sa.Integer(), sa.ForeignKey("focus_groups.id", ondelete="CASCADE"), nullable=False),
        sa.Column("student_id", sa.Integer(), sa.ForeignKey("students.id"), nullable=False),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(), unique=True, nullable=False),
        sa.Column("role", sa.String(), default="teacher", nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=True),
        sa.Column("clever_id", sa.String(), unique=True, nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "action_step_rubrics",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("school_id", sa.Integer(), sa.ForeignKey("schools.id"), nullable=False),
        sa.Column("created_by_user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "rubric_criteria",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("rubric_id", sa.Integer(), sa.ForeignKey("action_step_rubrics.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("levels_json", postgresql.JSON(), nullable=True),
        sa.Column("position", sa.Integer(), default=0),
    )

    op.create_table(
        "teacher_feedback",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("rubric_id", sa.Integer(), sa.ForeignKey("action_step_rubrics.id"), nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=False),
        sa.Column("leader_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("criteria_ratings_json", postgresql.JSON(), nullable=True),
        sa.Column("overall_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "teacher_reflections",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("feedback_id", sa.Integer(), sa.ForeignKey("teacher_feedback.id"), nullable=False),
        sa.Column("teacher_id", sa.Integer(), sa.ForeignKey("teachers.id"), nullable=False),
        sa.Column("reflection_text", sa.Text(), nullable=False),
        sa.Column("submitted_at", sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("teacher_reflections")
    op.drop_table("teacher_feedback")
    op.drop_table("rubric_criteria")
    op.drop_table("action_step_rubrics")
    op.drop_table("users")
    op.drop_table("focus_group_members")
    op.drop_table("focus_groups")
    op.drop_table("assignment_group_items")
    op.drop_table("assignment_groups")
    op.drop_table("standards")
    op.drop_table("student_scores")
    op.drop_table("assignments")
    op.drop_table("enrollments")
    op.drop_table("students")
    op.drop_table("sections")
    op.drop_table("teachers")
    op.drop_table("schools")
    op.drop_table("districts")
