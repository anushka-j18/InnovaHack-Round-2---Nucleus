import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.main as app_main
from app.main import app
from app.database import Base, get_db
from app.models import CompressionJob, EvaluationResult, History

# Create in-memory SQLite test database
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app_main.SessionLocal = TestingSessionLocal

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_database_connection_and_table_creation():
    db = TestingSessionLocal()
    assert db is not None
    db.close()

def test_insert_compression_job_and_history():
    db = TestingSessionLocal()
    
    job = CompressionJob(
        dataset_name="Python Backend Infrastructure",
        original_text="import os\nimport sys\n# test comment\n",
        compressed_text="import os\nimport sys\n",
        original_tokens=20,
        compressed_tokens=10,
        compression_ratio=50.0,
        cost_saved_usd=0.00003,
        latency_ms=45.2,
        latency_speedup=3.4,
        semantic_accuracy=100.0,
        provider_used="groq",
        status="completed"
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    
    assert job.id is not None
    assert job.compression_ratio == 50.0

    eval_result = EvaluationResult(
        compression_job_id=job.id,
        question="What module is imported?",
        original_answer="os and sys",
        compressed_answer="os and sys",
        similarity_score=1.0,
        passed=True
    )
    db.add(eval_result)
    db.commit()
    
    fetched_job = db.query(CompressionJob).filter(CompressionJob.id == job.id).first()
    assert fetched_job is not None
    assert len(fetched_job.evaluations) == 1
    db.close()

def test_get_history_endpoint():
    response = client.get("/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_compress_endpoint_and_auto_history():
    payload = {
        "text": "import os\nimport sys\n# test repetition\n# test repetition\ndef test_fn():\n    pass\n"
    }
    response = client.post("/compress", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "compressed_text" in data
    assert "compression_ratio" in data

    # Verify history has recorded job
    history_resp = client.get("/history")
    assert history_resp.status_code == 200
    history_data = history_resp.json()
    assert len(history_data) >= 1

def test_delete_history_endpoint():
    db = TestingSessionLocal()
    job = CompressionJob(
        dataset_name="Test Deletion Job",
        original_text="test text",
        compressed_text="test",
        original_tokens=10,
        compressed_tokens=5,
        compression_ratio=50.0
    )
    db.add(job)
    db.commit()
    job_id = job.id
    db.close()

    del_resp = client.delete(f"/history/{job_id}")
    assert del_resp.status_code == 200

    get_resp = client.get(f"/history/{job_id}")
    assert get_resp.status_code == 404

def test_analytics_endpoint():
    analytics_resp = client.get("/analytics")
    assert analytics_resp.status_code == 200
    data = analytics_resp.json()
    assert "average_compression_ratio" in data
    assert "average_cost_saved" in data
    assert "provider_usage_statistics" in data

def test_clear_all_history_endpoint():
    clear_resp = client.delete("/history")
    assert clear_resp.status_code == 200
    assert "message" in clear_resp.json()
