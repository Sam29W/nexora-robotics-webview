# System Architecture and Data Flow

This document outlines the high-level system architecture, component responsibilities, and request lifecycles for the NEXORA Robotics platform.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["Presentation Layer (Dual Client Frontends)"]
        WebBrowser["Desktop / Mobile Web Browser\n(HTML5, CSS3, Modern JS, Supabase Client)"]
        AndroidApp["Android App (Physical Device / APK)\n(React Native + Expo WebView)"]
    end

    subgraph CDN["Edge & Static Hosting"]
        GHPages["GitHub Pages / Vercel Hosting\n(HTTPS, Static Delivery)"]
    end

    subgraph BackendAPI["Application Layer (Shared Backend)"]
        ExpressApp["Node.js / Express REST API (TypeScript)\n(Render.com / Containerized)"]
        AuthMiddleware["JWT Authentication Middleware\n(Bearer Token Verification)"]
        ZodValidator["Zod Schema Validator\n(Input Sanitation & Type Guarantee)"]
        ProfileController["Profile Controller & Service Layer"]
    end

    subgraph DataLayer["Persistence & Identity Layer (Supabase Remote)"]
        SupaAuth["Supabase Auth Service\n(GoTrue, Email, OAuth, Session Tokens)"]
        PostgresDB[("PostgreSQL Remote Database\n(profiles, profile_audit_logs)")]
        DBTrigger["PostgreSQL Database Trigger\n(trigger_set_profiles_updated_at)"]
        AuditTrigger["Audit Log Database Trigger\n(trigger_profile_audit)"]
        SupaStorage["Supabase Object Storage\n(Avatar Buckets)"]
    end

    AndroidApp -->|Loads via HTTPS| GHPages
    WebBrowser -->|Loads via HTTPS| GHPages
    
    WebBrowser -->|1. Authenticate / Refresh Session| SupaAuth
    AndroidApp -->|1. Authenticate / Refresh Session| SupaAuth

    WebBrowser -->|2. PATCH /api/v1/profile/me (Bearer Token)| ExpressApp
    AndroidApp -->|2. PATCH /api/v1/profile/me (Bearer Token)| ExpressApp

    ExpressApp --> AuthMiddleware
    AuthMiddleware -->|Verify JWT Claims| SupaAuth
    AuthMiddleware --> ZodValidator
    ZodValidator --> ProfileController
    ProfileController -->|Execute SQL Update| PostgresDB

    PostgresDB -->|Runs BEFORE UPDATE| DBTrigger
    DBTrigger -->|Calculates UTC Timestamp| PostgresDB
    PostgresDB -->|Runs AFTER UPDATE| AuditTrigger
    AuditTrigger -->|Inserts Audit Record| PostgresDB

    WebBrowser -.->|Direct RLS Query Fallback| PostgresDB
    AndroidApp -.->|Direct RLS Query Fallback| PostgresDB
    WebBrowser -->|Upload Avatar Image| SupaStorage
```

---

## 2. Component Responsibilities

| Component | Technology | Primary Responsibilities |
|---|---|---|
| **Website** | HTML5, CSS3, ES2022, Supabase JS | Presentation, pilot authentication, profile editing, dynamic UI synchronization, responsive layout. |
| **Android App** | Expo, React Native WebView | Native Android container, displays the deployed website over WebView, handles hardware back button, mobile gestures, and secure user-agent. |
| **Backend REST API** | Node.js, Express, TypeScript | Owns business authorization, verifies Supabase JWTs, validates input schemas via Zod, serves OpenAPI documentation. |
| **Authentication** | Supabase Auth (GoTrue) | Managed identity provider: issuing JWT access tokens, handling email/password, OAuth callbacks, password hashes (bcrypt/argon2). |
| **Database** | Supabase PostgreSQL | Single source of truth for persistent data, Row-Level Security (RLS) enforcement, database triggers for automatic timestamps and auditing. |
| **Storage** | Supabase Storage | S3-compatible cloud object storage for user avatars with size and mime-type constraints. |

---

## 3. End-to-End Request Lifecycle

### A. Pilot Profile Update Flow
1. **User Action:** The pilot changes their bio and hobbies in the client (either on the desktop browser or inside the mobile WebView) and clicks **Save Changes**.
2. **Client Validation:** The browser ensures required fields are populated and prepares an HTTP payload:
   ```json
   {
     "display_name": "Commander Sarah",
     "bio": "Lead test pilot for NXR humanoid units.",
     "gender": "female",
     "hobbies": ["Robotics", "Drones", "AI"],
     "strengths": ["Rapid Prototyping", "Kinematics"]
   }
   ```
3. **HTTP Transport:** The frontend sends a `PATCH /api/v1/profile/me` request with `Authorization: Bearer <SUPABASE_JWT_ACCESS_TOKEN>`.
4. **Token Verification:** The backend `requireAuth` middleware intercepts the request, calls `supabaseAdmin.auth.getUser(token)`, and securely extracts the user's UUID (`req.user.id`). User ID is never trusted from query or body.
5. **Schema Validation:** The controller runs `updateProfileSchema.safeParse(req.body)` using Zod. If invalid (e.g. invalid gender enum), a `400 Bad Request` is returned with detailed field errors.
6. **Database Persistence:** The `ProfileService` executes an `UPDATE public.profiles` query for the authenticated UUID.
7. **Database Trigger Execution:**
   - PostgreSQL engine fires `trigger_set_profiles_updated_at` **BEFORE UPDATE**, resetting `updated_at = timezone('utc'::text, now())`.
   - PostgreSQL engine fires `trigger_profile_audit` **AFTER UPDATE**, logging old and new row states into `profile_audit_logs`.
8. **HTTP Response:** The backend returns `200 OK` with the freshly saved profile and updated timestamp.
9. **Cross-Device Synchronization:**
   - The originating client updates its UI and displays the success toast.
   - When the other client (e.g., the mobile app) is refreshed or polls the API, it retrieves the identical record from PostgreSQL.
