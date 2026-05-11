from __future__ import annotations
from typing import Optional
import asyncio

import requests
from requests_oauthlib import OAuth1
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Assignment, StudentScore, Student


class IlluminateService:
    def __init__(
        self,
        api_key: str = "",
        base_url: str = "",
        consumer_key: str = "",
        consumer_secret: str = "",
        user_key: str = "",
        user_secret: str = "",
    ):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()

        if consumer_key and consumer_secret and user_key and user_secret:
            self.session.auth = OAuth1(
                client_key=consumer_key,
                client_secret=consumer_secret,
                resource_owner_key=user_key,
                resource_owner_secret=user_secret,
                signature_type="auth_header",
            )
        elif api_key:
            self.session.headers.update({"Authorization": f"Bearer {api_key}"})
        else:
            raise ValueError("Illuminate authentication must be configured")

    async def list_assessments(self, school_id: Optional[str] = None) -> list[dict]:
        params = {}
        if school_id:
            params["school_id"] = school_id
        return await self._request("GET", "/Api/Assessments", params=params)

    async def get_assessment_results(self, assessment_id: str) -> list[dict]:
        params = {"assessment_id": assessment_id}
        return await self._request("GET", "/Api/AssessmentScores", params=params)

    async def _request(self, method: str, endpoint: str, params: dict[str, str] | None = None) -> list[dict]:
        return await asyncio.to_thread(self._sync_request, method, endpoint, params or {})

    def _sync_request(self, method: str, endpoint: str, params: dict[str, str]) -> list[dict]:
        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        resp = self.session.request(method, url, params=params, timeout=30)
        resp.raise_for_status()
        return self._normalize_response(resp.json())

    def _normalize_response(self, response_data: object) -> list[dict]:
        if isinstance(response_data, dict):
            if "data" in response_data and isinstance(response_data["data"], list):
                return response_data["data"]
            return [response_data]
        if isinstance(response_data, list):
            return response_data
        return []

    async def close(self):
        await asyncio.to_thread(self.session.close)


async def import_assessment(
    api_key: str,
    base_url: str,
    assessment_id: str,
    section_id: int,
    teacher_id: int,
    db: AsyncSession,
    consumer_key: str = "",
    consumer_secret: str = "",
    user_key: str = "",
    user_secret: str = "",
) -> dict:
    svc = IlluminateService(
        api_key=api_key,
        base_url=base_url,
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
        user_key=user_key,
        user_secret=user_secret,
    )
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
