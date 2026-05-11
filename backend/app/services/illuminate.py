from __future__ import annotations
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Assignment, StudentScore, Student


class IlluminateService:
    def __init__(self, api_key: str, base_url: str):
        self.client = httpx.AsyncClient(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=30.0,
        )

    async def list_assessments(self, school_id: Optional[str] = None) -> list[dict]:
        params = {}
        if school_id:
            params["school_id"] = school_id
        resp = await self.client.get("/assessments", params=params)
        resp.raise_for_status()
        return resp.json().get("data", resp.json() if isinstance(resp.json(), list) else [])

    async def get_assessment_results(self, assessment_id: str) -> list[dict]:
        resp = await self.client.get(f"/assessments/{assessment_id}/results")
        resp.raise_for_status()
        return resp.json().get("data", resp.json() if isinstance(resp.json(), list) else [])

    async def close(self):
        await self.client.aclose()


async def import_assessment(
    api_key: str,
    base_url: str,
    assessment_id: str,
    section_id: int,
    teacher_id: int,
    db: AsyncSession,
) -> dict:
    svc = IlluminateService(api_key, base_url)
    try:
        results = await svc.get_assessment_results(assessment_id)

        existing = await db.execute(
            select(Assignment).where(Assignment.illuminate_id == assessment_id)
        )
        assignment = existing.scalar_one_or_none()
        if not assignment:
            assignment = Assignment(
                title=f"Assessment {assessment_id}",
                illuminate_id=assessment_id,
                section_id=section_id,
                teacher_id=teacher_id,
                max_score=100.0,
            )
            db.add(assignment)
            await db.flush()

        matched = 0
        unmatched = 0
        for r in results:
            sis_id = r.get("student_id") or r.get("sis_id")
            if not sis_id:
                unmatched += 1
                continue

            student_result = await db.execute(
                select(Student).where(Student.sis_id == str(sis_id))
            )
            student = student_result.scalar_one_or_none()
            if not student:
                unmatched += 1
                continue

            score_result = await db.execute(
                select(StudentScore).where(
                    StudentScore.assignment_id == assignment.id,
                    StudentScore.student_id == student.id,
                )
            )
            score = score_result.scalar_one_or_none()
            score_val = r.get("score") or r.get("points_earned")
            if score:
                score.score = float(score_val) if score_val is not None else None
            else:
                score = StudentScore(
                    assignment_id=assignment.id,
                    student_id=student.id,
                    score=float(score_val) if score_val is not None else None,
                )
                db.add(score)
            matched += 1

        await db.commit()
        return {
            "assignment_id": assignment.id,
            "scores_imported": matched,
            "students_matched": matched,
            "students_unmatched": unmatched,
        }
    finally:
        await svc.close()
