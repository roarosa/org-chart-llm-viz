import json
from pathlib import Path
from typing import Any

from sqlalchemy import (
    CheckConstraint,
    Column,
    Integer,
    MetaData,
    String,
    Table,
    and_,
    create_engine,
    delete,
    func,
    insert,
    select,
)
from sqlalchemy.engine import Connection
from sqlalchemy.pool import StaticPool

from server.config import resolve_data_file

metadata = MetaData()

employees_table = Table(
    "employees",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("full_name", String, nullable=False),
    Column("work_email", String, nullable=False),
    Column("title", String, nullable=False),
    Column("department", String, nullable=False),
    Column("manager_id", Integer, nullable=True),
    Column("start_date", String, nullable=False),
    Column("work_location", String, nullable=False),
    CheckConstraint("start_date GLOB '????-??-??'", name="employees_start_date_iso_check"),
)


def create_connection() -> Connection:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    return engine.connect()


def initialize_db(connection: Connection, data_file: Path | None = None) -> None:
    metadata.create_all(connection)
    resolved_data_file = data_file or resolve_data_file()
    with resolved_data_file.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    rows = [
        {
            "id": employee["id"],
            "full_name": employee["full_name"],
            "work_email": employee["work_email"],
            "title": employee["title"],
            "department": employee["department"],
            "manager_id": employee["manager_id"],
            "start_date": employee["start_date"],
            "work_location": employee["work_location"],
        }
        for employee in payload.get("employees", [])
    ]
    connection.execute(delete(employees_table))
    if rows:
        connection.execute(insert(employees_table), rows)
    connection.commit()


def list_employees(connection: Connection) -> list[dict[str, Any]]:
    return search_employees(connection, limit=None)


def get_employees(connection: Connection, ids: list[int]) -> list[dict[str, Any]]:
    cursor = connection.execute(select(employees_table).where(employees_table.c.id.in_(ids)))
    return [dict(row) for row in cursor.mappings().all()]


def search_employees(
    connection: Connection,
    *,
    name_query: str | None = None,
    employee_id: int | None = None,
    work_email: str | None = None,
    title: str | None = None,
    department: str | None = None,
    manager_id: int | None = None,
    work_location: str | None = None,
    start_date_on_or_after: str | None = None,
    start_date_on_or_before: str | None = None,
    limit: int | None = 25,
) -> list[dict[str, Any]]:
    conditions = []

    if employee_id is not None:
        conditions.append(employees_table.c.id == employee_id)

    if name_query:
        for token in name_query.lower().split():
            conditions.append(func.lower(employees_table.c.full_name).like(f"%{token}%"))

    if work_email:
        conditions.append(func.lower(employees_table.c.work_email).like(f"%{work_email.lower()}%"))

    if title:
        conditions.append(func.lower(employees_table.c.title).like(f"%{title.lower()}%"))

    if department:
        conditions.append(func.lower(employees_table.c.department) == department.lower())

    if manager_id is not None:
        conditions.append(employees_table.c.manager_id == manager_id)

    if work_location:
        conditions.append(
            func.lower(employees_table.c.work_location).like(f"%{work_location.lower()}%")
        )

    if start_date_on_or_after:
        conditions.append(employees_table.c.start_date >= start_date_on_or_after)

    if start_date_on_or_before:
        conditions.append(employees_table.c.start_date <= start_date_on_or_before)

    query = select(employees_table)
    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(employees_table.c.id.asc())
    if limit is not None:
        query = query.limit(limit)

    cursor = connection.execute(query)
    return [dict(row) for row in cursor.mappings().all()]
