import sqlite3
from contextlib import contextmanager
from app.core.config import DATA_DIR, DB_PATH

def initialize_database():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS reports ("
            "id INTEGER PRIMARY KEY AUTOINCREMENT, "
            "title TEXT NOT NULL, category TEXT NOT NULL, description TEXT NOT NULL, "
            "latitude REAL NOT NULL, longitude REAL NOT NULL, "
            "status TEXT NOT NULL DEFAULT 'pending_review', "
            "evidence_filename TEXT, evidence_sha256 TEXT, created_at TEXT NOT NULL)"
        )
        conn.commit()

@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
