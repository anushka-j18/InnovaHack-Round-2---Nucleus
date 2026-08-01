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
        latency_speedup_is_estimated = None
        
        if req.qa_pairs:
            qa_list = [pair.model_dump() for pair in req.qa_pairs]
            # Run validate in threadpool (non-blocking)
            validation_res = await run_in_threadpool(validate, req.text, result["compressed_text"], qa_list)
            accuracy_retained = validation_res["accuracy_retained"]
            validation_provider = validation_res["providerUsed"]
            provider_used = validation_res["providerUsed"]
            latency_speedup = validation_res["latency_speedup_ratio"]
            latency_speedup_is_estimated = validation_res["latency_speedup_is_estimated"]
            
        # Cost saving calculation (Reference target model: Claude 3.5 Sonnet at $3.00/1M input tokens)
        tokens_saved = result["raw_tokens"] - result["compressed_tokens"]
        cost_saved_usd = round(max(0.0, tokens_saved * (3.00 / 1_000_000)), 6)
        
        logger.info(
            f"Compression success: raw={result['raw_tokens']} -> comp={result['compressed_tokens']} "
            f"({result['compression_ratio']}% reduction) | cost_saved=${cost_saved_usd:.6f}"
        )
        
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
            latency_speedup_ratio=latency_speedup,
            latency_speedup_is_estimated=latency_speedup_is_estimated
        )
    except Exception as e:
        logger.error(f"/compress failed internally: {e}")
        traceback.print_exc()
        # Secure the error response to prevent raw trace leakage to clients
        raise HTTPException(
            status_code=500, 
            detail="Internal Server Error. Please check backend server logs for details."
        )

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
