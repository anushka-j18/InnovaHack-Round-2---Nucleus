import re
import math
from collections import Counter
from app.config import EMBEDDING_MODEL_NAME, SIMILARITY_THRESHOLD, KEEP_RATIO
from app.ingestion import chunk_text, count_tokens

_model = None

def get_model():
    """
    Lazy initialization of SentenceTransformer to ensure fast startup
    and clean CPU fallback if CUDA is not available/setup is in progress.
    """
    global _model
    if _model is None:
        try:
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            print(f"[Nucleus Backend] Loading embedding model on device: {device}")
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer(EMBEDDING_MODEL_NAME, device=device)
        except Exception as e:
            print(f"[Nucleus Backend] Warning: Failed to load sentence-transformers/torch: {e}")
            # Mock fallback if package is loading/missing during testing or network failure
            class MockModel:
                def encode(self, sentences, **kwargs):
                    import random
                    fake_embs = []
                    for s in sentences:
                        val = sum(ord(c) * (i + 1) for i, c in enumerate(s))
                        random.seed(val)
                        fake_embs.append([random.uniform(-1.0, 1.0) for _ in range(384)])
                    return fake_embs
            _model = MockModel()
    return _model

def dot_product(v1, v2):
    return sum(x * y for x, y in zip(v1, v2))

def magnitude(v):
    return math.sqrt(sum(x * x for x in v))

def cosine_similarity_pure(v1, v2):
    mag1 = magnitude(v1)
    mag2 = magnitude(v2)
    if mag1 == 0 or mag2 == 0:
        return 0.0
    return dot_product(v1, v2) / (mag1 * mag2)

def dedup_chunks(chunks: list[dict], threshold: float = SIMILARITY_THRESHOLD) -> list[dict]:
    """
    Remove semantic redundancy across chunks using cosine similarity of embeddings.
    """
    if not chunks or len(chunks) <= 1:
        return chunks
        
    model = get_model()
    texts = [c["text"] for c in chunks]
    
    # Encode all chunks at once
    embeddings = model.encode(texts)
    
    keep_idx = []
    kept_embeddings = []
    
    for i, emb in enumerate(embeddings):
        if not kept_embeddings:
            keep_idx.append(i)
            kept_embeddings.append(emb)
            continue
            
        sims = [cosine_similarity_pure(emb, kept) for kept in kept_embeddings]
        if max(sims) < threshold:
            keep_idx.append(i)
            kept_embeddings.append(emb)
            
    return [chunks[i] for i in keep_idx]

def compute_pure_tfidf_scores(clean_lines: list[str]) -> dict:
    """
    Pure Python TF-IDF line scorer to remove scikit-learn dependency.
    """
    # Simple word tokenizer
    def tokenize(text):
        return re.findall(r'\b\w{2,}\b', text.lower())
        
    # Clean English stopwords
    stopwords = {
        'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 
        'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 
        'could', 'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 
        'for', 'from', 'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 
        'hes', 'her', 'here', 'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 
        'im', 'ive', 'if', 'in', 'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 
        'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 
        'ourselves', 'out', 'over', 'own', 'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 
        'so', 'some', 'such', 'than', 'that', 'thats', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 
        'there', 'theres', 'these', 'they', 'theyd', 'theyll', 'theyre', 'theyve', 'this', 'those', 'through', 'to', 
        'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we', 'wed', 'well', 'were', 'weve', 'werent', 'what', 
        'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while', 'who', 'whos', 'whom', 'why', 'whys', 'with', 
        'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve', 'your', 'yours', 'yourself', 'yourselves'
    }
    
    # Tokenize all lines
    tokenized_lines = [tokenize(line) for line in clean_lines]
    
    # Document frequency (number of lines containing each word)
    doc_frequency = Counter()
    for tokens in tokenized_lines:
        unique_tokens = set(tokens)
        for token in unique_tokens:
            if token not in stopwords:
                doc_frequency[token] += 1
                
    num_lines = len(clean_lines)
    
    # Compute IDF
    idf = {}
    for word, count in doc_frequency.items():
        # standard smoothing formula
        idf[word] = math.log(1 + num_lines / (1 + count))
        
    line_scores = {}
    for idx, line in enumerate(clean_lines):
        tokens = tokenized_lines[idx]
        filtered_tokens = [t for t in tokens if t not in stopwords]
        
        if not filtered_tokens:
            line_scores[line] = 0.0
            continue
            
        # Term frequency in the line
        tf = Counter(filtered_tokens)
        total_tokens = len(filtered_tokens)
        
        scores = []
        for token in filtered_tokens:
            word_tf = tf[token] / total_tokens
            word_idf = idf.get(token, 0.0)
            scores.append(word_tf * word_idf)
            
        line_scores[line] = sum(scores) / len(scores)
        
    return line_scores

