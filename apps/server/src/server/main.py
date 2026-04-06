from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI

from server.config import Settings
from server.db import create_connection, initialize_db, list_employees

connection = create_connection()


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_db(connection)
    yield
    connection.close()


def create_app() -> FastAPI:
    settings = Settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/employees")
    def get_employees() -> dict[str, list[dict[str, Any]]]:
        return {"employees": list_employees(connection)}

    return app


app = create_app()
