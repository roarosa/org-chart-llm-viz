import json
import sqlite3
from pathlib import Path

from server.config import resolve_data_file


def create_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(":memory:", check_same_thread=False)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_db(connection: sqlite3.Connection, data_file: Path | None = None) -> None:
    connection.execute(
        """
        CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            value INTEGER NOT NULL
        )
        """
    )

    resolved_data_file = data_file or resolve_data_file()
    with resolved_data_file.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    rows = [(item["id"], item["name"], item["value"]) for item in payload.get("items", [])]
    connection.executemany("INSERT INTO items(id, name, value) VALUES(?, ?, ?)", rows)
    connection.commit()


def list_items(connection: sqlite3.Connection) -> list[dict[str, int | str]]:
    cursor = connection.execute("SELECT id, name, value FROM items ORDER BY id ASC")
    return [dict(row) for row in cursor.fetchall()]
