from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.config import settings
from app.db import get_db
from app.models import User
from app.services.illuminate import IlluminateService, import_assessment

router = APIRouter()


def _ensure_illuminate_configured() -> None:
    if not (
        settings.illuminate_api_key
        or (
            settings.illuminate_consumer_key
            and settings.illuminate_consumer_secret
            and settings.illuminate_user_key
            and settings.illuminate_user_secret
        )
    ):
        raise HTTPException(400, "Illuminate authentication is not configured")


@router.get("/assessments")
async def list_assessments(
    school_id: Optional[str] = None,
    user: User = Depends(get_current_user),
):
    _ensure_illuminate_configured()
    svc = IlluminateService(
        api_key=settings.illuminate_api_key,
        base_url=settings.illuminate_base_url,
        consumer_key=settings.illuminate_consumer_key,
        consumer_secret=settings.illuminate_consumer_secret,
        user_key=settings.illuminate_user_key,
        user_secret=settings.illuminate_user_secret,
    )
    try:
        return await svc.list_assessments(school_id)
    finally:
        await svc.close()


class ImportRequest(BaseModel):
    assessment_id: str
    section_id: int


@router.post("/import")
async def import_illuminate(
    body: ImportRequest,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    _ensure_illuminate_configured()
    result = await import_assessment(
        api_key=settings.illuminate_api_key,
        base_url=settings.illuminate_base_url,
        consumer_key=settings.illuminate_consumer_key,
        consumer_secret=settings.illuminate_consumer_secret,
        user_key=settings.illuminate_user_key,
        user_secret=settings.illuminate_user_secret,
        assessment_id=body.assessment_id,
        section_id=body.section_id,
        teacher_id=user.teacher_id or 0,
        db=db,
    )
    return result
