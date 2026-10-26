# Yoonie Frontend — Architecture & System Topologies

> **Tagline:** *Every booking, closed. Every morning, automated.*  
> **Ecosystem:** 4 Decoupled Repositories (`yoonie-landing-page`, `yoonie-frontend`, `yoonie-backend`, `yoonie-mobile-staff`) spanning Edge Ingress, Multi-Tenant Web, Autonomous Backend, and Frontline Mobile.

---

## 1. Master System Topology

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

## 2. Ingress & Subdomain Resolution Sequence (`proxy.ts`)

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser / Mobile App
    participant Edge as Next.js 16 Edge Gateway (proxy.ts)
    participant OpsPage as /ops/rooms (/ops/dispatch)
    participant TenantPage as / (Tenant Direct Booking)
    participant LandingPage as / (Platform Root)
    participant Backend as NestJS Core API (:8080)

    alt 1. Central Operator Portal (ops.yoonie.app or ops.localhost:3000)
        Client->>Edge: GET http://ops.yoonie.app/
        Note over Edge: host starts with "ops." & pathname === "/"
        Edge->>OpsPage: Rewrite to /ops/rooms
        OpsPage-->>Client: Render Protected Operator Shell (ProtectedLayoutClient)
    else 2. Tenant Direct Booking ([tenant].yoonie.app or [tenant].localhost:3000)
        Client->>Edge: GET http://sedona.yoonie.app/
        Note over Edge: Extract subdomain slug "sedona", pass-through to /
        Edge->>TenantPage: Resolve directly at / via server headers()
        TenantPage-->>Client: Render Branded Sedona Hotel Direct-Booking Engine
    else 3. Commercial Platform Front Door (yoonie.app or localhost:3000)
        Client->>Edge: GET http://yoonie.app/
        Note over Edge: Root apex domain, pass-through to /
        Edge->>LandingPage: Render Platform Showcase & Workspace Provisioning
        LandingPage-->>Client: Return Commercial Website
    else 4. API Proxy Requests
        Client->>Edge: GET /api/v1/rooms?branchId=...
        Note over Edge: Reverse proxy rewrite via next.config.ts
        Edge->>Backend: Forward to http://localhost:8080/api/v1/rooms
        Backend-->>Client: JSON Response (Zero CORS friction across subdomains)
    end
```

---

## 3. Zero-Trust Authentication & Silent Refresh Mutex Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser / Mobile
    participant NM as NetworkManager (Single-Flight Mutex)
    participant Store as tokenStore (In-Memory)
    participant AuthAPI as NestJS AuthController (:8080)
    participant DB as MongoDB Atlas

    Note over User,AuthAPI: 1. Authoritative Sign-In (/login)
    User->>NM: login("kanya@riverside-bkk.example", "Password123!")
    NM->>AuthAPI: POST /api/auth/login
    AuthAPI->>DB: Verify bcrypt password hash & issue token family
    DB-->>AuthAPI: User record { role: "ADMIN", branchIds: [...] }
    AuthAPI-->>NM: { accessToken (15m), refreshToken (7d), user }
    NM->>Store: Set in-memory accessToken & refreshToken
    NM-->>User: Auth Success (Redirect to /ops/dispatch)

    Note over User,AuthAPI: 2. Silent Refresh on HTTP 401 with Stampede Prevention
    User->>NM: Parallel GET /api/v1/rooms & GET /api/v1/orders
    NM->>AuthAPI: Headers: Bearer ExpiredToken
    AuthAPI-->>NM: 401 Unauthorized

    rect rgb(20, 30, 45)
        Note over NM: Single-Flight Mutex Activated: this.refreshPromise created<br/>Parallel request attaches to existing promise
        NM->>AuthAPI: POST /api/auth/refresh { userId, refreshToken }
        AuthAPI->>DB: Atomically rotate refresh token (Detect reuse)
        DB-->>AuthAPI: New Token Pair Issued
        AuthAPI-->>NM: { accessToken: "fresh_jwt", refreshToken: "new_refresh" }
        NM->>Store: updateTokens(fresh_jwt, new_refresh)
    end

    Note over NM,User: Replay queued requests with fresh_jwt
    NM->>AuthAPI: GET /api/v1/rooms with fresh_jwt
    AuthAPI-->>User: HTTP 200 OK
```

---

## 4. Concurrency & 15-Minute Atomic Hold Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Guest1 as Guest A (Bangkok)
    actor Guest2 as Guest B (London)
    participant Edge as Edge Gateway
    participant HoldService as InventoryHoldService
    participant DB as MongoDB Atlas Cluster

    Note over Guest1,Guest2: Final Deluxe Pool Villa Available (Count = 1)
    
    par Race Condition Checkout
        Guest1->>Edge: POST /api/inventory/hold<br/>Idempotency-Key: "idemp_1001"
        Guest2->>Edge: POST /api/inventory/hold<br/>Idempotency-Key: "idemp_2002"
    end

    Edge->>HoldService: Process Hold Request A
    HoldService->>DB: findOneAndUpdate({ slotId: "101", available: { $gte: 1 } }, { $inc: { available: -1, held: +1 } })
    Note over DB: Atomic CAS Evaluates TRUE.<br/>Available decremented from 1 to 0.
    DB-->>HoldService: { status: "SUCCESS", slotId: "101" }
    HoldService->>DB: insertOne(inventory_holds, { expiresAt: NOW() + 15m })
    HoldService-->>Guest1: HTTP 201 Created (Hold Token: "hold_9921", Expires: 15:00)

    Edge->>HoldService: Process Hold Request B
    HoldService->>DB: findOneAndUpdate({ slotId: "101", available: { $gte: 1 } }, { $inc: { available: -1, held: +1 } })
    Note over DB: Atomic CAS Evaluates FALSE.<br/>Available is 0. Operation Aborted.
    DB-->>HoldService: null (No Document Modified)
    HoldService-->>Guest2: HTTP 409 Conflict ("Inventory Sold Out")
