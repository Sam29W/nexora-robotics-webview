# NEXORA Robotics — Production Full-Stack Platform

> **A Production-Grade Shared Website, Android Mobile App, Express REST Backend, Supabase PostgreSQL Database, and Authentication System with Real-Time Cross-Client Synchronization.**

---

## 🌟 Executive Summary

NEXORA Robotics is a complete full-stack engineering demonstration developed collaboratively by **V** (Backend, Database, Auth, REST API, Synchronization) and **S** (Frontend Web & React Native Android WebView).

The project demonstrates:
1. **Publicly Accessible Website:** Deployed via GitHub Pages, featuring futuristic robotics branding, responsive layout, Supabase authentication, and pilot profile management.
2. **Android Application (APK):** Built with React Native and Expo, rendering the deployed website inside an optimized WebView with hardware back-navigation and custom mobile user-agent.
3. **Shared Backend REST API:** Node.js, Express, and TypeScript with Zod validation, JWT authentication middleware, and OpenAPI/Swagger documentation.
4. **Persistent Remote Database:** Supabase PostgreSQL with strict foreign keys, Row-Level Security (RLS), and database-level PL/pgSQL triggers.
5. **Database-Level Trigger:** `trigger_set_profiles_updated_at` automatically updates `updated_at` timestamps inside PostgreSQL upon every update.
6. **Trigger-Generated Audit Logs:** `trigger_profile_audit` writes historical state changes into `profile_audit_logs`.
7. **Bi-Directional Synchronization:** Profile changes made on the desktop browser or mobile APK instantly persist to PostgreSQL and reflect across all surfaces.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Frontends["Dual Client Frontends"]
        Web["Desktop / Mobile Web Browser\n(GitHub Pages / Vercel)"]
        APK["Android App (Physical Device / APK)\n(Expo WebView)"]
    end

    subgraph API["Shared Backend Layer"]
        Express["Express REST API (TypeScript)\n(Render.com / Containerized)"]
        AuthMid["JWT Auth Middleware\n(Token Verification)"]
        Zod["Zod Validation Schema"]
    end

    subgraph Data["Persistence & Identity Layer (Supabase)"]
        Auth["Supabase Auth (GoTrue)\n(JWT Tokens, Email, OAuth)"]
        Postgres[("PostgreSQL Remote DB\n(profiles, profile_audit_logs)")]
        Trigger["PostgreSQL Trigger (updated_at)"]
    end

    Web -->|Loads HTML/CSS/JS| APK
    Web -->|1. Sign In / JWT Token| Auth
    APK -->|1. Sign In / JWT Token| Auth
    Web -->|2. PATCH /api/v1/profile/me (Bearer Token)| Express
    APK -->|2. PATCH /api/v1/profile/me (Bearer Token)| Express
    Express --> AuthMid --> Zod --> Postgres
    Postgres -->|Fires BEFORE UPDATE| Trigger
