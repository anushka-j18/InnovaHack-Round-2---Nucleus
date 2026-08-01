import json
import os
import sys

# Add current directory to path so we can import app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.compressor import compress
from app.validator import validate

def run_verification():
    print("=" * 60)
    print("NUCLEUS BACKEND VERIFICATION PIPELINE")
    print("=" * 60)
    
    # Check PyTorch & CUDA Status
    try:
        import torch
        cuda_available = torch.cuda.is_available()
        print(f"PyTorch Version: {torch.__version__}")
        print(f"CUDA Available:  {cuda_available}")
        if cuda_available:
            print(f"GPU Name:        {torch.cuda.get_device_name(0)}")
        else:
            print("GPU Name:        N/A (Using CPU)")
    except ImportError:
        print("PyTorch Version: Not Installed (Using CPU Fallback)")
        print("CUDA Available:  False")
        print("GPU Name:        N/A (Using CPU)")
    print("-" * 60)
    
    # Load sample codebase
    codebase_path = "sample_data/long_codebase.txt"
    qa_path = "sample_data/qa_pairs.json"
    
    if not os.path.exists(codebase_path) or not os.path.exists(qa_path):
        print("Error: Sample data files missing.")
        return
        
    with open(codebase_path, "r", encoding="utf-8") as f:
        raw_text = f.read()
        
    with open(qa_path, "r", encoding="utf-8") as f:
        qa_pairs = json.load(f)
        
    print(f"Loaded sample codebase ({len(raw_text)} characters)")
    print(f"Loaded {len(qa_pairs)} validation QA pairs")
    print("-" * 60)
    
    # Run Compression
    print("Running context compression...")
    result = compress(raw_text)
    
    # Local check for Mock fallback
    from app.compressor import get_model
    model_instance = get_model()
    if model_instance.__class__.__name__ == "MockModel":
        stage2_provider = "stage1-only"
    else:
        stage2_provider = "groq"
        
    # Cost saving calculation (Reference target model: Claude 3.5 Sonnet at $3.00/1M input tokens)
    tokens_saved = result["raw_tokens"] - result["compressed_tokens"]
    cost_saved_usd = max(0.0, tokens_saved * (3.00 / 1_000_000))
    
    print("\nCompression Results:")
    print(f"Raw Tokens:          {result['raw_tokens']}")
    print(f"Compressed Tokens:   {result['compressed_tokens']}")
    print(f"Compression Ratio:   {result['compression_ratio']}% reduction")
    print(f"Stage 2 Provider:    {stage2_provider}")
    print(f"Cost Saved (Sonnet): ${cost_saved_usd:.6f}")
    print("-" * 60)
    
    # Run Validation
    print("Running QA answer validation...")
    validation_res = validate(raw_text, result["compressed_text"], qa_pairs)
    print(f"\nAccuracy Retained:   {validation_res['accuracy_retained']}%")
    print(f"Validation Provider: {validation_res['providerUsed']}")
    print(f"Latency Speedup:     {validation_res['latency_speedup_ratio']}x")
    print("=" * 60)
    
    # Verify target targets are met
    # Target: Compression ratio > 70% on mock dataset, accuracy > 95%
    if result["compression_ratio"] >= 70.0:
        print("SUCCESS: Target compression ratio (>70%) met!")
    else:
        print("WARNING: Compression ratio below target (70.0%).")
        
    if validation_res["accuracy_retained"] is not None and validation_res["accuracy_retained"] >= 95.0:
        print("SUCCESS: Target accuracy retention (95%+) met!")
    else:
        print("WARNING: Accuracy retention below target (95.0%).")
    print("=" * 60)

if __name__ == "__main__":
    run_verification()
