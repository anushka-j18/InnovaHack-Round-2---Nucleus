import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Text, DateTime, ForeignKey, Boolean, Index
from sqlalchemy.orm import relationship
from app.database import Base

class CompressionJob(Base):
    """
    Persisted compression run record storing context text, token counts, cost savings, and latency metrics.
    """
    __tablename__ = "compression_jobs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    dataset_name = Column(String(100), default="Context Prompt")
    original_text = Column(Text, nullable=False)
    compressed_text = Column(Text, nullable=False)
    original_tokens = Column(Integer, nullable=False)
    compressed_tokens = Column(Integer, nullable=False)
    compression_ratio = Column(Float, nullable=False, index=True)
    cost_saved_usd = Column(Float, default=0.0)
    latency_ms = Column(Float, default=0.0)
    latency_speedup = Column(Float, default=1.0)
    semantic_accuracy = Column(Float, default=100.0)
    provider_used = Column(String(50), default="groq", index=True)
    status = Column(String(20), default="completed")
    warning = Column(String(255), nullable=True)

    # Relationships
    evaluations = relationship("EvaluationResult", back_populates="compression_job", cascade="all, delete-orphan")
    history_entries = relationship("History", back_populates="compression_job", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "dataset_name": self.dataset_name,
            "original_text": self.original_text,
            "compressed_text": self.compressed_text,
            "original_tokens": self.original_tokens,
            "compressed_tokens": self.compressed_tokens,
            "compression_ratio": self.compression_ratio,
            "cost_saved_usd": self.cost_saved_usd,
            "latency_ms": self.latency_ms,
            "latency_speedup": self.latency_speedup,
            "semantic_accuracy": self.semantic_accuracy,
            "provider_used": self.provider_used,
            "status": self.status,
            "warning": self.warning,
            "evaluations": [eval_res.to_dict() for eval_res in self.evaluations] if self.evaluations else [],
        }


class EvaluationResult(Base):
    """
    LLM Question-Answering reasoning evaluation record matching raw vs compressed context.
    """
    __tablename__ = "evaluation_results"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    compression_job_id = Column(String(36), ForeignKey("compression_jobs.id", ondelete="CASCADE"), index=True, nullable=False)
    question = Column(Text, nullable=False)
    original_answer = Column(Text, nullable=True)
    compressed_answer = Column(Text, nullable=True)
    similarity_score = Column(Float, default=1.0)
    passed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    compression_job = relationship("CompressionJob", back_populates="evaluations")

    def to_dict(self):
        return {
            "id": self.id,
            "compression_job_id": self.compression_job_id,
            "question": self.question,
            "original_answer": self.original_answer,
            "compressed_answer": self.compressed_answer,
            "similarity_score": self.similarity_score,
            "passed": self.passed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class History(Base):
    """
    Historical execution log index linking compression jobs.
    """
    __tablename__ = "history_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    compression_job_id = Column(String(36), ForeignKey("compression_jobs.id", ondelete="CASCADE"), index=True, nullable=False)
    run_time = Column(Float, default=0.0)
    notes = Column(String(255), nullable=True)

    # Relationship
    compression_job = relationship("CompressionJob", back_populates="history_entries")

    def to_dict(self):
        return {
            "id": self.id,
            "compression_job_id": self.compression_job_id,
            "run_time": self.run_time,
            "notes": self.notes,
        }

# Explicit Indexes for fast query performance
Index("idx_jobs_created_ratio", CompressionJob.created_at.desc(), CompressionJob.compression_ratio.desc())
