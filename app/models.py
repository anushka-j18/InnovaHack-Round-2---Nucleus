from pydantic import BaseModel, Field
from typing import List, Optional

class QAPair(BaseModel):
    question: str = Field(..., description="The validation question to run against original and compressed context")
    expected_answer: Optional[str] = Field(None, description="Optional ground truth answer to compare against")

class CompressRequest(BaseModel):
    text: str = Field(..., description="The raw context text to be compressed")
    qa_pairs: Optional[List[QAPair]] = Field(None, description="Optional list of QA pairs for accuracy retention validation")

class CompressResponse(BaseModel):
    compressed_text: str = Field(..., description="The compressed version of the input text")
    raw_tokens: int = Field(..., description="Token count of the original context")
    compressed_tokens: int = Field(..., description="Token count of the compressed context")
    compression_ratio: float = Field(..., description="Percentage reduction in tokens (e.g. 70.5)")
    accuracy_retained: Optional[float] = Field(None, description="Average semantic similarity percentage (0-100) between answers")
    stage2_provider: Optional[str] = Field(None, description="Provider used for compression stage (e.g. 'groq' or 'stage1-only')")
    validation_provider: Optional[str] = Field(None, description="Provider used for QA validation (e.g. 'claude', 'gemini')")
    providerUsed: Optional[str] = Field(None, description="The provider used for validation QA (matching frontend/DB naming)")
    cost_saved_usd: float = Field(..., description="Estimated cost savings in USD compared to raw context processing")
    latency_speedup_ratio: Optional[float] = Field(None, description="Latency speedup ratio factor (e.g. 2.4x)")
