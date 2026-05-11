from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api import auth, sync, assignments, standards, students, focus_groups, export, illuminate, leader

app = FastAPI(title="KipKap Badge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(sync.router, prefix="/sync", tags=["sync"])
app.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
app.include_router(standards.router, prefix="/standards", tags=["standards"])
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(focus_groups.router, prefix="/focus-groups", tags=["focus-groups"])
app.include_router(export.router, prefix="/export", tags=["export"])
app.include_router(illuminate.router, prefix="/import", tags=["import"])
app.include_router(leader.router, prefix="/leader", tags=["leader"])


@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
