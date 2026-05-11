from __future__ import annotations
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db import get_db
from app.models import User
from app.schemas.clever import SyncResponse
from app.services.clever import sync_from_clever

router = APIRouter()


@router.post("/clever", response_model=SyncResponse)
async def trigger_clever_sync(
    access_token: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if user.role not in ("leader", "admin"):
        raise HTTPException(403, "Only leaders/admins can trigger sync")

    if not access_token:
        raise HTTPException(400, "access_token required")

    counts = await sync_from_clever(access_token, db)
    return SyncResponse(status="success", **{f"{k}_synced": v for k, v in counts.items()})
