from __future__ import annotations
from typing import Optional

from datetime import datetime, timedelta, timezone

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from jose import JWTError, jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.db import get_db
from app.models import User, Teacher
from app.schemas.leader import UserOut

router = APIRouter()

CLEVER_AUTH_URL = "https://clever.com/oauth/authorize"
CLEVER_TOKEN_URL = "https://clever.com/oauth/tokens"
CLEVER_API_URL = "https://api.clever.com/v3.0"


def create_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.jwt_expiry_hours)
    return jwt.encode(
        {"sub": str(user_id), "role": role, "exp": expire},
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        raise HTTPException(401, "Not authenticated")
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.get(User, int(user_id))
    if not user:
        raise HTTPException(401, "User not found")
    return user


@router.get("/clever")
async def clever_login():
    url = (
        f"{CLEVER_AUTH_URL}?response_type=code"
        f"&client_id={settings.clever_client_id}"
        f"&redirect_uri={settings.clever_redirect_uri}"
        f"&scope=read:user"
    )
    return RedirectResponse(url)


@router.get("/callback")
async def clever_callback(code: str, db: AsyncSession = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(
            CLEVER_TOKEN_URL,
            json={
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": settings.clever_redirect_uri,
            },
            auth=(settings.clever_client_id, settings.clever_client_secret),
        )
        token_resp.raise_for_status()
        access_token = token_resp.json()["access_token"]

        me_resp = await client.get(
            f"{CLEVER_API_URL}/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        me_resp.raise_for_status()
        me = me_resp.json()["data"]

    clever_id = me["id"]
    user_type = me.get("type", "teacher")
    role = "leader" if user_type in ("district_admin", "school_admin") else "teacher"

    result = await db.execute(select(User).where(User.clever_id == clever_id))
    user = result.scalar_one_or_none()

    teacher_id = None
    if role == "teacher":
        t = await db.execute(select(Teacher).where(Teacher.clever_id == clever_id))
        teacher = t.scalar_one_or_none()
        teacher_id = teacher.id if teacher else None

    if user:
        user.role = role
        user.teacher_id = teacher_id
    else:
        email = me.get("email", f"{clever_id}@clever.user")
        user = User(email=email, role=role, teacher_id=teacher_id, clever_id=clever_id)
        db.add(user)

    await db.commit()
    await db.refresh(user)

    token = create_token(user.id, user.role)
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={token}")


@router.get("/me", response_model=UserOut)
async def get_me(user: User = Depends(get_current_user)):
    return user


@router.post("/demo-login")
async def demo_login(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == "demo@kipkap.dev"))
    user = result.scalar_one_or_none()
    if not user:
        user = User(email="demo@kipkap.dev", role="leader", clever_id="demo-clever-id")
        db.add(user)
        await db.commit()
        await db.refresh(user)
    token = create_token(user.id, user.role)
    return {"token": token, "user": UserOut.model_validate(user)}
