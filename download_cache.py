import os
import httpx

def download_cache():
    print("=" * 60)
    print("NUCLEUS CACHE PRE-DOWNLOAD TOOL")
    print("=" * 60)
    
    # Create cache directory
    cache_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "cache")
    os.makedirs(cache_dir, exist_ok=True)
    print(f"Cache directory: {cache_dir}")
    
    # Download tiktoken cl100k_base BPE file
    tiktoken_url = "https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken"
    tiktoken_dest = os.path.join(cache_dir, "cl100k_base.tiktoken")
    
    if os.path.exists(tiktoken_dest):
        print("-> cl100k_base.tiktoken already cached.")
    else:
        print(f"-> Downloading cl100k_base.tiktoken from {tiktoken_url}...")
        try:
            with httpx.Client(timeout=100.0) as client:
                response = client.get(tiktoken_url)
                response.raise_for_status()
                with open(tiktoken_dest, "wb") as f:
                    f.write(response.content)
            print(f"SUCCESS: Cached BPE file at {tiktoken_dest} ({len(response.content) // 1024} KB)")
        except Exception as e:
            print(f"ERROR: Failed to download tiktoken file: {e}")
            
    # Instruct on embedding pre-download
    print("-" * 60)
    print("Embedding model caching notice:")
    print("SentenceTransformers automatically caches model files to standard cache locations.")
    print("To pre-download the model, run:")
    print("  python -c \"from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')\"")
    print("=" * 60)

if __name__ == "__main__":
    download_cache()
