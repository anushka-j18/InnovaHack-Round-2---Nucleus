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

def test_compress_endpoint_code_with_qa():
    """Verify endpoint /compress compresses prompt content end-to-end and returns validation metrics."""
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
    assert res_json["latency_speedup_is_estimated"] is True  # Since mock LLM is used
    assert res_json["accuracy_retained"] is not None
    assert res_json["providerUsed"] == "mock"

def test_compress_endpoint_without_qa():
    """Verify endpoint /compress handles payload without qa_pairs and skips validation."""
    payload = {
        "text": (
            "def dummy_api_check():\n"
            "    return True\n"
        )
    }
    response = client.post("/compress", json=payload)
    assert response.status_code == 200
    res_json = response.json()
    
    assert "compressed_text" in res_json
    assert "compression_ratio" in res_json
    assert res_json["accuracy_retained"] is None
    assert res_json["latency_speedup_ratio"] is None
    assert res_json["latency_speedup_is_estimated"] is None

def test_compress_endpoint_empty_text():
    """Verify API handles empty text gracefully, returning empty compression results."""
    payload = {
        "text": ""
    }
    response = client.post("/compress", json=payload)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["compressed_text"] == ""
    assert res_json["raw_tokens"] == 0
    assert res_json["compressed_tokens"] == 0
    assert res_json["compression_ratio"] == 0.0

def test_compress_endpoint_malformed_json():
    """Verify API rejects malformed payload with HTTP 422 validation error."""
    headers = {"Content-Type": "application/json"}
    payload = "{ malformed: json text }"
    response = client.post("/compress", headers=headers, content=payload)
    assert response.status_code == 422
