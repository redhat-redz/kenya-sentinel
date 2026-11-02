# Kenya Sentinel

**National Public Infrastructure Intelligence and Accountability System**

KSEF 2027 research prototype scaffold. Initial study focus: Tambach / Elgeyo Marakwet, Kenya.

## Included in this scaffold

- FastAPI backend
- SQLite database (no database server required)
- Report submission and listing
- Optional image evidence upload (JPEG, PNG, WEBP; maximum 5 MB)
- SHA-256 hash for uploaded evidence
- Basic summary analytics
- React + TypeScript + Vite frontend
- Leaflet map
- Basic backend tests

This is a local development prototype, not an official government service or production-ready public reporting platform. Authentication, authorization, institutional integration and a validated AI model are not implemented yet.

## Requirements

- Parrot OS / Debian-based Linux
- Python 3.10+ (3.11+ recommended)
- Node.js 20+ and npm
- Git

Check versions:

```bash
python3 --version
node --version
npm --version
git --version
```

Install available system packages:

```bash
sudo apt update
sudo apt install -y python3 python3-venv python3-pip git nodejs npm
```

If the packaged Node.js version is below 20, install a supported release using the official Node.js installation instructions.

## Start the backend

```bash
cd kenya-sentinel/backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

API docs: http://127.0.0.1:8000/docs  
Health: http://127.0.0.1:8000/health

## Start the frontend

Open a second terminal:

```bash
cd kenya-sentinel/frontend
npm install
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173.

The map background uses OpenStreetMap tiles and needs an internet connection. The application API and SQLite database run locally.

## Run tests

```bash
cd kenya-sentinel/backend
source .venv/bin/activate
pytest
```

## First workflow

1. Start the backend and frontend.
2. Submit a report with a title, category, description and coordinates.
3. Optionally attach a non-sensitive image.
4. Confirm the report appears in the table and map.
5. Inspect the API through `/docs`.
6. Inspect summary counts at `/api/v1/analytics/summary`.

Use clearly labelled synthetic demonstration data until field data has been collected using a documented, permission-based method.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/v1/reports` | Submit a report |
| GET | `/api/v1/reports` | List reports |
| GET | `/api/v1/reports/{id}` | Get one report |
| GET | `/api/v1/analytics/summary` | Summary statistics |

## Privacy and integrity

- Do not collect unnecessary personal information.
- Avoid identifiable faces, vehicle plates, names and phone numbers in evidence.
- Obtain permission for field data collection and photographs.
- A SHA-256 hash can help detect whether a stored file changes; it does not prove the image is authentic or the report is true.
- New reports are marked `pending_review`; submission is not verification.
- Uploaded files are stored locally and are not publicly served.
- Before real public deployment, add authentication, role-based access, rate limiting, malware scanning, retention/deletion controls, secure object storage and a formal review process.

## Planned milestones

1. Reporting workflow and persistence.
2. Geospatial map and filtering.
3. Reviewer workflow and access control.
4. Geographic clustering with scikit-learn.
5. Image classification only after preparing a suitable labelled dataset.
6. Testing, evaluation, documentation and competition demonstration.
