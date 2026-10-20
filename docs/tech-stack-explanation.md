# Technology Stack Selection, Alternatives, and Trade-offs

This document provides a comprehensive technical breakdown of every technology chosen for the NEXORA Robotics platform. It is designed to help a junior engineer articulate decisions and trade-offs confidently in front of a senior architect.

---

## 1. Summary Matrix

| Layer | Selected Tech | Key Alternatives Considered | Why This Stack Won | Trade-offs & Limitations |
|---|---|---|---|---|
| **Mobile Client** | React Native, Expo, WebView | Flutter, Native Kotlin/Swift, Pure PWA | Allows S to wrap the deployed web application into an installable APK with EAS build; zero duplicate code. | WebView experiences can feel slightly less native than 60fps native controls if complex gestures are needed. |
| **Website Frontend** | Modern HTML5/CSS3/ES2022 + Supabase JS | React/Vite SPA, Next.js SSR | Fast, zero build-step overhead, deploys cleanly to GitHub Pages, reliable inside WebView. | For massive web applications with 100+ screens, a framework like React/Next.js provides better state routing. |
| **Backend REST API** | Node.js, Express, TypeScript | Python FastAPI, Go Fiber, NestJS | Unified TypeScript language across stack; rich ecosystem, lightweight, rapid development. | Single-threaded event loop requires non-blocking async architecture; compute-heavy tasks need worker threads. |
| **Data Validation** | Zod | Joi, Yup, express-validator | First-class TypeScript type inference (`z.infer`), composable schemas, zero external runtime dependencies. | Slight learning curve for complex nested transformations. |
| **Database & Persistence** | Supabase (PostgreSQL 15+) | Firebase Firestore, MongoDB, AWS RDS | Relational integrity, ACID compliance, SQL triggers, Row-Level Security, built-in REST & Auth. | Free tier instances pause after 7 days of inactivity; manual resume required if paused. |
| **Authentication** | Supabase Auth (GoTrue) | Auth0, Firebase Auth, Custom JWT | Pre-integrated with PostgreSQL `auth.users`, JWT verification, free tier supports 50,000 MAU. | Multi-factor and phone SMS require external SMS providers (Twilio/MessageBird). |
| **API Documentation** | OpenAPI 3.0 / Swagger UI | Postman collections, ReadMe.com | Industry-standard machine-readable spec; interactive UI directly at `/api-docs`. | Requires keeping code routes and documentation specs in sync. |
| **Automated Testing** | Vitest + Supertest | Jest, Mocha, Playwright | Vitest is 5-10x faster than Jest with ESM support; Supertest provides real HTTP integration tests. | Tests require mock credentials or isolated database when testing network calls. |

---

## 2. In-Depth Technical Justifications

### A. Why Supabase PostgreSQL instead of Firebase Firestore?
- **Relational vs NoSQL:** Profile data has strict relationships to identity (`auth.users.id`). Relational schemas with foreign keys and cascade rules prevent orphaned data.
- **ACID Transactions and Triggers:** Firestore lacks native relational triggers that execute directly within the database engine before/after writes. PostgreSQL functions in PL/pgSQL give 100% server-enforced guarantees.
- **Row-Level Security (RLS):** Policies are written in SQL standards, not a proprietary markup language.

### B. Why Node.js & Express instead of direct frontend-to-database access?
- **Security Barrier:** The frontend client can be inspected, reverse-engineered, or manipulated. The Express backend acts as the authoritative gatekeeper.
- **Business Logic Ownership:** If pricing rules, rate limiting, token revocation, or third-party webhooks need to run, they belong on the server, not distributed to client devices.
- **Auditing & Monitoring:** Centralized logging of every request without exposing internal database structures.

### C. Why React Native WebView for S's Mobile Application?
- **Dual-Surface Velocity:** A single responsive web application serves both desktop browser users and Android mobile users without rewriting screens.
- **Instant Updates:** Bug fixes pushed to the web are immediately visible inside the mobile app on next open, bypassing app store review cycles.
