# Geekycoders – Resume Builder

Resume builder and CV enhancement app (Enhancv-inspired): create resumes, cover letters, track job applications, and check resume vs job description. Uses **Supabase** (PostgreSQL + Storage) and a **Node/Express** backend; **React** frontend.

## Project structure

- **`backend/`** – Node + Express API; Supabase for DB and PDF storage (no MongoDB).
- **`frontend/`** – React (Vite) app: auth, dashboard, resumes, templates, cover letters, job tracker, resume checker.
- **`setup/`** – **How to set up API and Supabase:**
  - **`SETUP.md`** – Step-by-step: Supabase project, SQL schema, Storage bucket, env vars, running the API.
  - **`supabase-schema.sql`** – Run in Supabase **SQL Editor** to create tables and RLS.
  - **`supabase-storage-policies.sql`** – Run in SQL Editor after creating the `resume-pdfs` bucket.

The reference project **`ai-resume-screener-&-enhancer`** is separate and unchanged; ideas from it (e.g. JD vs resume analysis, PDF upload) are used here.

## Quick start

1. Follow **`setup/SETUP.md`** to create a Supabase project, run the SQL files, create the Storage bucket, and set env vars.
2. **Backend:** `cd backend && npm install && cp .env.example .env` (edit `.env` with Supabase keys), then `npm run dev`.
3. **Frontend:** `cd frontend && npm install && cp .env.example .env` (edit with `VITE_SUPABASE_*` and `VITE_API_URL`), then `npm run dev`.
4. Open the app at `http://localhost:5173`, sign up, and use the dashboard.

## Tech stack

- **Database & auth:** Supabase (PostgreSQL, Auth, Storage).
- **Backend:** Express, Supabase JS client (service role for DB + Storage).
- **Frontend:** React, React Router, Supabase (auth), fetch to backend API for resumes/cover letters/job tracker.
