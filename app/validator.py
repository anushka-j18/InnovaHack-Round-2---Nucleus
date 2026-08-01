from app.llm_client import ask_llm
from app.compressor import get_model, cosine_similarity_pure

def semantic_similarity(text1: str, text2: str) -> float:
    """
    Compute cosine similarity between the embeddings of two texts,
    mapped to a 0-100 range.
    """
    if not text1.strip() or not text2.strip():
        if not text1.strip() and not text2.strip():
            return 100.0
        return 0.0
        
    model = get_model()
    embeddings = model.encode([text1, text2])
    similarity = cosine_similarity_pure(embeddings[0], embeddings[1])
    
    # Map cosine similarity [-1, 1] to [0, 100] range
    return max(0.0, float(similarity)) * 100.0

def validate(raw_text: str, compressed_text: str, qa_pairs: list[dict]) -> dict:
    """
    Compares the QA responses of target LLM on raw context vs compressed context.
    Scores accuracy retention via embedding cosine similarity of the generated answers.
    """
    if not qa_pairs:
        return {"accuracy_retained": None, "providerUsed": None}
        
    scores = []
    providers = []
    print(f"[Validator] Running accuracy validation on {len(qa_pairs)} QA pairs...")
    
    for i, pair in enumerate(qa_pairs):
        question = pair.get("question")
        if not question:
            continue
            
        print(f"[Validator] QA Pair {i+1} - Question: {question[:60]}...")
        
        # Get answers from LLM (unpacking answer text and provider)
        answer_raw, p_raw = ask_llm(raw_text, question)
        answer_compressed, p_comp = ask_llm(compressed_text, question)
        
        print(f"[Validator] -> Raw Answer ({p_raw}): {answer_raw[:80]}...")
        print(f"[Validator] -> Compressed Answer ({p_comp}): {answer_compressed[:80]}...")
        
        # Compute similarity
        similarity = semantic_similarity(answer_raw, answer_compressed)
        scores.append(similarity)
        providers.append(p_comp)
        
        print(f"[Validator] -> Match Score: {similarity:.1f}%")
        
    if not scores:
        return {"accuracy_retained": None, "providerUsed": None}
        
    avg_accuracy = sum(scores) / len(scores)
    # Most common provider used during the run
    provider_used = max(set(providers), key=providers.count) if providers else "mock"
    
    return {
        "accuracy_retained": round(avg_accuracy, 1),
        "providerUsed": provider_used
    }
