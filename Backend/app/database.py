import os
import logging
from typing import Optional, List, Dict, Any
# pyrefly: ignore [missing-import]
from supabase import create_client, Client

logger = logging.getLogger("nucleus.database")

# Initialize Supabase client
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")

supabase: Optional[Client] = None

def init_db():
    global supabase
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.error("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment variables.")
        return
        
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Supabase database client initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {e}")

# Cache Helpers
def get_cached_response(key: str) -> Optional[Dict[str, Any]]:
    if not supabase: return None
    try:
        response = supabase.table("compression_cache").select("response_json").eq("key", key).execute()
        if response.data and len(response.data) > 0:
            return response.data[0].get("response_json")
    except Exception as e:
        logger.error(f"Error reading cache from Supabase: {e}")
    return None

def set_cached_response(key: str, response_json: Dict[str, Any], max_size: int = 100):
    if not supabase: return
    try:
        # Upsert the cache entry
        data = {"key": key, "response_json": response_json}
        supabase.table("compression_cache").upsert(data).execute()
        
        # Enforce max size limit roughly (using a count and delete old rows)
        count_res = supabase.table("compression_cache").select("key", count="exact").execute()
        count = count_res.count if count_res.count is not None else 0
        if count > max_size:
            # Get the oldest keys to delete
            limit = count - max_size
            oldest = supabase.table("compression_cache").select("key").order("created_at", desc=False).limit(limit).execute()
            if oldest.data:
                keys_to_delete = [row["key"] for row in oldest.data]
                supabase.table("compression_cache").delete().in_("key", keys_to_delete).execute()
    except Exception as e:
        logger.error(f"Error writing cache to Supabase: {e}")

# Metrics Helpers
def get_metrics_history() -> List[Dict[str, Any]]:
    if not supabase: return []
    try:
        response = supabase.table("metrics_history").select("metrics_json").order("id", desc=False).execute()
        if response.data:
            return [row["metrics_json"] for row in response.data]
    except Exception as e:
        logger.error(f"Error reading metrics history from Supabase: {e}")
    return []

def add_metrics_run(run: Dict[str, Any], max_size: int = 100):
    if not supabase: return
    try:
        supabase.table("metrics_history").insert({"metrics_json": run}).execute()
        
        count_res = supabase.table("metrics_history").select("id", count="exact").execute()
        count = count_res.count if count_res.count is not None else 0
        if count > max_size:
            limit = count - max_size
            oldest = supabase.table("metrics_history").select("id").order("id", desc=False).limit(limit).execute()
            if oldest.data:
                ids_to_delete = [row["id"] for row in oldest.data]
                supabase.table("metrics_history").delete().in_("id", ids_to_delete).execute()
    except Exception as e:
        logger.error(f"Error writing metrics to Supabase: {e}")

# Conversation Session Helpers
def get_conversation_session(session_id: str) -> Optional[Dict[str, Any]]:
    if not supabase: return None
    try:
        response = supabase.table("conversation_sessions").select("session_json").eq("session_id", session_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0].get("session_json")
    except Exception as e:
        logger.error(f"Error reading session from Supabase: {e}")
    return None

def save_conversation_session(session_id: str, session_data: Dict[str, Any], max_size: int = 100):
    if not supabase: return
    try:
        data = {"session_id": session_id, "session_json": session_data}
        supabase.table("conversation_sessions").upsert(data).execute()
        
        count_res = supabase.table("conversation_sessions").select("session_id", count="exact").execute()
        count = count_res.count if count_res.count is not None else 0
        if count > max_size:
            limit = count - max_size
            oldest = supabase.table("conversation_sessions").select("session_id").order("updated_at", desc=False).limit(limit).execute()
            if oldest.data:
                ids_to_delete = [row["session_id"] for row in oldest.data]
                supabase.table("conversation_sessions").delete().in_("session_id", ids_to_delete).execute()
    except Exception as e:
        logger.error(f"Error writing session to Supabase: {e}")

# Run Trace Helpers
def get_run_trace(run_id: str) -> Optional[List[Dict[str, Any]]]:
    if not supabase: return None
    try:
        response = supabase.table("run_traces").select("trace_json").eq("run_id", run_id).execute()
        if response.data and len(response.data) > 0:
            return response.data[0].get("trace_json")
    except Exception as e:
        logger.error(f"Error reading trace from Supabase: {e}")
    return None

def save_run_trace(run_id: str, trace: List[Dict[str, Any]], max_size: int = 100):
    if not supabase: return
    try:
        data = {"run_id": run_id, "trace_json": trace}
        supabase.table("run_traces").upsert(data).execute()
        
        count_res = supabase.table("run_traces").select("run_id", count="exact").execute()
        count = count_res.count if count_res.count is not None else 0
        if count > max_size:
            limit = count - max_size
            oldest = supabase.table("run_traces").select("run_id").order("created_at", desc=False).limit(limit).execute()
            if oldest.data:
                ids_to_delete = [row["run_id"] for row in oldest.data]
                supabase.table("run_traces").delete().in_("run_id", ids_to_delete).execute()
    except Exception as e:
        logger.error(f"Error writing trace to Supabase: {e}")
