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
    create_engine,
    delete,
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


def list_employees(connection: Connection, department: str | None = None) -> list[dict[str, Any]]:
    query = select(employees_table).order_by(employees_table.c.id.asc())
    if department is not None:
        query = query.where(employees_table.c.department == department)
    cursor = connection.execute(query)
    return [dict(row) for row in cursor.mappings().all()]
