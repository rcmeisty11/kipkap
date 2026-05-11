from __future__ import annotations
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/kipkap"
    clever_client_id: str = ""
    clever_client_secret: str = ""
    clever_redirect_uri: str = "http://localhost:8000/auth/callback"
    jwt_secret_key: str = "dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_hours: int = 24
    illuminate_base_url: str = "https://{district}.illuminateed.com/live/rest_server.php"
    illuminate_consumer_key: str = ""
    illuminate_consumer_secret: str = ""
    illuminate_user_key: str = ""
    illuminate_user_secret: str = ""
    cors_origins: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def sync_database_url(self) -> str:
        return self.database_url.replace("+asyncpg", "").replace("+aiosqlite", "")

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
