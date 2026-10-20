# Troubleshooting & Practical Debugging Guide

This guide covers common development, deployment, authentication, and mobile WebView errors, with root cause analysis and immediate fixes.

---

## 1. Network & CORS Errors

### Error: `Access to fetch at ... from origin ... has been blocked by CORS policy`
- **Root Cause:** The backend does not permit the origin sending the request, or preflight `OPTIONS` request failed.
- **Fix:**
  1. In `backend/.env`, update `CORS_ORIGIN`:
     ```env
     CORS_ORIGIN=*
     ```
  2. Verify that `cors` middleware in `backend/src/app.ts` includes `Authorization` and `Content-Type` in `allowedHeaders`:
     ```typescript
     allowedHeaders: ['Content-Type', 'Authorization']
     ```

### Error: Mobile WebView Cannot Connect to `http://localhost:5000`
- **Root Cause:** In Android devices and emulators, `localhost` refers to the Android device itself, **not** your development laptop.
- **Fix:**
  - For Android Emulator: Use `http://10.0.2.2:5000/api`.
  - For Physical Device: Connect both laptop and phone to the same Wi-Fi and use your laptop's local LAN IP (e.g. `http://192.168.1.50:5000/api`).
  - For Production: Deploy backend to a public HTTPS URL (e.g. Render).

---

## 2. Supabase & Database Errors

### Error: `new row violates row-level security policy for table "profiles"`
- **Root Cause:** The SQL table has RLS enabled, but the active request is unauthenticated or the `auth.uid()` does not match `id`.
- **Fix:**
  1. Verify the client includes the JWT access token in the request.
  2. Ensure your policy uses `WITH CHECK (auth.uid() = id)` for INSERT and `USING (auth.uid() = id)` for UPDATE.
  3. If testing in backend via `supabaseAdmin`, ensure the service role key is used so it bypasses RLS for server-side operations.

### Error: `column "updated_at" does not update automatically`
- **Root Cause:** The PostgreSQL trigger is either missing or attached with `AFTER UPDATE` instead of `BEFORE UPDATE`.
- **Fix:** Run the trigger script from `supabase/migrations/001_create_profiles_table.sql`:
  ```sql
  CREATE OR REPLACE FUNCTION public.set_updated_at_timestamp()
  RETURNS TRIGGER AS $$
  BEGIN
      NEW.updated_at = timezone('utc'::text, now());
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER trigger_set_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at_timestamp();
  ```

---

## 3. Mobile WebView Errors

### Error: `net::ERR_CLEARTEXT_NOT_PERMITTED`
- **Root Cause:** Starting with Android 9 (API level 28), cleartext HTTP traffic is disabled by default for security.
- **Fix:**
  - Use HTTPS for all deployed web URLs.
  - For local development with HTTP, add `"usesCleartextTraffic": true` in `android-app/app.json` under `android`.

### Error: `403 disallowed_useragent` during Google OAuth
- **Root Cause:** Google blocks OAuth inside standard embedded WebViews.
- **Fix:** Set a mobile browser user-agent in `<WebView userAgent={WEBVIEW_USER_AGENT} />`. We have already configured this in `android-app/src/app/index.tsx`.

---

## 4. End-to-End Diagnostic Commands

```bash
# 1. Verify Node.js backend starts and passes tests
cd backend
npm test
npm run build

# 2. Check backend health endpoint
curl http://localhost:5000/api/health

# 3. Check unauthorized rejection
curl -X GET http://localhost:5000/api/v1/profile/me
# Expected output: {"success":false,"error":"Unauthorized..."}
```
