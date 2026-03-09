# Geekycoders Resume Builder – Setup Guide

This guide explains how to set up **Supabase** (PostgreSQL + Storage) and the **Backend API** for the resume builder. The frontend uses Supabase for auth and can call this API for resume CRUD and PDF storage.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Choose organization, project name, database password (save it), and region.
4. Wait for the project to be ready.

---

## 2. Run the SQL Schema (Supabase SQL Editor)

1. In the Supabase Dashboard, open **SQL Editor**.
2. Click **New query**.
3. Open the file `setup/supabase-schema.sql` from this repo and copy its **entire** content.
4. Paste into the SQL Editor and click **Run** (or Ctrl+Enter).
5. Ensure there are no errors. This creates:
   - `profiles` (linked to `auth.users`)
   - `templates`
   - `resumes`
   - `cover_letters`
   - `job_applications`
   - `resume_analyses`
   - RLS policies and triggers

---

## 3. Create the PDF Storage Bucket (Supabase Storage)

1. In Supabase Dashboard go to **Storage**.
2. Click **New bucket**.
3. Set:
   - **Name:** `resume-pdfs`
   - **Public bucket:** Off (private; access via signed URLs or RLS).
4. Click **Create bucket**.
5. Open the bucket and go to **Policies** (or Storage → Policies).
6. Run the storage policies in **SQL Editor**: open `setup/supabase-storage-policies.sql` from this repo, copy its content into a new query, and run it. This allows authenticated users to upload/read/update/delete only their own files (path starts with their `user_id`).

---

## 4. Get Supabase API Keys

1. In Supabase Dashboard go to **Project Settings** (gear icon) → **API**.
2. Note:
   - **Project URL** → use as `SUPABASE_URL`
   - **anon public** key → use as `SUPABASE_ANON_KEY` (frontend + backend auth checks)
   - **service_role** key → use as `SUPABASE_SERVICE_ROLE_KEY` (backend only; never expose in frontend)

---

## 5. Backend API Setup

1. Go to the `backend` folder:
   ```bash
   cd backend
   ```
2. Copy env example and set variables:
   ```bash
   cp .env.example .env
   ```
3. Edit `.env` and set:
   - `SUPABASE_URL` = Project URL from step 4
   - `SUPABASE_ANON_KEY` = anon key from step 4
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key from step 4
   - Optionally: `PORT`, `CORS_ORIGIN` (e.g. `http://localhost:5173` for Vite)
4. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```
5. API base URL: `http://localhost:5000` (or your `PORT`). Example health check: `GET http://localhost:5000/health`.

---

## 6. API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/v1/auth/config` | No | Auth info message |
| GET | `/api/v1/templates` | No | List resume templates |
| GET | `/api/v1/templates/:id` | No | Get one template |
| GET | `/api/v1/users/profile` | Bearer | Get profile |
| PATCH | `/api/v1/users/profile` | Bearer | Update profile |
| GET | `/api/v1/resumes` | Bearer | List user resumes |
| GET | `/api/v1/resumes/:id` | Bearer | Get one resume |
| POST | `/api/v1/resumes` | Bearer | Create resume |
| PATCH | `/api/v1/resumes/:id` | Bearer | Update resume |
| DELETE | `/api/v1/resumes/:id` | Bearer | Delete resume |
| GET | `/api/v1/resumes/:id/pdf-url` | Bearer | Get signed PDF URL |
| POST | `/api/v1/resumes/upload-pdf` | Bearer | Upload PDF (form: `file`, `resumeId`) |
| GET | `/api/v1/cover-letters` | Bearer | List cover letters |
| POST | `/api/v1/cover-letters` | Bearer | Create cover letter |
| ... | ... | ... | Same pattern for PATCH/DELETE |
| GET | `/api/v1/job-tracker` | Bearer | List job applications |
| POST | `/api/v1/job-tracker` | Bearer | Create job application |
| ... | ... | ... | Same pattern for PATCH/DELETE |

**Auth:** Use Supabase Auth on the frontend (sign up / sign in). Send the Supabase session access token in the header:  
`Authorization: Bearer <access_token>`.

---

## 7. Frontend Environment

In the **frontend** `.env` (e.g. Vite):

- `VITE_SUPABASE_URL` = same Project URL
- `VITE_SUPABASE_ANON_KEY` = anon key only (never service_role)
- `VITE_API_URL` = `http://localhost:5000` (or your backend URL)

---

## 8. Troubleshooting

- **401 on protected routes:** Ensure the frontend sends `Authorization: Bearer <supabase_access_token>` and the token is not expired.
- **Storage upload fails:** Check bucket name is `resume-pdfs` and storage policies allow the authenticated user to write under their `user_id` folder.
- **RLS errors:** Ensure the SQL schema was run completely and RLS policies exist for the tables you use.

For more on Supabase: [Supabase Docs](https://supabase.com/docs).
