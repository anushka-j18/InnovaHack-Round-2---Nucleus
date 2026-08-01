# Nucleus Backend - Context Compression Engine

Nucleus is an ultra-low-resource context compression engine designed to shrink LLM prompts by over 70% while maintaining >95% reasoning accuracy, enabling rapid, cost-effective inference on large codebases, customer logs, and prose contexts with persistent Supabase PostgreSQL analytics storage.

---

## 📋 Prerequisites
Ensure you have Python 3.10+ installed on your machine.

---

## ⚙️ 1. Environment & Supabase Setup

### 1. Create Supabase Project
1. Log into [Supabase Console](https://supabase.com/dashboard) and create a new project.
2. Under **Project Settings -> API**, obtain your **`SUPABASE_URL`** and **`SUPABASE_KEY`** (anon key or service_role key).
3. Under **Project Settings -> Database -> Connection string**, select **URI (Transaction Pooler or Direct)** and copy your PostgreSQL connection string:
   ```env
   postgresql://postgres.[YOUR-PROJECT-ID]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### 2. Configure Environment Variables
Copy `.env.template` to `.env` and fill in your keys:
```bash
cp .env.template .env
```
Example `.env`:
```env
GROQ_API_KEY=your_groq_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_DB_URL=postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres
```

### 3. Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

---

## 🗄️ 2. Database Migrations (Alembic)

Run Alembic migrations to create all database tables (`compression_jobs`, `evaluation_results`, `history_records`) and indexes in Supabase PostgreSQL:

```bash
# Apply migrations to your Supabase PostgreSQL database
alembic upgrade head
```

---

## 💾 3. Offline Mode Cache Download (Optional)

To enable 100% offline local token counting without fetching tiktoken files from Azure at request time:

```bash
python download_cache.py
```

---

## 🧪 4. Running Unit Tests

Execute the full test suite (including pipeline compression and database persistence/analytics):

```bash
python -m pytest tests/ -v
```

Expected output:
```
====================== 19 passed in 10.40s ======================
```

---

## 🌐 5. Running the Application

To start both the **FastAPI Backend (Port 8000)** and **Next.js Frontend (Port 3000)** concurrently:

```bash
npm run dev
```

Or start the backend independently:
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 📡 6. Database & Compression API Endpoints

- **`POST /compress`**: Compress input context & auto-persist run details to Supabase.
- **`GET /history`**: Retrieve recent compression jobs from Supabase (newest first).
- **`GET /history/{id}`**: Retrieve full details of a specific job.
- **`DELETE /history/{id}`**: Delete a single history record.
- **`DELETE /history`**: Clear all history records.
- **`GET /analytics`**: Retrieve aggregated metrics (average ratio, cost saved, latency, accuracy, provider usage stats).
