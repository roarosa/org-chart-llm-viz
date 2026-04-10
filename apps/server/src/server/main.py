from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request

from server.chat import OpenAIChatService
from server.config import Settings
from server.db import create_connection, initialize_db, list_employees
from server.types import ChatResponse, Message


def create_app() -> FastAPI:
    settings = Settings()
    app = FastAPI(title=settings.app_name)

    @asynccontextmanager
    async def app_lifespan(app: FastAPI):
        connection = create_connection()
        initialize_db(connection)
        app.state.connection = connection
        app.state.chat_service = OpenAIChatService(settings, connection)
        yield
        connection.close()

    app.router.lifespan_context = app_lifespan

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/employees")
    def get_employees(request: Request) -> dict[str, list[dict[str, Any]]]:
        return {"employees": list_employees(request.app.state.connection)}

    @app.post("/api/chat", response_model=ChatResponse)
    def chat(messages: list[Message], request: Request) -> ChatResponse:
        return request.app.state.chat_service.run(messages)

    return app


app = create_app()
