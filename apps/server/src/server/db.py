import json
import sqlite3
from pathlib import Path
from typing import Any

from server.config import resolve_data_file


def create_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(":memory:", check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_db(connection: sqlite3.Connection, data_file: Path | None = None) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY,
            full_name TEXT NOT NULL,
            work_email TEXT NOT NULL,
            title TEXT NOT NULL,
            department TEXT NOT NULL,
            manager_id INTEGER,
            start_date TEXT NOT NULL,
            work_location TEXT NOT NULL
        )
        """
    )

    resolved_data_file = data_file or resolve_data_file()
    with resolved_data_file.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    rows = [
        (
            employee["id"],
            employee["full_name"],
            employee["work_email"],
            employee["title"],
            employee["department"],
            employee["manager_id"],
            employee["start_date"],
            employee["work_location"],
        )
        for employee in payload.get("employees", [])
    ]
    connection.executemany(
        """
        INSERT INTO employees(
            id,
            full_name,
            work_email,
            title,
            department,
            manager_id,
            start_date,
            work_location
        ) VALUES(?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )
    connection.commit()


def list_employees(
    connection: sqlite3.Connection, department: str | None = None
) -> list[dict[str, Any]]:
    query = """
        SELECT
            id,
            full_name,
            work_email,
            title,
            department,
            manager_id,
            start_date,
            work_location
        FROM employees
    """
    params: tuple[str, ...] = ()
    if department is not None:
        query += " WHERE department = ?"
        params = (department,)

    query += " ORDER BY id ASC"
    cursor = connection.execute(query, params)
    return [dict(row) for row in cursor.fetchall()]
