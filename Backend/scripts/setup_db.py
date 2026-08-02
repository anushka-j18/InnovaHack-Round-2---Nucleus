import os
import psycopg2
from urllib.parse import quote_plus

# Supabase Postgres connection string provided by user
# postgresql://postgres:innovahack@win@db.xkrsyndarznwnocnrvhc.supabase.co:5432/postgres
# URL-encode the password because of the @ symbol
password = quote_plus("innovahack@win")
DB_URL = f"postgresql://postgres:{password}@db.xkrsyndarznwnocnrvhc.supabase.co:5432/postgres"

def create_tables():
    print(f"Connecting to Postgres via psycopg2...")
    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()

        print("Creating compression_cache table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS compression_cache (
                key TEXT PRIMARY KEY,
                response_json JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("Creating metrics_history table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS metrics_history (
                id SERIAL PRIMARY KEY,
                metrics_json JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("Creating conversation_sessions table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversation_sessions (
                session_id TEXT PRIMARY KEY,
                session_json JSONB,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        print("Creating run_traces table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS run_traces (
                run_id TEXT PRIMARY KEY,
                trace_json JSONB,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
        print("All tables created successfully.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    create_tables()
