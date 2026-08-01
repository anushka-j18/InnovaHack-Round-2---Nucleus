from pydantic import BaseModel, Field
from typing import List, Optional

class QAPair(BaseModel):
    question: str = Field(..., description="The validation question to run against original and compressed context")
    expected_answer: Optional[str] = Field(None, description="Optional ground truth answer to compare against")

class CompressRequest(BaseModel):
    text: str = Field(..., max_length=50000, description="The raw context text to be compressed (max 50,000 characters)")
    qa_pairs: Optional[List[QAPair]] = Field(None, description="Optional list of QA pairs for accuracy retention validation")
    aggressiveness: Optional[float] = Field(None, ge=0.0, le=1.0, description="Aggressiveness factor (0.0=no compression, 1.0=maximum compression)")
    keep_ratio: Optional[float] = Field(None, ge=0.0, le=1.0, description="Explicit keep ratio (overrides default config)")
    target_token_budget: Optional[int] = Field(None, ge=1, description="Target token budget to fit compressed text into")
    target_model: Optional[str] = Field(None, description="Target model key for pricing lookup (e.g. 'claude-3-5-sonnet', 'gpt-4o', 'gemini-2.5-flash')")
    is_conversation: Optional[bool] = Field(False, description="Flag indicating if the text represents a chat history log")
    redact_pii: Optional[bool] = Field(False, description="Flag indicating if API keys, emails, and credit cards should be redacted")

class LineDiff(BaseModel):
    line: str = Field(..., description="The original line text")
    kept: bool = Field(..., description="Flag indicating if this line was kept in final output")
    reason: str = Field(..., description="Reason for the keeping or dropping decision")

class QAValidationDetail(BaseModel):
    question: str = Field(..., description="The validation question")
    answer_raw: str = Field(..., description="The answer generated using raw context")
    answer_compressed: str = Field(..., description="The answer generated using compressed context")
    match_score: float = Field(..., description="Semantic match similarity score (0.0 to 100.0)")

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
    latency_speedup_is_estimated: Optional[bool] = Field(None, description="Flag indicating if the latency speedup ratio was simulated/estimated")
    plain_english_summary: str = Field(..., description="Plain-English explanation of compression savings")
    structured_diff: Optional[List[LineDiff]] = Field(None, description="Line-by-line diff metadata containing keep/drop flags and reasons")
    validation_details: Optional[List[QAValidationDetail]] = Field(None, description="Side-by-side Q&A answers for validation inspectability")
