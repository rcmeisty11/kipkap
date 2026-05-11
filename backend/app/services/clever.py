from __future__ import annotations
from typing import Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import District, School, Teacher, Section, Student, Enrollment


class CleverService:
    def __init__(self, access_token: str):
        self.client = httpx.AsyncClient(
            base_url="https://api.clever.com/v3.0",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=30.0,
        )

    async def _paginate(self, url: str, params: Optional[dict] = None) -> list[dict]:
        results = []
        params = params or {}
        while url:
            resp = await self.client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            results.extend(data.get("data", []))
            url = data.get("links", [{}])[-1].get("uri") if data.get("links") else None
            params = {}
        return results

    async def get_me(self) -> dict:
        resp = await self.client.get("/me")
        resp.raise_for_status()
        return resp.json()["data"]

    async def get_districts(self) -> list[dict]:
        return await self._paginate("/districts")

    async def get_schools(self, district_id: str) -> list[dict]:
        return await self._paginate("/schools", {"district": district_id})

    async def get_teachers(self, school_id: str) -> list[dict]:
        return await self._paginate("/teachers", {"school": school_id})

    async def get_sections(self, school_id: str) -> list[dict]:
        return await self._paginate("/sections", {"school": school_id})

    async def get_students(self, school_id: str) -> list[dict]:
        return await self._paginate("/students", {"school": school_id})

    async def get_enrollments(self, section_id: str) -> list[dict]:
        return await self._paginate(f"/sections/{section_id}/students")

    async def close(self):
        await self.client.aclose()


async def _upsert(db: AsyncSession, model, clever_id: str, defaults: dict):
    result = await db.execute(select(model).where(model.clever_id == clever_id))
    obj = result.scalar_one_or_none()
    if obj:
        for k, v in defaults.items():
            setattr(obj, k, v)
    else:
        obj = model(clever_id=clever_id, **defaults)
        db.add(obj)
    await db.flush()
    return obj


async def sync_from_clever(access_token: str, db: AsyncSession) -> dict:
    svc = CleverService(access_token)
    counts = {"districts": 0, "schools": 0, "teachers": 0, "sections": 0, "students": 0}

    try:
        me = await svc.get_me()
        district_id = me.get("district")

        districts_data = await svc.get_districts()
        for d in districts_data:
            dd = d.get("data", d)
            await _upsert(db, District, dd["id"], {"name": dd.get("name", "")})
            counts["districts"] += 1

        schools_data = await svc.get_schools(district_id)
        school_map = {}
        for s in schools_data:
            sd = s.get("data", s)
            dist = await db.execute(select(District).where(District.clever_id == district_id))
            dist_obj = dist.scalar_one_or_none()
            obj = await _upsert(db, School, sd["id"], {
                "district_id": dist_obj.id if dist_obj else 1,
                "name": sd.get("name", ""),
                "sis_id": sd.get("sis_id"),
            })
            school_map[sd["id"]] = obj.id
            counts["schools"] += 1

        for clever_school_id, db_school_id in school_map.items():
            teachers_data = await svc.get_teachers(clever_school_id)
            teacher_map = {}
            for t in teachers_data:
                td = t.get("data", t)
                name = td.get("name", {})
                obj = await _upsert(db, Teacher, td["id"], {
                    "school_id": db_school_id,
                    "email": td.get("email", ""),
                    "first_name": name.get("first", ""),
                    "last_name": name.get("last", ""),
                })
                teacher_map[td["id"]] = obj.id
                counts["teachers"] += 1

            sections_data = await svc.get_sections(clever_school_id)
            for sec in sections_data:
                sd = sec.get("data", sec)
                teacher_clever = sd.get("teacher")
                teacher_db_id = teacher_map.get(teacher_clever, 1)
                obj = await _upsert(db, Section, sd["id"], {
                    "school_id": db_school_id,
                    "teacher_id": teacher_db_id,
                    "name": sd.get("name", ""),
                    "subject": sd.get("subject"),
                    "grade": sd.get("grade"),
                    "sis_id": sd.get("sis_id"),
                })
                counts["sections"] += 1

            students_data = await svc.get_students(clever_school_id)
            for st in students_data:
                sd = st.get("data", st)
                name = sd.get("name", {})
                ext = sd.get("ext", {})
                await _upsert(db, Student, sd["id"], {
                    "school_id": db_school_id,
                    "first_name": name.get("first", ""),
                    "last_name": name.get("last", ""),
                    "grade": sd.get("grade"),
                    "sis_id": sd.get("sis_id"),
                    "is_ml": ext.get("is_ml", False),
                    "is_dl": ext.get("is_dl", False),
                })
                counts["students"] += 1

        await db.commit()
    finally:
        await svc.close()

    return counts
