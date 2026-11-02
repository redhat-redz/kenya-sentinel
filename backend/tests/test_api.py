from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_summary_shape():
    response = client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    assert "total_reports" in response.json()
