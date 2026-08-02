import os
import psycopg2
from urllib.parse import quote_plus

password = quote_plus("innovahack@win")
DB_URL = f"postgresql://postgres:{password}@db.xkrsyndarznwnocnrvhc.supabase.co:5432/postgres"

def setup_profiles():
    print("Connecting to Postgres via psycopg2...")
    try:
        conn = psycopg2.connect(DB_URL)
        # Autocommit is required for some statements, though not strictly needed here, it's safer.
        conn.autocommit = True
        cursor = conn.cursor()

        print("Creating profiles table...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS public.profiles (
                id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                full_name TEXT,
                avatar_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
            );
        """)

        print("Setting up Row Level Security (RLS)...")
        cursor.execute("ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;")
        
        # We use DO block to avoid errors if policies already exist
        cursor.execute("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone.'
                ) THEN
                    CREATE POLICY "Public profiles are viewable by everyone." 
                    ON public.profiles FOR SELECT 
                    USING ( true );
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert their own profile.'
                ) THEN
                    CREATE POLICY "Users can insert their own profile." 
                    ON public.profiles FOR INSERT 
                    WITH CHECK ( auth.uid() = id );
                END IF;

                IF NOT EXISTS (
                    SELECT 1 FROM pg_policies 
                    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile.'
                ) THEN
                    CREATE POLICY "Users can update own profile." 
                    ON public.profiles FOR UPDATE 
                    USING ( auth.uid() = id );
                END IF;
            END
            $$;
        """)

        print("Creating handle_new_user function...")
        cursor.execute("""
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS trigger AS $$
            BEGIN
              INSERT INTO public.profiles (id, email, full_name, avatar_url)
              VALUES (
                new.id, 
                new.email, 
                new.raw_user_meta_data->>'full_name', 
                new.raw_user_meta_data->>'avatar_url'
              );
              RETURN new;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        """)

        print("Creating trigger on auth.users...")
        # Drop trigger if exists to prevent duplicates, then recreate
        cursor.execute("""
            DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
            CREATE TRIGGER on_auth_user_created
              AFTER INSERT ON auth.users
              FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
        """)

        print("Profiles table, policies, and auth trigger created successfully.")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if 'conn' in locals() and conn:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    setup_profiles()
