import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.rag.engine import rag_engine

@pytest.fixture(scope="session", autouse=True)
def init_rag():
    rag_engine.initialize()

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["platform"] == "SafeSignal"
    assert data["status"] == "online"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["active_sources_count"] > 0

def test_resources():
    response = client.get("/api/resources")
    assert response.status_code == 200
    data = response.json()
    assert len(data["resources"]) > 0

def test_analyze_text_high_concern():
    response = client.post("/api/analyze-text", json={
        "text": "I will leak your private photos and destroy your life if you don't send 50000 rupees"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "High Concern"
    assert data["severityScore"] >= 5
    assert len(data["signals"]) > 0

def test_analyze_text_benign():
    response = client.post("/api/analyze-text", json={
        "text": "Hi, are we meeting at the college library tomorrow morning?"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "Low Concern"
    assert data["severityScore"] < 2

def test_action_plan_physical():
    response = client.post("/api/action-plan", json={
        "situation": "physical_danger",
        "details": "Someone is following me outside the campus gates"
    })
    assert response.status_code == 200
    data = response.json()
    assert "112" in data["immediateStep"] or "112" in str(data["reportingOptions"])
    assert len(data["evidenceChecklist"]) > 0

def test_action_plan_deepfake():
    response = client.post("/api/action-plan", json={
        "situation": "deepfake_image_abuse",
        "details": "Someone posted morphed pictures on Instagram"
    })
    assert response.status_code == 200
    data = response.json()
    assert "StopNCII.org" in str(data["relevantResources"]) or "StopNCII.org" in str(data["reportingOptions"])

def test_assistant_query():
    response = client.post("/api/assistant", json={
        "query": "How do I report online blackmail on cybercrime.gov.in?"
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["answer"]) > 20
    assert len(data["sources"]) > 0
    assert data["isGrounded"] is True
