from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class QAPair(BaseModel):
    question: str
    expected_answer: Optional[str] = None

class CompressRequest(BaseModel):
    text: str = Field(..., max_length=50000, description="Context prompt text (max 50,000 chars)")
    qa_pairs: Optional[List[QAPair]] = None

class CompressResponse(BaseModel):
    id: Optional[str] = None
    compressed_text: str
    raw_tokens: int
    compressed_tokens: int
    compression_ratio: float
    accuracy_retained: Optional[float] = None
    stage2_provider: Optional[str] = None
    validation_provider: Optional[str] = None
    providerUsed: Optional[str] = None
    cost_saved_usd: float
    latency_speedup_ratio: Optional[float] = None
    latency_speedup_is_estimated: Optional[bool] = None

class HistoryItemResponse(BaseModel):
    id: str
    created_at: Optional[str] = None
    dataset_name: str
    original_text: str
    compressed_text: str
    original_tokens: int
    compressed_tokens: int
    compression_ratio: float
    cost_saved_usd: float
    latency_ms: float
    latency_speedup: float
    semantic_accuracy: float
    provider_used: str
    status: str
    warning: Optional[str] = None
    evaluations: Optional[List[Dict[str, Any]]] = None

class AnalyticsResponse(BaseModel):
    average_compression_ratio: float
    average_cost_saved: float
    average_latency_ms: float
    average_semantic_accuracy: float
    total_runs: int
    best_compression: float
    worst_compression: float
    provider_usage_statistics: Dict[str, int]
