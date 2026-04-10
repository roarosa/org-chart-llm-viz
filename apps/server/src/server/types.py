from typing import Literal

from pydantic import BaseModel, field_validator


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


class SearchPeopleArgs(BaseModel):
    name_query: str | None = None
    employee_id: int | None = None
    work_email: str | None = None
    title: str | None = None
    department: str | None = None
    manager_id: int | None = None
    work_location: str | None = None
    start_date_on_or_after: str | None = None
    start_date_on_or_before: str | None = None
    limit: int | None = 25

    @field_validator(
        "name_query",
        "work_email",
        "title",
        "department",
        "work_location",
        "start_date_on_or_after",
        "start_date_on_or_before",
        mode="before",
    )
    @classmethod
    def empty_string_to_none(cls, value):
        return None if value == "" else value

    @field_validator("employee_id", "manager_id", mode="before")
    @classmethod
    def zero_to_none(cls, value):
        return None if value == 0 else value
