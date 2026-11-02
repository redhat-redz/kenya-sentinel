from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv("SENTINEL_DATA_DIR", BASE_DIR / "data"))
UPLOAD_DIR = Path(os.getenv("SENTINEL_UPLOAD_DIR", BASE_DIR / "uploads"))
DB_PATH = DATA_DIR / "kenya_sentinel.sqlite3"
MAX_UPLOAD_BYTES = 5 * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/webp": b"RIFF",
}
