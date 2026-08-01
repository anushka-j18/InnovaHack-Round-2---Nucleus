import re
from typing import List, Dict

def count_tokens(text: str, encoding_name: str = "cl100k_base") -> int:
    """
    Count the number of tokens in the given text using tiktoken.
    Falls back to local file load or character-count estimation if offline/not installed.
    """
    if not text:
        return 0
    try:
        import tiktoken
        import os
        try:
            # Locate local cache file if pre-downloaded
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            cache_path = os.path.join(base_dir, "cache", "cl100k_base.tiktoken")
            
            if os.path.exists(cache_path):
                # Instantiate encoding purely offline using BPE file
                mergeable_ranks = tiktoken.load.load_tiktoken_bpe(cache_path)
                encoding = tiktoken.Encoding(
                    name="cl100k_base",
                    pat_str=r"""(?i:'s|'t|'re|'ve|'m|'ll|'d)|[^\r\n\p{L}\p{N}]?\p{L}+|\p{N}{1,3}| ?[^\s\p{L}\p{N}]+[\r\n]*|\s*[\r\n]+|\s+(?!\S)|\s+""",
                    mergeable_ranks=mergeable_ranks,
                    special_tokens={
                        "<|endoftext|>": 100257,
                        "<|fim_prefix|>": 100258,
                        "<|fim_middle|>": 100259,
                        "<|fim_suffix|>": 100260,
                        "<|endofprompt|>": 100276
                    }
                )
            else:
                try:
                    encoding = tiktoken.get_encoding(encoding_name)
                except ValueError:
                    encoding = tiktoken.get_encoding("cl100k_base")
            return len(encoding.encode(text))
        except Exception as e:
            # Handle offline socket/SSL/blob-access timeout issues
            print(f"[Ingestion] Warning: tiktoken online fetch failed ({e}). Using offline heuristic.")
            return max(1, len(text) // 4)
    except Exception:
        # Fallback if tiktoken package is not installed at all
        return max(1, len(text) // 4)

def detect_type(text: str) -> str:
    """
    Detect the content type (code, log, or prose) of the text.
    """
    lines = text.splitlines()
    if not lines:
        return "prose"
    
    # Log pattern: Starts with timestamp (e.g., 2026-08-01, 10:58:24, [INFO])
    log_pattern = re.compile(
        r'^(\[?\d{4}[-/]\d{2}[-/]\d{2}.*?\]?|'
        r'\[?\d{2}:\d{2}:\d{2}.*?\]?|'
        r'\[?(INFO|WARN|WARNING|ERROR|DEBUG|TRACE|FATAL)\]?\b\s*[:|]?)',
        re.IGNORECASE
    )
    log_lines = sum(1 for line in lines if log_pattern.match(line.strip()))
    if len(lines) >= 2 and (log_lines / len(lines)) > 0.25:
        return "log"
    
    # Code pattern: Common signatures for functions/classes/imports
    code_keywords = [
        r'^\s*def\s+\w+\b',          # python function
        r'^\s*class\s+\w+\b',        # python/js class
        r'^\s*import\s+.*from',      # python/js import
        r'^\s*from\s+\w+\s+import',   # python import
        r'^\s*function\s+\w*\(',     # javascript function
        r'^\s*const\s+\w+\s*=\s*',    # js variable/arrow function
        r'^\s*(public|private|protected)\s+(class|void|int|string|final|static)\b', # java/c# signatures
        r'^\s*#include\s+<',         # c/c++ include
    ]
    code_pattern = re.compile('|'.join(code_keywords))
    code_lines = sum(1 for line in lines if code_pattern.match(line))
    if code_lines > 2 or (len(lines) > 0 and (code_lines / len(lines)) > 0.05):
        return "code"
    
    return "prose"

def chunk_text(text: str) -> List[Dict]:
    """
    Split input text into semantically coherent chunks and keep track of original positions.
    """
    if not text:
        return [{"index": 0, "text": ""}]

    content_type = detect_type(text)
    lines = text.splitlines()
    chunks = []
    
    if content_type == "log":
        # Group log lines into chunks of approx 800 chars (maintaining log entry boundaries)
        current_chunk = []
        current_size = 0
        max_chunk_size = 800
        
        # Match potential new log line patterns
        log_start_pattern = re.compile(
            r'^(\[?\d{4}[-/]\d{2}[-/]\d{2}|'
            r'\[?\d{2}:\d{2}:\d{2}|'
            r'\[?(INFO|WARN|WARNING|ERROR|DEBUG|TRACE|FATAL)\]?\b)',
            re.IGNORECASE
        )
        
        for line in lines:
            # If we see a log start indicator and current chunk is big enough, slice it
            if log_start_pattern.match(line.strip()) and current_size > max_chunk_size:
                chunks.append("\n".join(current_chunk))
                current_chunk = []
                current_size = 0
            current_chunk.append(line)
            current_size += len(line) + 1
            
        if current_chunk:
            chunks.append("\n".join(current_chunk))
            
    elif content_type == "code":
        # Chunk on function/class boundaries
        boundary_pattern = re.compile(
            r'^\s*(def\s+\w+|class\s+\w+|function\s+\w*|export\s+(const|let|var|function|class)|async\s+function|public\s+class|private\s+class|public\s+static|struct\s+\w+|enum\s+\w+)'
        )
        
        current_chunk = []
        current_size = 0
        max_chunk_size = 800  # bytes/chars
        
        for line in lines:
            if boundary_pattern.match(line) and current_size > max_chunk_size:
                chunks.append("\n".join(current_chunk))
                current_chunk = []
                current_size = 0
            current_chunk.append(line)
            current_size += len(line) + 1
            
        if current_chunk:
            chunks.append("\n".join(current_chunk))
            
    else:  # Prose/text
        # Chunk on paragraph breaks (\n\n)
        paragraphs = text.split("\n\n")
        current_chunk = []
        current_size = 0
        max_chunk_size = 2000
        
        for para in paragraphs:
            para_strip = para.strip()
            if not para_strip:
                continue
            if current_size + len(para_strip) > max_chunk_size and current_chunk:
                chunks.append("\n\n".join(current_chunk))
                current_chunk = []
                current_size = 0
            current_chunk.append(para_strip)
            current_size += len(para_strip) + 2
            
        if current_chunk:
            chunks.append("\n\n".join(current_chunk))
            
    # Fallback if no chunks were constructed (e.g. empty/short input)
    if not chunks:
        chunks = [text]
        
    return [{"index": i, "text": chunk} for i, chunk in enumerate(chunks)]
