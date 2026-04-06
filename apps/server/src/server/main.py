from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, Request

from server.config import Settings
from server.db import create_connection, initialize_db, list_employees
from server.types import ChatResponse, Employee, ListView, Message


@asynccontextmanager
async def lifespan(app: FastAPI):
    connection = create_connection()
    initialize_db(connection)
    app.state.connection = connection
    yield
    connection.close()


def create_app() -> FastAPI:
    settings = Settings()
    app = FastAPI(title=settings.app_name, lifespan=lifespan)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/employees")
    def get_employees(request: Request) -> dict[str, list[dict[str, Any]]]:
        return {"employees": list_employees(request.app.state.connection)}

    @app.post("/api/chat", response_model=ChatResponse)
    def chat(messages: list[Message], request: Request) -> ChatResponse:
        latest_user_message = next(
            (message for message in reversed(messages) if message.role == "user"),
            None,
        )
        if latest_user_message is None:
            return ChatResponse(
                response="Send a user message and I can help summarize employee data."
            )

        message_text = latest_user_message.content.lower()
        if "engineering" in message_text:
            employees = [
                Employee(**employee)
                for employee in list_employees(request.app.state.connection, "Engineering")
            ]
            return ChatResponse(
                response=f"There are {len(employees)} employees in the Engineering department.",
                view=ListView(
                    type="list",
                    title="Engineering employees",
                    data=employees,
                ),
            )

        return ChatResponse(
            response="I can answer questions about employees and return a list view when needed."
        )

    return app


app = create_app()
