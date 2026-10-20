# Deployment and Production Operations Guide

This guide details how to deploy the entire NEXORA Robotics system across Supabase, Render, GitHub Pages, and EAS Build for Android APK generation.

---

## 1. Remote Database & Auth Setup (Supabase)

1. **Create Project:** Navigate to [supabase.com](https://supabase.com) and create a new project named `nexora-robotics`.
2. **Execute SQL Migration:**
   - Go to the **SQL Editor** tab in your Supabase Dashboard.
   - Open `supabase/migrations/001_create_profiles_table.sql`.
   - Paste the SQL script and click **Run**.
   - This creates:
     - `public.profiles` table with RLS.
     - `public.profile_audit_logs` table.
     - `trigger_set_profiles_updated_at` trigger.
     - `on_auth_user_created` trigger.
     - `avatars` storage bucket.
3. **Retrieve Project Credentials:**
   - In Supabase Dashboard, go to **Project Settings** ➡️ **API**.
   - Copy:
     - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
     - **anon / public key**
     - **service_role key** (keep secret; for backend only!)

---

## 2. Backend REST API Deployment (Render.com)

1. **Sign Up / Log In:** Go to [render.com](https://render.com).
2. **New Web Service:**
   - Connect your GitHub repository.
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
3. **Environment Variables:**
   Add the following in Render's **Environment** tab:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default assigned by Render)
   - `CORS_ORIGIN` = `*`
   - `SUPABASE_URL` = `https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY` = `your-anon-key`
   - `SUPABASE_SERVICE_ROLE_KEY` = `your-service-role-key`
4. **Deploy:** Click **Deploy Web Service**.
   - Once deployed, copy your public HTTPS URL (e.g. `https://nexora-backend.onrender.com`).
   - Test health check: `https://nexora-backend.onrender.com/api/health`.

---

## 3. Website Deployment (GitHub Pages)

The repository already includes `.github/workflows/deploy.yml`:
1. Push your code to the `main` branch on GitHub.
2. Go to **Settings** ➡️ **Pages** in your GitHub repository:
   - Source: **GitHub Actions**.
3. The workflow runs automatically whenever files in `website/**` are updated.
4. Your website will be live at:
   `https://<your-github-username>.github.io/<repo-name>/`

---

## 4. Android APK Generation & Distribution (Expo EAS)

S has configured Expo with EAS build. To generate a standalone Android APK:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```
2. **Login to Expo:**
   ```bash
   eas login
   ```
3. **Build Android APK (Preview Profile):**
   ```bash
   cd android-app
   eas build --platform android --profile preview
   ```
   - EAS will build the APK on Expo's cloud servers.
   - Upon completion, EAS provides a direct HTTPS download link for the `.apk` file.
4. **Distribute on GitHub Releases:**
   - Create a new release in your GitHub repository (e.g., `v1.0.0-preview`).
   - Upload the generated `.apk` file to the release assets.
   - Anyone can download and install the APK on an Android device without running any local servers!

---

## 5. Free-Tier Operational Limitations & Best Practices

| Service | Free-Tier Constraints | Senior Developer Mitigation Plan |
|---|---|---|
| **Render.com (Free Web Service)** | Spins down after 15 minutes of inactivity. Initial wake-up request takes ~45 seconds ("cold start"). | In client code, display a polite "Connecting to backend..." indicator during initial load, or use a health-check ping. |
| **Supabase (Free Tier)** | Database automatically pauses after 7 days of inactivity. Up to 500MB storage. | Log in once per week or resume via dashboard; production upgrade to Pro ($25/mo) guarantees zero pauses. |
| **GitHub Actions / Pages** | 2,000 free runner minutes per month. Static hosting only. | Perfectly suited for frontend HTML/CSS/JS delivery with global CDN edge caching. |
| **Expo EAS Build** | 30 free Android builds per month on standard queue. | Use local development or queue off-peak; the preview APK build produces an installable file. |
