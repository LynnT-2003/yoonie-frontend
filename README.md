# Yoonie — Unified Hospitality Operating System

> **Tagline:** *Every booking, closed. Every morning, automated.*  
> **Ecosystem:** 4 Decoupled Repositories (`yoonie-landing-page`, `yoonie-frontend`, `yoonie-backend`, `yoonie-mobile-staff`) spanning Edge Ingress, Multi-Tenant Web, Autonomous Backend, and Frontline Mobile.

---

## 1. Master System Architecture

```
========================================================================================================================
                      YOONIE UNIFIED HOSPITALITY OPERATING SYSTEM — MASTER ARCHITECTURE
========================================================================================================================

                                                 [ INTERNET / CLIENTS ]
                                                            │
                     ┌──────────────────────────────────────┼──────────────────────────────────────┐
                     │                                      │                                      │
                     ▼                                      ▼                                      ▼
       [ Guest Direct Web / Booking ]             [ Hotel Operators / Staff ]             [ Public Web Traffic ]
            sedona.yoonie.app                         ops.yoonie.app                             yoonie.app
          (*.yoonie.app Tenants)                 (Central Operations Hub)                  (Commercial Marketing)
                     │                                      │                                      │
                     └──────────────────────────────────────┼──────────────────────────────────────┘
                                                            │
                                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. EDGE NETWORK & DNS INGRESS LAYER (CLOUDFLARE)                                                                     │
│                                                                                                                      │
│  • Anycast DNS:          A Record: yoonie.app ──> 76.76.21.21 (Vercel Anycast)                                       │
│                          Wildcard CNAME: *.yoonie.app ──> cname.vercel-dns.com                                       │
│                          API CNAME: api.yoonie.app ──> cname.vercel-dns.com                                          │
│  • Edge Security:        WAF Rules, Managed DDoS Mitigation, Bot Management, Rate Limiting (120 req/min/IP)          │
│  • Edge SSL / TLS:       TLS 1.3 Termination, Automated Wildcard Certificate (*.yoonie.app, *.yoonie.si)            │
└───────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
                                                            │
                                                            ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. VERCEL HOSTING & EDGE ROUTING LAYER                                                                               │
│                                                                                                                      │
│  • Ingress Gateway:      Vercel Edge Network Wildcard Resolution (*.yoonie.app)                                      │
│  • Edge Proxy (proxy.ts):Inspects `Host` Header ──> Resolves Subdomain:                                              │
│                          ├─ Host === "ops.yoonie.app" ──────────> Rewrite to /ops/rooms or /ops/dispatch              │
│                          ├─ Host === "[tenant].yoonie.app" ─────> Pass-through to / with Tenant Context Injected     │
│                          ├─ Host === "yoonie.app" ──────────────> Pass-through to Commercial Landing Engine           │
│                          └─ Path === "/api/*" ──────────────────> Reverse Proxy to Backend API (Same-Origin / Zero CORS)│
└────────────┬──────────────────────────────────────────────┬──────────────────────────────────────────────────────────┘
             │                                              │
             ▼                                              ▼
┌─────────────────────────────────────────┐    ┌───────────────────────────────────────────────────────────────────────┐
│ REPO: yoonie-landing-page               │    │ REPO: yoonie-frontend (Next.js 16 App Router)                         │
│ (Commercial Marketing Platform)         │    │ (Multi-Tenant Direct Booking + Central Ops Hub)                       │
│                                         │    │                                                                       │
│  • Commercial landing & ROI calculator  │    │  [ Surface A: Tenant Guest Engine: [slug].yoonie.app ]                │
│  • Instant Hotel Workspace Onboarding   │    │  • Room Catalog & Real-Time Availability Checks                       │
│  • Provisions:                          │    │  • Unified Composite Cart (Room + Dining + Boat Tour + Airport Fleet) │
│    Tenant DB Record + Wildcard Subdomain│    │  • 15-Minute Atomic Cart Hold Countdown & Token Store                 │
│    (sedona.yoonie.app live in <60s)     │    │                                                                       │
│                                         │    │  [ Surface B: Central Operator Hub: ops.yoonie.app ]                  │
│                                         │    │  • Admin Property CMS: /admin (Rooms, Menus, Pricing, Surcharges)     │
│                                         │    │  • 05:30 Morning Dispatch Hub: /ops/dispatch (Flight & Driver Board)  │
│                                         │    │  • Digital Housekeeping Board: /ops/housekeeping (Dirty/Clean States) │
│                                         │    │  • Auth Protection: ProtectedLayoutClient + useRequireAuthVm()        │
└─────────────────────────────────────────┘    └───────────────────────────────────┬───────────────────────────────────┘
                                                                                   │
                                                        HTTP /api/* (JSON)         │
                                                        Authorization: Bearer <JWT>│
                                                        Idempotency-Key: <UUID>    │
                                                                                   ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. CORE BACKEND PLATFORM LAYER                                                                                       │
│    REPO: yoonie-backend (NestJS 10 Distributed Architecture on Express)                                              │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ ZERO-TRUST SECURITY & ACCESS CONTROL PIPELINE                                                                  │  │
│  │  • AuthModule:                                                                                                 │  │
│  │    - 15-Min Stateless Access Token (HMAC-SHA256 JWT): { sub, email, role, branchIds, defaultBranchId }        │  │
│  │    - 7-Day Rotating Refresh Token (SHA-256 Hash stored in DB with device fingerprint & reuse revocation chain) │  │
│  │  • Single-Flight Refresh Mutex (NetworkManager): Queues parallel requests on 401; auto-replays on fresh token   │  │
│  │  • TenantContextGuard: Enforces request.branchId ∈ user.branchIds (Hard multi-tenant data leak protection)     │  │
│  │  • 5-Tier RBAC Matrix: @Roles(ADMIN, BRANCH_MGR, DISPATCHER, STAFF, GUEST)                                    │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ CONCURRENCY, ATOMIC LOCKING & IDEMPOTENCY ENGINE                                                               │  │
│  │  • Idempotency-Key Guard: Mutex lock on <Idempotency-Key> UUID prevents duplicate credit card or seat charges  │  │
│  │  • Atomic CAS Decrement:                                                                                       │  │
│  │      db.inventory_slots.findOneAndUpdate(                                                                      │  │
│  │        { _id: slotId, branchId: targetBranch, available: { $gte: qty } },                                      │  │
│  │        { $inc: { available: -qty, held: +qty } }                                                                │  │
│  │      )                                                                                                         │  │
│  │      ──> Evaluates TRUE: Slot locked. Evaluates FALSE: HTTP 409 Conflict. ZERO DOUBLE-BOOKINGS.                │  │
│  │  • 15-Min TTL Hold Leases: Temporary hold tokens stored in `inventory_holds` collection with automatic TTL     │  │
│  │  • ACID Multi-Document Transactions: Multi-item composite checkout (Villa + Yacht + Dinner) commits as ONE unit│  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ AUTOMATED CRON ENGINE & NODE SCHEDULER (Distributed Workers)                                                   │  │
│  │  • 05:30 Dispatch Runner (CRON: 30 5 * * *): Pre-calculates daily operational run-sheets at 05:30 AM sunrise;   │  │
│  │    matches incoming flights (e.g. TG917) to driver rosters, sets housekeeping turnaround priorities by VIP tier│  │
│  │  • 60s Hold Expiry Sweeper (CRON: * * * * *): Scans expired leases; reverts unpurchased items to available pool│  │
│  │  • Tour Yield Consolidator (CRON: 0 */2 * * *): Flags shared boat excursions under 4-pax threshold 24h prior    │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ DOMAIN MICROSERVICES (14 BOUNDED CONTEXTS)                                                                     │  │
│  │  • RoomModule        • RestaurantModule     • ServiceModule (Tours)   • InventoryModule (CAS Holds)            │  │
│  │  • OrderModule       • DispatchModule       • StaffModule             • BranchModule (Multi-Tenant Config)     │  │
│  │  • DevicesModule     • NotificationsModule  • AuditModule             • AssistantModule (AI Concierge)         │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
└───────────────────────┬──────────────────────────────────────────────────────────┬───────────────────────────────────┘
                        │                                                          │
                        ▼                                                          ▼
┌──────────────────────────────────────────────────────┐  ┌────────────────────────────────────────────────────────────┐
│ 4. MULTI-TENANT PERSISTENCE LAYER                    │  │ 5. AI ENGINE & OMNI-CHANNEL NOTIFICATION MESH              │
│    MONGODB ATLAS REPLICA SET CLUSTER                 │  │                                                            │
│                                                      │  │  • Webhook Bus: n8n Workflow Automation Cluster            │
│  • Single-DB Logical Multi-Tenant Partitioning:      │  │    (Triggers on: OrderCreated, FlightDelayed, DispatchSync)│
│    Every collection enforces mandatory foreign key:  │  │                                                            │
│    `branchId` (or `tenantId`)                        │  │  • Data-Grounded AI Concierge (Agentic LLM):               │
│                                                      │  │    - Real-time tool execution against backend APIs:         │
│  • Compound Performance Indexes:                     │  │      * lookup_room_availability(branchId, dates)           │
│    { branchId: 1, slug: 1 }                          │  │      * get_dining_table_slots(branchId, date, shift)       │
│    { branchId: 1, status: 1, date: 1 }               │  │      * create_housekeeping_ticket(branchId, roomKey)       │
│    { branchId: 1, checkInDate: 1 }                   │  │    - Injected Tenant Context: Currency, tax, house rules   │
│                                                      │  │                                                            │
│  • 9 Core Collections:                               │  │  • Notification Channels:                                 │
│    1. `branches`              (Tenant Configurations)│  │    - WhatsApp Business Cloud API: Bilingual Driver Cards   │
│    2. `users`                 (Identities & RBAC)    │  │    - LINE Official Account: Frontline Supervisor Alerts    │
│    3. `rooms`                 (Keys & Cleaning Board)│  │    - Google FCM Push: Real-Time Mobile Task Synchronization│
│    4. `restaurants`           (Outlets, Shifts, Tables)  - Twilio SMS / SendGrid: Tax Invoices & QR Check-In Pass    │
│    5. `services`              (Tours, Spa, Transfers)└──────────────────────────────┬─────────────────────────────┘
│    6. `inventory_slots`       (Atomic Capacity Counts)                               │
│    7. `inventory_holds`       (15-Min Leases with TTL)                               │ FCM Push Notifications
│    8. `orders`                (Composite Carts)                                      │ Task Assignment & Updates
│    9. `operational_dispatches`(05:30 Daily Run-Sheet)                                │
└──────────────────────────────────────────────────────┘                               │
                                                                                       ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 6. FRONTLINE MOBILE APPLICATION LAYER                                                                                │
│    REPO: yoonie-mobile-staff (React Native / Expo for iOS & Android)                                                 │
│                                                                                                                      │
│  • Target Audience:  Airport Fleet Drivers & Floor Housekeeping Attendants                                           │
│  • Provisioning:     No public signup; accounts provisioned strictly by Branch Manager inside ops.yoonie.app         │
│  • Role Routing:     jobTitle === "DRIVER"       ──> Routes to /(app)/driver (Flight ETA, gate, meeting doors)      │
│                      jobTitle === "HOUSEKEEPER"  ──> Routes to /(app)/housekeeper (Dirty queue, swipe to start clean)│
│  • Offline Engine:   Embedded SQLite task database caches local runs; drivers in airport basements or attendants in  │
│                      concrete elevator shafts update tasks offline; auto-syncs to backend when signal recovers.      │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 4 Code Repositories

| Repository | Tech Stack | Role & Scope |
| :--- | :--- | :--- |
| **[`yoonie-landing-page`](../yoonie-landing-page)** | Next.js 16, Tailwind v4, Framer Motion | Platform marketing front door (`yoonie.app` / `www.yoonie.app`), ROI calculator, and automated tenant workspace provisioning engine. |
| **[`yoonie-frontend`](./)** | Next.js 16 App Router, React 18/19, TanStack Query | Universal web surface: Guest direct booking engine (`[tenant].yoonie.app`), central operator hub (`ops.yoonie.app`), and property CMS (`/admin`). Edge routing via `proxy.ts`. |
| **[`yoonie-backend`](../yoonie-backend)** | NestJS 10, Express, MongoDB Atlas Replica Set | Distributed microservices platform: Atomic CAS inventory locks, 15-minute hold leases, 05:30 morning dispatch runner, JWT refresh rotation, RBAC, and n8n webhook bus. |
| **[`yoonie-mobile-staff`](../yoonie-mobile-staff)** | React Native, Expo, SQLite, Google FCM | Native mobile application for airport transfer drivers (flight tracking, gate assignments) and housekeepers (room cleaning turnover) with offline sync. |

---

## 3. Multi-Tenant Subdomain Routing (`proxy.ts`)

In Next.js 16, `middleware.ts` is replaced by **`proxy.ts`** exporting `export function proxy(request: NextRequest)`.

Yoonie inspects incoming `Host` headers at the edge to provide seamless multi-tenancy:

| Host / Subdomain | Target Experience | Edge Action |
| :--- | :--- | :--- |
| **`ops.yoonie.app`** / **`ops.localhost:3000`** | Central Operations Hub (`/ops/rooms`, `/ops/dispatch`) | Rewrites `/` to `/ops/rooms`. Auth pages (`/login`, `/register`) pass through to single branded login. |
| **`[slug].yoonie.app`** / **`[slug].localhost:3000`** | Tenant Direct Booking Engine (`/`) | Resolved directly at `/` for the tenant property. Zero URL redirects; tenant context injected via server headers. |
| **`yoonie.app`** / **`localhost:3000`** | Platform Root | Platform landing page, property directory, and hotel workspace onboarding. |
| **`/api/*`** (All domains) | NestJS Backend API | Next.js reverse proxy rewrite to backend API eliminating cross-origin preflight overhead. |

---

## 4. Key Architectural Differentiators (Pitch Deck Reference)

### A. Zero Double-Booking Concurrency SLA
- **Atomic Compare-And-Swap (CAS):** Inventory increments/decrements occur inside a single atomic database operation:
  ```typescript
  const slot = await db.collection("inventory_slots").findOneAndUpdate(
    { _id: slotId, branchId, available: { $gte: requestedQty } },
    { $inc: { available: -requestedQty, held: +requestedQty } }
  );
  if (!slot) throw new ConflictException("Slot already booked.");
  ```
- **15-Minute TTL Leases:** Added items receive a temporary hold token in `inventory_holds`. If checkout is abandoned, the background sweeper releases the units back to `available`.
- **Idempotency-Key Deduplication:** Financial mutations require an `Idempotency-Key: <UUID>` header; retries return cached responses to prevent double-charging.

### B. Zero-Trust Security & Token Rotation
- **Access Tokens:** 15-minute ephemeral HMAC-SHA256 JWTs stored in-memory (`tokenStore.ts`) to prevent XSS extraction.
- **Refresh Tokens:** 7-day cryptographic tokens stored in MongoDB with device fingerprinting and automatic family reuse revocation.
- **Single-Flight Refresh Mutex (`NetworkManager.ts`):** When multiple concurrent API calls receive a `401 Unauthorized`, they queue onto a single `refreshPromise`, preventing token stampedes.
- **5-Tier RBAC:** `@Roles(ADMIN, BRANCH_MGR, DISPATCHER, STAFF, GUEST)` enforced by `TenantContextGuard`.

### C. Automated Cron Engine & Node Scheduler
- **05:30 Dispatch Runner (`30 5 * * *`):** Calculates the daily run-sheet before sunrise, pairing incoming airport flights (e.g., TG917) with drivers and organizing boat excursions.
- **60-Second Hold Sweeper (`* * * * *`):** Reclaims abandoned inventory holds where `expiresAt <= NOW()`.
- **Tour Yield Consolidator (`0 */2 * * *`):** Inspects shared boat excursions 24h prior; flags tours with fewer than 4 guests to prevent captain fuel losses.

### D. Data-Grounded AI Concierge & n8n Mesh
- Integrated with **n8n Webhook Bus** and agentic LLMs.
- Grounded with real-time backend tool APIs (`lookup_room_availability`, `query_dining_table_shifts`, `create_guest_ticket`).
- Multi-channel delivery to guests and staff via **WhatsApp Business Cloud API**, **LINE Official**, and **FCM Mobile Push**.

---

## 5. Local Development Setup

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x`
- **Backend API**: Running on `http://localhost:8080` (see `../yoonie-backend`)