def strip_filler(chunk_text: str, keep_ratio: float = KEEP_RATIO) -> str:
    """
    Strips low-information lines within a chunk using TF-IDF scoring and structural floor protection.
    """
    lines = chunk_text.splitlines()
    if len(lines) <= 3:
        return chunk_text
        
    # Filter empty lines for TF-IDF mapping
    clean_lines = [line.strip() for line in lines if line.strip()]
    if len(clean_lines) < 2:
        return chunk_text
        
    try:
        # Use our pure Python TF-IDF scorer
        line_scores = compute_pure_tfidf_scores(clean_lines)
    except Exception:
        # Fallback to word count if it somehow fails
        line_scores = {line: float(len(line.split())) for line in clean_lines}
        

            
    # Heuristics for structural "floor protection" (protecting code syntax, IDs, numbers, and variables)
    code_pattern = re.compile(
        r'(\bdef\b|\bclass\b|\breturn\b|\bimport\b|\bfrom\b|=|\{|\}|\[|\]|\(|\))'
    )
    numeric_pattern = re.compile(r'\b\d+(\.\d+)?\b')
    named_entity_pattern = re.compile(r'\b[A-Z][a-zA-Z0-9_]+\b')
    comment_pattern = re.compile(r'^\s*(#|//|/\*|\*)')
    
    scored_lines = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            # Keep empty lines unconditionally to preserve code/log block layout
            scored_lines.append((i, line, 999.0))
            continue
            
        base_score = line_scores.get(stripped, 0.0)
        
        # Apply boosts to protect critical details
        boost = 0.0
        if comment_pattern.match(stripped):
            boost -= 1.0  # Penalize comment noise
        else:
            if code_pattern.search(stripped):
                boost += 0.6  # High protection for syntax
            if numeric_pattern.search(stripped):
                boost += 0.4  # High protection for metrics, IDs, ports, timestamps
            if named_entity_pattern.search(stripped):
                boost += 0.2  # Moderate protection for classes/constants/variables
            # Absolute protection for signature lines
            if re.match(r'^\s*(def\s+\w+|class\s+\w+|async\s+def\s+\w+)', stripped):
                boost += 1.5
            
        final_score = base_score + boost
        scored_lines.append((i, line, final_score))
        
    # Sort non-empty lines to drop the lowest scored ones
    non_empty_scored = [item for item in scored_lines if item[1].strip()]
    non_empty_scored.sort(key=lambda x: x[2])
    
    num_to_keep = max(1, int(len(non_empty_scored) * keep_ratio))
    keep_indices = {item[0] for item in non_empty_scored[-num_to_keep:]}
    
    # Floor protection: always keep lines with score >= 0.4 (i.e. contains code syntax or numbers)
    FLOOR_THRESHOLD = 0.4
    for idx, line, score in scored_lines:
        if line.strip() and score >= FLOOR_THRESHOLD:
            keep_indices.add(idx)
            
    # Reconstruct the block preserving relative ordering and spacing
    final_lines = []
    for item in scored_lines:
        idx, line, score = item
        if not line.strip() or idx in keep_indices:
            final_lines.append(line)
            
    return "\n".join(final_lines)

def compress(raw_text: str, similarity_threshold: float = SIMILARITY_THRESHOLD, keep_ratio: float = KEEP_RATIO) -> dict:
    """
    Compress the context using the two-stage process: semantic deduplication followed by token-level trimming.
    """
    if not raw_text.strip():
        return {
            "compressed_text": "",
            "raw_tokens": 0,
            "compressed_tokens": 0,
            "compression_ratio": 0.0
        }
        
    # Stage A: Chunking
    chunks = chunk_text(raw_text)
    
    # Stage B: Deduplication
    deduped_chunks = dedup_chunks(chunks, threshold=similarity_threshold)
    
    # Stage C: Filler Stripping
    trimmed_chunks = []
    for c in deduped_chunks:
        trimmed_text = strip_filler(c["text"], keep_ratio=keep_ratio)
        trimmed_chunks.append({
            "index": c["index"],
            "text": trimmed_text
        })
        
    # Sort by original index to preserve context ordering
    trimmed_chunks.sort(key=lambda x: x["index"])
    
    compressed_text = "\n\n".join([c["text"] for c in trimmed_chunks])
    
    raw_tokens = count_tokens(raw_text)
    compressed_tokens = count_tokens(compressed_text)
    
    # Calculate ratio (percentage reduction)
    if raw_tokens > 0:
        ratio = round((1 - (compressed_tokens / raw_tokens)) * 100, 1)
    else:
        ratio = 0.0
        
    return {
        "compressed_text": compressed_text,
        "raw_tokens": raw_tokens,
        "compressed_tokens": compressed_tokens,
        "compression_ratio": ratio
    }