```

---

## 📁 Repository Structure

```text
nexora-robotics/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions automated deployment for website
├── android-app/                    # React Native Expo WebView mobile app
│   ├── src/
│   │   └── app/
│   │       ├── index.tsx           # WebView screen with mobile user-agent & back handler
│   │       └── _layout.tsx         # Splash screen and layout container
│   ├── app.json                    # Expo project configuration
│   └── eas.json                    # EAS build profiles (preview APK & production)
├── backend/                        # Shared Node.js Express TypeScript REST API
│   ├── src/
│   │   ├── config/env.ts           # Zod-validated environment configuration
│   │   ├── controllers/            # Thin HTTP route handlers
│   │   ├── docs/swagger.ts         # OpenAPI 3.0 documentation specification
│   │   ├── lib/supabase.ts         # Server-side Supabase Admin client
│   │   ├── middleware/auth.ts      # JWT Bearer token authentication middleware
│   │   ├── routes/                 # Versioned REST route definitions (/api/v1/)
│   │   ├── services/               # Reusable business logic
│   │   ├── validators/             # Zod input validation schemas
│   │   ├── app.ts                  # Express application setup, Helmet, CORS
│   │   └── server.ts               # HTTP server entrypoint
│   └── tests/
│       └── api.test.ts             # Vitest & Supertest automated test suite
├── docs/                           # Comprehensive technical documentation
│   ├── architecture.md             # Complete system architecture and request flow
│   ├── tech-stack-explanation.md   # Tech choices, trade-offs, and alternatives
│   ├── database-design.md          # Database schema, triggers, RLS, and indexes
│   ├── authentication.md           # Supabase Auth, tokens, and OAuth flow
│   ├── api.md                      # REST API endpoints, schemas, and error responses
│   ├── deployment.md               # Deployment instructions (Supabase, Render, EAS)
│   ├── synchronization.md          # Bidirectional cross-device sync proof
│   ├── integration-with-friend-app.md # S's integration roadmap
│   ├── troubleshooting.md          # Root causes and debugging steps
│   └── senior-developer-demo.md    # 15-step live demonstration script
├── supabase/
│   └── migrations/
│       └── 001_create_profiles_table.sql # Complete PostgreSQL schema, triggers & RLS
├── website/                        # NEXORA Robotics responsive frontend
│   ├── assets/                     # SVG graphics and robot illustrations
│   ├── auth.js                     # Client-side Supabase Auth & Profile client
│   ├── config.js                   # Client environment & connection manager
│   ├── index.html                  # Product catalogue, Auth & Profile modals
│   ├── script.js                   # Client interactions and sync controller
│   └── style.css                   # Cyberpunk/futuristic responsive styles
├── .env.example                    # Environment variable template
├── .gitignore                      # Git ignore rules (secrets protected)
└── package.json                    # Monorepo task runner scripts
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js:** v18.0.0 or later (v24.22+ verified)
- **npm:** v9.0.0 or later

### 2. Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```bash
cp .env.example backend/.env
```
Populate with your Supabase Project URL, Anon Key, and Service Role Key:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=*
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Database Migrations (Supabase)
In your Supabase Dashboard ➡️ **SQL Editor**, run the script located at:
`supabase/migrations/001_create_profiles_table.sql`

### 4. Start the Shared Backend API
```bash
cd backend
npm install
npm test            # Run automated Vitest test suite
npm run dev         # Starts server on http://localhost:5000
```
- Interactive Swagger UI: `http://localhost:5000/api-docs`
- Health check: `http://localhost:5000/api/health`

### 5. Open the Website
Open `website/index.html` in your browser, or serve it using any HTTP server:
```bash
npx serve website
```

### 6. Run the Android Mobile App
```bash
cd android-app
npm install
npx expo start
```
Press `a` to open in Android Emulator or scan QR code with Expo Go.

---

## 🧪 Automated Testing

Run the automated test suite verifying route protection, JWT authentication, and Zod input validation:

```bash
cd backend
npm test
```

Sample output:
```text
✓ tests/api.test.ts (9 tests)
  ✓ Health Check API > GET /api/health should return 200 OK
  ✓ Health Check API > GET / non-existent route should return 404
  ✓ Authentication Middleware > GET /api/v1/profile/me should reject without Authorization header
  ✓ Authentication Middleware > GET /api/v1/profile/me should reject non-Bearer tokens
  ✓ Authentication Middleware > PATCH /api/v1/profile/me should reject unauthenticated updates
  ✓ Zod Input Validation > should validate valid profile update payload
  ✓ Zod Input Validation > should convert comma-separated string hobbies into array
  ✓ Zod Input Validation > should reject invalid gender enumeration
  ✓ Zod Input Validation > should reject empty display name

Test Files  1 passed (1)
Tests  9 passed (9)
```

---

## 📱 Senior Developer Live Demonstration

A complete 15-step script for conducting a live demonstration across the three surfaces (Desktop Browser, Mobile Android WebView, and Supabase Database Dashboard) is documented in:
👉 [`docs/senior-developer-demo.md`](docs/senior-developer-demo.md)

---

## 📄 License
MIT License. Developed by V & S Engineering.
