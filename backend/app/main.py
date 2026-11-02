from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.reports import router as reports_router
from app.services.database import initialize_database

app = FastAPI(
    title="Kenya Sentinel API",
    description="Prototype API for public infrastructure reporting and intelligence.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

@app.on_event("startup")
def on_startup():
    initialize_database()

@app.get("/health", tags=["system"])
def health():
    return {"status": "ok", "service": "kenya-sentinel-api", "version": "0.1.0"}

app.include_router(reports_router)
