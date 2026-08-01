from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Verify endpoint /health returns status: ok and system metrics."""
    response = client.get("/health")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["status"] == "ok"
    assert "cuda_available" in res_json

def test_compress_endpoint_code():
    """Verify endpoint /compress compresses prompt content end-to-end and returns metrics."""
    payload = {
        "text": (
            "def calculate_total_tax(amount):\n"
            "    # Boilerplate helper comments that can be safely discarded\n"
            "    tax_rate = 0.15\n"
            "    return amount * tax_rate\n"
        ),
        "qa_pairs": [
            {
                "question": "What is the tax rate used in calculate_total_tax?"
            }
        ]
    }
    response = client.post("/compress", json=payload)
    assert response.status_code == 200
    res_json = response.json()
    
    assert "compressed_text" in res_json
    assert res_json["raw_tokens"] > 0
    assert res_json["compressed_tokens"] > 0
    assert "compression_ratio" in res_json
    assert "cost_saved_usd" in res_json
    assert "latency_speedup_ratio" in res_json
    assert res_json["accuracy_retained"] is not None
    assert res_json["providerUsed"] == "mock"