```

---

## 5. Automated 05:30 Morning Dispatch Run-Sheet Sequence

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Node Scheduler (05:30 AM)
    participant Engine as DispatchSynthesisEngine
    participant DB as MongoDB Atlas
    participant N8N as n8n Webhook Bus
    participant Mobile as yoonie-mobile-staff (FCM)

    Cron->>Engine: Trigger executeMorningDispatchJob()
    Engine->>DB: Query Confirmed Orders for Today { checkIn: TODAY }
    DB-->>Engine: [ Villa Bookings, TG917 Flight Pickups, Longtail Tours ]

    rect rgb(20, 30, 45)
        Note over Engine: 1. Synthesize Airport Transfers (Match Driver Somchai with Flight TG917)<br/>2. Group Island Excursions (Check-in time & Pier Gates)<br/>3. Compute Housekeeping Turnaround Priorities by Guest Arrival ETA
        Engine->>DB: Bulk Write to operational_dispatches
    end

    Engine->>N8N: POST /webhook/morning-dispatch-ready { branchId, taskCount }
    N8N->>Mobile: Send FCM Push Notification to Drivers & Housekeepers
    Mobile-->>Engine: Staff Mobile Acknowledges Roster Sync
    Note over Engine: Dispatch run-sheet live at ops.yoonie.app/ops/dispatch
```

---

## 6. Real-Time Data-Grounded AI Concierge Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Guest as Guest (WhatsApp / Web Chat)
    participant N8N as n8n Webhook Router
    participant LLM as Agentic LLM Orchestrator
    participant API as Yoonie Core Backend (:8080)
    participant DB as MongoDB Atlas

    Guest->>N8N: "Can I book a table at the Riverside Terrace tonight at 7 PM for 2?"
    N8N->>LLM: Ingest User Message + Tenant Context (Sedona Hotel)
    
    Note over LLM: Evaluates intent: Dining Reservation<br/>Generates Tool Call: query_dining_availability()
    LLM->>API: POST /api/restaurant/check-availability { branchId: "sedona", date: "2026-10-27", time: "19:00", pax: 2 }
    API->>DB: Query restaurant table shifts
    DB-->>API: Available: Table 4 (Terrace Riverfront)
    API-->>LLM: { status: "AVAILABLE", tableId: "T4", shift: "EVENING" }

    Note over LLM: Formats bilingual confirmation with VIP hotel tone
    LLM-->>N8N: "I've held Table 4 on the Riverfront Terrace for 7:00 PM tonight! Shall I confirm?"
    N8N->>Guest: Deliver Instant Message via WhatsApp Cloud API
```

---

## 7. State Transition Lifecycles

### A. Housekeeping Room Turnaround State Machine
```mermaid
stateDiagram-v2
    [*] --> DIRTY: Guest Checkout / Scheduled Clean
    DIRTY --> IN_PROGRESS: Housekeeper swipes "Start Cleaning" on Mobile
    IN_PROGRESS --> CLEAN: Housekeeper completes turnaround & submits checklist
    CLEAN --> INSPECTED: Supervisor audits room inside /ops/housekeeping
    INSPECTED --> OCCUPIED: Front desk executes keycard handoff
    OCCUPIED --> DIRTY: Morning departure / Daily refresh
```

### B. Composite Order & 15-Minute Hold Lease State Machine
```mermaid
stateDiagram-v2
    [*] --> PENDING: Guest initiates composite checkout
    PENDING --> HELD: Atomic CAS decrements slot count, 15m lease created
    HELD --> CONFIRMED: Payment authorized & multi-doc ACID transaction commits
    HELD --> EXPIRED: 15-minute lease timer elapses without payment
    EXPIRED --> RELEASED: 60s background sweeper increments slot availability
    CONFIRMED --> CANCELLED: Guest / Operator cancels reservation
    CANCELLED --> REFUNDED: Gateway webhook returns funds
```

### C. Operational Dispatch Task Lifecycle
```mermaid
stateDiagram-v2
    [*] --> OPEN: 05:30 cron runner synthesizes daily run-sheet
    OPEN --> ACKNOWLEDGED: Dispatcher assigns driver/guide inside /ops/dispatch
    ACKNOWLEDGED --> IN_PROGRESS: Driver taps "Start Trip" at Airport Terminal Gate
    IN_PROGRESS --> DONE: Driver delivers guest to lobby, task confirmed
    OPEN --> CANCELLED: Flight cancelled or rescheduled
```

---

## 8. Documentation Index

- [**`docs/CTO_TECHNICAL_WHITEPAPER.md`**](./docs/CTO_TECHNICAL_WHITEPAPER.md): Complete architecture blueprint and code contracts.
- [**`public/tech-whitepaper.html`**](./public/tech-whitepaper.html): Interactive and print-to-PDF ready whitepaper with SVG vector topology.
- [**`docs/ARCHITECTURE.md`**](./docs/ARCHITECTURE.md): Frontend MVVM architecture, directory structure, and edge proxy rules.
- [**`docs/SYSTEM_FLOWS.md`**](./docs/SYSTEM_FLOWS.md): Detailed operational workflows and sequence diagrams.
- [**`docs/DATA_MODEL.md`**](./docs/DATA_MODEL.md): MongoDB Entity-Relationship Diagram (ERD) and collection schemas.
