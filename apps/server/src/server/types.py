from typing import Literal

from pydantic import BaseModel


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class Employee(BaseModel):
    id: int
    full_name: str
    work_email: str
    title: str
    department: str
    manager_id: int | None
    start_date: str
    work_location: str


class ListView(BaseModel):
    type: Literal["list"]
    title: str
    data: list[Employee]


class ChatResponse(BaseModel):
    response: str
    view: ListView | None = None
