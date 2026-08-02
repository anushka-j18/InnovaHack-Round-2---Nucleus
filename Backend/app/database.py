import os
import json
import sqlite3
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger("nucleus.database")

# Resolve DB path
DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "cache")
DB_PATH = os.path.join(DB_DIR, "nucleus.db")

def init_db():
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        
        # 1. compression_cache
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compression_cache (
                key TEXT PRIMARY KEY,
                response_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 2. metrics_history
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS metrics_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                metrics_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 3. conversation_sessions
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversation_sessions (
                session_id TEXT PRIMARY KEY,
                session_json TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # 4. run_traces
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS run_traces (
                run_id TEXT PRIMARY KEY,
                trace_json TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()
        logger.info(f"Database initialized successfully at {DB_PATH}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
    finally:
        conn.close()

# Cache Helpers
def get_cached_response(key: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT response_json FROM compression_cache WHERE key = ?", (key,))
        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
    except Exception as e:
        logger.error(f"Error reading cache: {e}")
    finally:
        conn.close()
    return None

def set_cached_response(key: str, response: Dict[str, Any], max_size: int = 100):
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO compression_cache (key, response_json) VALUES (?, ?)", (key, json.dumps(response)))
        
        # Enforce max size limit
        cursor.execute("SELECT COUNT(*) FROM compression_cache")
        count = cursor.fetchone()[0]
        if count > max_size:
            cursor.execute("""
                DELETE FROM compression_cache WHERE key IN (
                    SELECT key FROM compression_cache ORDER BY created_at ASC LIMIT ?
                )
            """, (count - max_size,))
            
        conn.commit()
    except Exception as e:
        logger.error(f"Error writing cache: {e}")
    finally:
        conn.close()

# Metrics Helpers
def get_metrics_history() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    history = []
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT metrics_json FROM metrics_history ORDER BY id ASC")
        rows = cursor.fetchall()
        for row in rows:
            history.append(json.loads(row[0]))
    except Exception as e:
        logger.error(f"Error reading metrics history: {e}")
    finally:
        conn.close()
    return history

def add_metrics_run(run: Dict[str, Any], max_size: int = 100):
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO metrics_history (metrics_json) VALUES (?)", (json.dumps(run),))
        
        # Enforce max size limit
        cursor.execute("SELECT COUNT(*) FROM metrics_history")
        count = cursor.fetchone()[0]
        if count > max_size:
            cursor.execute("""
                DELETE FROM metrics_history WHERE id IN (
                    SELECT id FROM metrics_history ORDER BY id ASC LIMIT ?
                )
            """, (count - max_size,))
            
        conn.commit()
    except Exception as e:
        logger.error(f"Error writing metrics: {e}")
    finally:
        conn.close()

# Conversation Session Helpers
def get_conversation_session(session_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT session_json FROM conversation_sessions WHERE session_id = ?", (session_id,))
        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
    except Exception as e:
        logger.error(f"Error reading session: {e}")
    finally:
        conn.close()
    return None

def save_conversation_session(session_id: str, session_data: Dict[str, Any], max_size: int = 100):
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO conversation_sessions (session_id, session_json, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """, (session_id, json.dumps(session_data)))
        
        # Enforce max size limit
        cursor.execute("SELECT COUNT(*) FROM conversation_sessions")
        count = cursor.fetchone()[0]
        if count > max_size:
            cursor.execute("""
                DELETE FROM conversation_sessions WHERE session_id IN (
                    SELECT session_id FROM conversation_sessions ORDER BY updated_at ASC LIMIT ?
                )
            """, (count - max_size,))
            
        conn.commit()
    except Exception as e:
        logger.error(f"Error writing session: {e}")
    finally:
        conn.close()

# Run Trace Helpers
def get_run_trace(run_id: str) -> Optional[List[Dict[str, Any]]]:
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT trace_json FROM run_traces WHERE run_id = ?", (run_id,))
        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
    except Exception as e:
        logger.error(f"Error reading trace: {e}")
    finally:
        conn.close()
    return None

def save_run_trace(run_id: str, trace: List[Dict[str, Any]], max_size: int = 100):
    conn = sqlite3.connect(DB_PATH)
    try:
        cursor = conn.cursor()
        cursor.execute("INSERT OR REPLACE INTO run_traces (run_id, trace_json) VALUES (?, ?)", (run_id, json.dumps(trace)))
        
        # Enforce max size limit
        cursor.execute("SELECT COUNT(*) FROM run_traces")
        count = cursor.fetchone()[0]
        if count > max_size:
            cursor.execute("""
                DELETE FROM run_traces WHERE run_id IN (
                    SELECT run_id FROM run_traces ORDER BY created_at ASC LIMIT ?
                )
            """, (count - max_size,))
            
        conn.commit()
    except Exception as e:
        logger.error(f"Error writing trace: {e}")
    finally:
        conn.close()
