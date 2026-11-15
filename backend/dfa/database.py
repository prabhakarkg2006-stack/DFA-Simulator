
import sqlite3
import json

from pathlib import Path
from datetime import datetime, timezone
from contextlib import contextmanager


DATABASE_PATH = (
    Path(__file__).resolve().parent.parent / "dfa_simulator.db"
)


@contextmanager
def get_connection():
    """Open and safely close a SQLite connection."""

    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database():
    """Create the database tables if they do not exist."""

    with get_connection() as connection:
        connection.execute("""
            CREATE TABLE IF NOT EXISTS dfa_configurations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                creation_mode TEXT NOT NULL,
                configuration TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        connection.execute("""
            CREATE TABLE IF NOT EXISTS simulation_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dfa_id INTEGER,
                dfa_name TEXT NOT NULL,
                input_string TEXT NOT NULL,
                result TEXT NOT NULL,
                final_state TEXT,
                total_symbols INTEGER,
                created_at TEXT NOT NULL,
                FOREIGN KEY (dfa_id)
                    REFERENCES dfa_configurations(id)
                    ON DELETE SET NULL
            )
        """)


def save_dfa(name, dfa):
    now = datetime.now(timezone.utc).isoformat()
    creation_mode = dfa.get("creation_mode", "automatic")

    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO dfa_configurations
            (name, creation_mode, configuration, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (name, creation_mode, json.dumps(dfa), now)
        )

        return cursor.lastrowid


def get_saved_dfas():
    with get_connection() as connection:
        rows = connection.execute("""
            SELECT id, name, creation_mode, created_at
            FROM dfa_configurations
            ORDER BY id DESC
        """).fetchall()

        return [dict(row) for row in rows]


def get_saved_dfa(dfa_id):
    with get_connection() as connection:
        row = connection.execute(
            """
            SELECT id, name, creation_mode, configuration, created_at
            FROM dfa_configurations
            WHERE id = ?
            """,
            (dfa_id,)
        ).fetchone()

        if row is None:
            return None

        result = dict(row)
        result["configuration"] = json.loads(result["configuration"])

        return result


def delete_saved_dfa(dfa_id):
    with get_connection() as connection:
        cursor = connection.execute(
            "DELETE FROM dfa_configurations WHERE id = ?",
            (dfa_id,)
        )

        return cursor.rowcount > 0


def save_simulation(
    dfa_id,
    dfa_name,
    input_string,
    result,
    final_state=None,
    total_symbols=0
):
    now = datetime.now(timezone.utc).isoformat()

    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO simulation_history
            (
                dfa_id,
                dfa_name,
                input_string,
                result,
                final_state,
                total_symbols,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                dfa_id,
                dfa_name,
                input_string,
                result,
                final_state,
                total_symbols,
                now
            )
        )


def get_simulation_history():
    with get_connection() as connection:
        rows = connection.execute("""
            SELECT
                id,
                dfa_id,
                dfa_name,
                input_string,
                result,
                final_state,
                total_symbols,
                created_at
            FROM simulation_history
            ORDER BY id DESC
        """).fetchall()

        return [dict(row) for row in rows]


def delete_simulation_history():
    with get_connection() as connection:
        connection.execute("DELETE FROM simulation_history")
