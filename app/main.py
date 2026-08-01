from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from app.models import CompressRequest, CompressResponse
from app.compressor import compress
from app.validator import validate
import sys

# Wrap torch import to prevent startup crashes when torch is not installed
try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

app = FastAPI(
    title="Nucleus API",
    description="Ultra-Low Resource LLM Context Compression Engine API",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/compress", response_model=CompressResponse)
async def compress_endpoint(req: CompressRequest):
    try:
        # Run stage A, B, and C compression in threadpool (non-blocking)
        result = await run_in_threadpool(compress, req.text)
        
        # Check if local embedding model is a Mock (signaling Stage-1-only fallback)
        from app.compressor import get_model
        model_instance = get_model()
        if model_instance.__class__.__name__ == "MockModel":
            stage2_provider = "stage1-only"
        else:
            stage2_provider = "groq"
        
        # Run semantic QA accuracy validation if QA pairs are supplied
        accuracy_retained = None
        validation_provider = None
        provider_used = None
        latency_speedup = None
        
        if req.qa_pairs:
            qa_list = [pair.model_dump() for pair in req.qa_pairs]
            # Run validate in threadpool (non-blocking)
            validation_res = await run_in_threadpool(validate, req.text, result["compressed_text"], qa_list)
            accuracy_retained = validation_res["accuracy_retained"]
            validation_provider = validation_res["providerUsed"]
            provider_used = validation_res["providerUsed"]
            latency_speedup = validation_res["latency_speedup_ratio"]
            
        # Cost saving calculation (Reference target model: Claude 3.5 Sonnet at $3.00/1M input tokens)
        tokens_saved = result["raw_tokens"] - result["compressed_tokens"]
        cost_saved_usd = round(max(0.0, tokens_saved * (3.00 / 1_000_000)), 6)
        
        return CompressResponse(
            compressed_text=result["compressed_text"],
            raw_tokens=result["raw_tokens"],
            compressed_tokens=result["compressed_tokens"],
            compression_ratio=result["compression_ratio"],
            accuracy_retained=accuracy_retained,
            stage2_provider=stage2_provider,
            validation_provider=validation_provider,
            providerUsed=provider_used,
            cost_saved_usd=cost_saved_usd,
            latency_speedup_ratio=latency_speedup
        )
    except Exception as e:
        print(f"[API Error] /compress failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    cuda_available = torch.cuda.is_available() if TORCH_AVAILABLE else False
    device_name = torch.cuda.get_device_name(0) if cuda_available else "N/A"
    pytorch_version = torch.__version__ if TORCH_AVAILABLE else "Not Installed"
    return {
        "status": "ok",
        "python_version": sys.version,
        "cuda_available": cuda_available,
        "gpu_device": device_name,
        "pytorch_version": pytorch_version
    }
