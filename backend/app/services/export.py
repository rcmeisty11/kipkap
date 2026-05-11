from __future__ import annotations
from typing import Optional

import csv
import io

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Assignment, StudentScore, Student, Enrollment


async def generate_powerschool_csv(
    section_id: int,
    assignment_ids: list[int],
    db: AsyncSession,
) -> str:
    enrollments = await db.execute(
        select(Enrollment).where(Enrollment.section_id == section_id)
    )
    enrolled = {e.student_id for e in enrollments.scalars().all()}

    assignments_result = await db.execute(
        select(Assignment).where(Assignment.id.in_(assignment_ids))
    )
    assignments = assignments_result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student_Number", "Assignment_Name", "Category",
        "Points_Earned", "Points_Possible", "Date", "Assignment_ID",
    ])

    for assignment in assignments:
        scores_result = await db.execute(
            select(StudentScore).where(StudentScore.assignment_id == assignment.id)
        )
        scores = scores_result.scalars().all()
        score_map = {s.student_id: s for s in scores}

        for student_id in enrolled:
            student_result = await db.execute(
                select(Student).where(Student.id == student_id)
            )
            student = student_result.scalar_one_or_none()
            if not student:
                continue

            score = score_map.get(student_id)
            points = None
            if score:
                points = score.override_score if score.override_score is not None else score.score

            due = assignment.due_date.strftime("%m/%d/%Y") if assignment.due_date else ""

            writer.writerow([
                student.sis_id or "",
                assignment.title,
                assignment.subject or "General",
                points if points is not None else "",
                assignment.max_score,
                due,
                assignment.id,
            ])

    return output.getvalue()
