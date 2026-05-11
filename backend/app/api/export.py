from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db import get_db
from app.models import User
from app.services.export import generate_powerschool_csv

router = APIRouter()


@router.get("/powerschool")
async def export_powerschool(
    section_id: int = Query(...),
    assignment_ids: str = Query(..., description="Comma-separated assignment IDs"),
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    ids = [int(x.strip()) for x in assignment_ids.split(",") if x.strip()]
    csv_content = await generate_powerschool_csv(section_id, ids, db)

    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=powerschool_export.csv"},
    )
