import os
import sqlite3

BASE = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE, "helpdesk.db")
SQL_DIR = os.path.join(BASE, "..", "database")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Create tables from schema.sql and load seed.sql if the DB is empty."""
    conn = get_conn()
    with open(os.path.join(SQL_DIR, "schema.sql")) as f:
        conn.executescript(f.read())
    if conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 0:
        with open(os.path.join(SQL_DIR, "seed.sql")) as f:
            conn.executescript(f.read())
    conn.commit()
    conn.close()
