import sys
import time
import logging
import traceback
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from app.models import CompressRequest, CompressResponse
from app.compressor import compress
from app.validator import validate

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("nucleus.main")

# Wrap torch import to prevent startup crashes when torch is not installed
try:
    import torch
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False

app = FastAPI(
    title="Nucleus API",
    description="Ultra-Low Resource Context Compression Engine API",
    version="1.0.0"
)

# Custom in-memory rate-limiter (30 requests per minute per IP)
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 30
request_history = {}

# In-memory dictionary cache with max size 100
COMPRESSION_CACHE = {}
MAX_CACHE_SIZE = 100

# In-memory metrics history
METRICS_HISTORY = []
MAX_METRICS_HISTORY = 100

# Pricing table per 1M input tokens in USD
PRICING_TABLE = {
    "claude-3-5-sonnet": 3.00,
    "claude-3-5-haiku": 0.80,
    "gemini-2.5-flash": 0.075,
    "gemini-2.5-pro": 1.25,
    "gpt-4o": 2.50,
    "gpt-4o-mini": 0.150,
    "llama-3.3-70b": 0.59
}

def get_cache_key(req: CompressRequest) -> str:
    import hashlib
    sig_components = [
        req.text,
        str(req.aggressiveness),
        str(req.keep_ratio),
        str(req.target_token_budget),
        str(req.target_model),
        str(req.is_conversation),
        str(req.redact_pii),
        str([qa.question for qa in req.qa_pairs] if req.qa_pairs else [])
    ]
    sig_str = "||".join(sig_components)
    return hashlib.sha256(sig_str.encode("utf-8")).hexdigest()

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path.startswith("/compress"):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Filter request timestamps older than 60 seconds
        history = request_history.get(client_ip, [])
        history = [t for t in history if now - t < RATE_LIMIT_WINDOW]
        request_history[client_ip] = history
        
        if len(history) >= RATE_LIMIT_MAX_REQUESTS:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Rate limit is 30 requests per minute."}
            )
            
        request_history[client_ip].append(now)
        
    return await call_next(request)

# Enable CORS for frontend integration (allowing wide wildcard origins securely)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/compress", response_model=CompressResponse)
async def compress_endpoint(req: CompressRequest):
    try:
        logger.info("Received request on /compress endpoint")
        
        # Check Cache
        cache_key = get_cache_key(req)
        if cache_key in COMPRESSION_CACHE:
            logger.info("Serving response from cache")
            return COMPRESSION_CACHE[cache_key]
            
        # Run stage A, B, and C compression in threadpool (non-blocking)
        result = await run_in_threadpool(
            compress,
            req.text,
            keep_ratio=req.keep_ratio or 0.30,
            aggressiveness=req.aggressiveness,
            target_token_budget=req.target_token_budget,
            is_conversation=req.is_conversation,
            redact_pii=req.redact_pii
        )
        
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
        latency_speedup_is_estimated = None
        validation_details = []
        
        if req.qa_pairs:
            qa_list = [pair.model_dump() for pair in req.qa_pairs]
            # Run validate in threadpool (non-blocking)
            validation_res = await run_in_threadpool(validate, req.text, result["compressed_text"], qa_list)
            accuracy_retained = validation_res["accuracy_retained"]
            validation_provider = validation_res["providerUsed"]
            provider_used = validation_res["providerUsed"]
            latency_speedup = validation_res["latency_speedup_ratio"]
            latency_speedup_is_estimated = validation_res["latency_speedup_is_estimated"]
            validation_details = validation_res["validation_details"]
            
        # Model-based pricing calculation
        pricing_rate = 3.00  # Default to Claude 3.5 Sonnet
        if req.target_model:
            model_key = req.target_model.lower().strip()
            # Match prefixes to support variations
            for k, val in PRICING_TABLE.items():
                if k in model_key or model_key in k:
                    pricing_rate = val
                    break
                    
        tokens_saved = result["raw_tokens"] - result["compressed_tokens"]
        cost_saved_usd = round(max(0.0, tokens_saved * (pricing_rate / 1_000_000)), 6)
        
        logger.info(
            f"Compression success: raw={result['raw_tokens']} -> comp={result['compressed_tokens']} "
            f"({result['compression_ratio']}% reduction) | cost_saved=${cost_saved_usd:.6f}"
        )
        
        response = CompressResponse(
            compressed_text=result["compressed_text"],
            raw_tokens=result["raw_tokens"],
            compressed_tokens=result["compressed_tokens"],
            compression_ratio=result["compression_ratio"],
            accuracy_retained=accuracy_retained,
            stage2_provider=stage2_provider,
            validation_provider=validation_provider,
            providerUsed=provider_used,
            cost_saved_usd=cost_saved_usd,
            latency_speedup_ratio=latency_speedup,
            latency_speedup_is_estimated=latency_speedup_is_estimated,
            plain_english_summary=result["plain_english_summary"],
            structured_diff=result["structured_diff"],
            validation_details=validation_details
        )
        
        # Save to Cache
        if len(COMPRESSION_CACHE) >= MAX_CACHE_SIZE:
            first_key = next(iter(COMPRESSION_CACHE))
            COMPRESSION_CACHE.pop(first_key, None)
        COMPRESSION_CACHE[cache_key] = response
        
        # Save to Metrics History
        run_metrics = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "raw_tokens": result["raw_tokens"],
            "compressed_tokens": result["compressed_tokens"],
            "compression_ratio": result["compression_ratio"],
            "accuracy_retained": accuracy_retained,
            "cost_saved_usd": cost_saved_usd,
            "latency_speedup_ratio": latency_speedup,
            "latency_speedup_is_estimated": latency_speedup_is_estimated,
            "provider_used": provider_used or "mock"
        }
        METRICS_HISTORY.append(run_metrics)
        if len(METRICS_HISTORY) > MAX_METRICS_HISTORY:
            METRICS_HISTORY.pop(0)
            
        return response
    except Exception as e:
        logger.error(f"/compress failed internally: {e}")
        traceback.print_exc()
        raise HTTPException(
            status_code=500, 
            detail="Internal Server Error. Please check backend server logs for details."
        )

@app.get("/metrics")
async def get_metrics():
    return {
        "total_runs": len(METRICS_HISTORY),
        "history": METRICS_HISTORY
    }

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
