import psycopg2
from urllib.parse import quote_plus

password = quote_plus("innovahack@win")
DB_URL = f"postgresql://postgres:{password}@db.xkrsyndarznwnocnrvhc.supabase.co:5432/postgres"

def setup_history():
    print("Connecting to Postgres via psycopg2...")
    try:
        conn = psycopg2.connect(DB_URL)
        conn.autocommit = True
        cursor = conn.cursor()

        print("Creating user_chat_history table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.user_chat_history (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
                original_text TEXT NOT NULL,
                result_json JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
            );
        """)

        print("Setting up Row Level Security (RLS)...")
        cursor.execute("ALTER TABLE public.user_chat_history ENABLE ROW LEVEL SECURITY;")
        
        cursor.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE schemaname = 'public' AND tablename = 'user_chat_history' AND policyname = 'Users can view their own history'
                ) THEN
                    CREATE POLICY "Users can view their own history" 
                    ON public.user_chat_history FOR SELECT 
                    USING ( auth.uid() = user_id );
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE schemaname = 'public' AND tablename = 'user_chat_history' AND policyname = 'Users can insert their own history'
                ) THEN
                    CREATE POLICY "Users can insert their own history" 
                    ON public.user_chat_history FOR INSERT 
                    WITH CHECK ( auth.uid() = user_id );
                END IF;
            END
            $$;
        """)

        print("History table and RLS policies created successfully.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    setup_history()
