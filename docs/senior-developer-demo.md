# Senior Developer Live Demonstration Script

Follow this step-by-step checklist to conduct a flawless, professional engineering demonstration of the NEXORA Robotics platform.

---

## 1. Setup & Multi-Surface Demonstration Window

Before starting, prepare three browser windows / surfaces:

1. **Surface A (Desktop Web):** Open the website (`website/index.html` or deployed GitHub Pages URL).
2. **Surface B (Mobile APK / WebView):** Open the installed APK on your Android device (or an Android emulator / responsive mobile viewport).
3. **Surface C (Database Dashboard):** Open your [Supabase Dashboard](https://supabase.com/dashboard) navigating to **Table Editor** ➡️ `profiles`.

---

## 2. Live Demo Sequence (15 Steps)

### Step 1: System Overview & Architecture
- **Say:** *"We built a production-grade full-stack architecture with dual client frontends (desktop web and mobile Android WebView), a shared Node.js Express REST API, and Supabase PostgreSQL with triggers and Row-Level Security."*
- **Action:** Show `docs/architecture.md` diagram and Swagger UI at `/api-docs`.

### Step 2: Automated Tests & Type Safety
- **Say:** *"Before testing manually, our backend has unit and integration tests verifying JWT verification, route protection, and Zod input validation."*
- **Action:** Run `npm run test:backend` in the terminal. Show all Vitest tests passing in under 1 second.

### Step 3: Registration & Database Trigger Verification
- **Action:**
  1. On **Surface A** (Website), click **Sign In** ➡️ **Create Account**.
  2. Register with an email: `pilot.sarah@nexora.io` and password: `Password123!`.
  3. Click **Create Account**.
- **Inspect Surface C (Supabase Dashboard):**
  1. Show `auth.users`: User record was created.
  2. Show `public.profiles`: Point out that a profile row was automatically populated!
  3. **Explain:** *"This was created by our PostgreSQL trigger `on_auth_user_created`, ensuring that profile records are never missing or orphaned."*

### Step 4: Profile Creation & Inspection
- **Action:**
  1. On the website, open **User Profile Dashboard**.
  2. Set:
     - Display Name: `Commander Sarah`
     - Gender: `Female`
     - Hobbies: `Autonomous Drones, Deep Space Robotics`
     - Strengths: `Systems Engineering, Rapid Prototyping`
     - Bio: `Lead robotics pilot stationed at Mars orbital base.`
  3. Click **Save & Sync to Database**.
- **Inspect Surface C:**
  1. Refresh the Supabase `profiles` table. Point out the exact matching fields.
  2. Point out the `updated_at` column: it was generated in UTC by `trigger_set_profiles_updated_at`.

### Step 5: Mobile WebView Synchronization
- **Action:**
  1. Open **Surface B** (Mobile Android app).
  2. Log in with `pilot.sarah@nexora.io`.
  3. Open the Pilot Profile.
- **Result:** Confirm that the display name, avatar, bio, and hobbies are 100% identical to the desktop web interface.

### Step 6: Modifying Data in Mobile App ➡️ Database ➡️ Website
- **Action:**
  1. Inside the Android app, edit the Bio to:
     `"Stationed at Titan Outpost 4. Mobile update verified."`
  2. Click **Save & Sync to Database**.
  3. Notice the green toast and the updated trigger timestamp inside the app.
- **Inspect Surface C (Supabase):**
  1. Point out the bio changed in the PostgreSQL row.
  2. Point out that `updated_at` advanced by several seconds due to the PostgreSQL trigger.
- **Inspect Surface A (Desktop Website):**
  1. Click **Force Sync Now** (or wait for the 15-second background sync).
  2. **Result:** The desktop website immediately updates with `"Stationed at Titan Outpost 4. Mobile update verified."`

### Step 7: Database Trigger Audit Log Inspection
- **Action:** On the website, click **View Trigger Audit Logs**.
- **Explain:** *"Every single UPDATE executed on the `profiles` table automatically triggers `log_profile_changes()`, recording an immutable historical audit record into `profile_audit_logs`."*
- **Result:** Show the audit log entries detailing the exact update timestamp and action.

### Step 8: Security & Unauthorized Access Denial
- **Action:** Open terminal and run a curl request trying to modify profiles without a token:
  ```bash
  curl -X PATCH http://localhost:5000/api/v1/profile/me -H "Content-Type: application/json" -d "{\"display_name\":\"Hacker\"}"
  ```
- **Result:** Show the `401 Unauthorized` response with message:
  `"Unauthorized: Missing or malformed Authorization header with Bearer token"`.
- **Explain:** *"The backend derives user identity strictly from cryptographically verified JWT claims; spoofing user IDs in request bodies or query parameters is impossible."*

---

## 3. Demonstration Troubleshooting Checklist

| Symptom | Cause | Rapid Fix |
|---|---|---|
| "Unable to load NEXORA" on Android app | Device is offline or website URL unreachable | Tap **Try again** button; verify internet connectivity or ensure the web URL is accessible. |
| "Invalid or expired access token" | JWT expired or user signed out | Click **Sign In** and re-enter credentials to acquire a fresh JWT token. |
| Supabase connection fails | Placeholder keys active in config | Click the ⚙️ icon in the header and paste your Supabase Project URL & Anon Key, then click **Save & Reconnect**. |
| Backend API 500 error | Backend server not running locally or Render sleeping | Run `npm run dev:backend` locally, or wait 30 seconds for Render free tier to complete cold start. |
