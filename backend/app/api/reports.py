from datetime import datetime, timezone
from hashlib import sha256
from uuid import uuid4
import sqlite3

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.config import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_BYTES, UPLOAD_DIR
from app.services.database import get_connection

router = APIRouter(prefix="/api/v1", tags=["reports"])
CATEGORIES = {"road_damage", "water_leakage", "waste_accumulation", "other"}

def row_to_dict(row: sqlite3.Row) -> dict:
    return dict(row)

@router.post("/reports", status_code=201)
async def create_report(
    title: str = Form(..., min_length=4, max_length=120),
    category: str = Form(...),
    description: str = Form(..., min_length=10, max_length=2000),
    latitude: float = Form(..., ge=-90, le=90),
    longitude: float = Form(..., ge=-180, le=180),
    evidence: UploadFile | None = File(default=None),
):
    if category not in CATEGORIES:
        raise HTTPException(status_code=422, detail="Unsupported report category.")

    stored_name = None
    evidence_hash = None

    if evidence is not None:
        if evidence.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(status_code=415, detail="Only JPEG, PNG and WEBP images are accepted.")
        content = await evidence.read(MAX_UPLOAD_BYTES + 1)
        if len(content) > MAX_UPLOAD_BYTES:
            raise HTTPException(status_code=413, detail="Image exceeds the 5 MB limit.")
        signature = ALLOWED_CONTENT_TYPES[evidence.content_type]
        if not content.startswith(signature):
            raise HTTPException(status_code=415, detail="File signature does not match declared image type.")
        if evidence.content_type == "image/webp" and (len(content) < 12 or content[8:12] != b"WEBP"):
            raise HTTPException(status_code=415, detail="Invalid WEBP file signature.")

        suffix = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}[evidence.content_type]
        stored_name = f"{uuid4().hex}{suffix}"
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        (UPLOAD_DIR / stored_name).write_bytes(content)
        evidence_hash = sha256(content).hexdigest()

    created_at = datetime.now(timezone.utc).isoformat()
    try:
        with get_connection() as conn:
            cursor = conn.execute(
                "INSERT INTO reports "
                "(title, category, description, latitude, longitude, status, "
                "evidence_filename, evidence_sha256, created_at) "
                "VALUES (?, ?, ?, ?, ?, 'pending_review', ?, ?, ?)",
                (title.strip(), category, description.strip(), latitude, longitude,
                 stored_name, evidence_hash, created_at),
            )
            conn.commit()
            row = conn.execute("SELECT * FROM reports WHERE id = ?", (cursor.lastrowid,)).fetchone()
            return row_to_dict(row)
    except Exception:
        if stored_name:
            (UPLOAD_DIR / stored_name).unlink(missing_ok=True)
        raise

@router.get("/reports")
def list_reports(limit: int = 100, offset: int = 0):
    if limit < 1 or limit > 500 or offset < 0:
        raise HTTPException(status_code=422, detail="Invalid pagination values.")
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT * FROM reports ORDER BY id DESC LIMIT ? OFFSET ?", (limit, offset)
        ).fetchall()
        return [row_to_dict(row) for row in rows]

@router.get("/reports/{report_id}")
def get_report(report_id: int):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM reports WHERE id = ?", (report_id,)).fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="Report not found.")
        return row_to_dict(row)

@router.get("/analytics/summary")
def analytics_summary():
    with get_connection() as conn:
        total = conn.execute("SELECT COUNT(*) FROM reports").fetchone()[0]
        categories = conn.execute(
            "SELECT category, COUNT(*) AS count FROM reports GROUP BY category"
        ).fetchall()
        statuses = conn.execute(
            "SELECT status, COUNT(*) AS count FROM reports GROUP BY status"
        ).fetchall()
    return {
        "total_reports": total,
        "by_category": {row["category"]: row["count"] for row in categories},
        "by_status": {row["status"]: row["count"] for row in statuses},
        "note": "Counts describe this local prototype database, not national statistics."
    }