### 2. Local Subdomain Setup (`/etc/hosts`)
```
127.0.0.1 ops.localhost riverside-bkk.localhost sedona.localhost
```

### 3. Install & Run
```bash
npm install
npm run dev
```

- **Platform Root**: [http://localhost:3000](http://localhost:3000)
- **Operator Portal**: [http://ops.localhost:3000](http://ops.localhost:3000)
- **Tenant Direct Booking**: [http://riverside-bkk.localhost:3000](http://riverside-bkk.localhost:3000)
- **Interactive Whitepaper & Architecture Docs**: [http://localhost:3000/tech-whitepaper.html](http://localhost:3000/tech-whitepaper.html)

---

## 6. Documentation Index

- [**`docs/CTO_TECHNICAL_WHITEPAPER.md`**](./docs/CTO_TECHNICAL_WHITEPAPER.md): Master technical whitepaper with full sequence diagrams and code contracts.
- [**`public/tech-whitepaper.html`**](./public/tech-whitepaper.html): Standalone, print-to-PDF ready whitepaper with SVG vector diagrams and executive styling.
- [**`docs/ARCHITECTURE.md`**](./docs/ARCHITECTURE.md): Frontend MVVM architecture, directory structure, and edge proxy rules.
- [**`docs/SYSTEM_FLOWS.md`**](./docs/SYSTEM_FLOWS.md): Detailed operational workflows and sequence diagrams.
- [**`docs/DATA_MODEL.md`**](./docs/DATA_MODEL.md): MongoDB Entity-Relationship Diagram (ERD) and collection schemas.
