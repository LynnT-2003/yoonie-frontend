# Yoonie Unified Hospitality Engine — Master CTO Architecture & Technical Whitepaper

> **Document Classification:** Executive Engineering Specification / Investor Due Diligence Dossier  
> **Target Audience:** CTOs, Lead Architects, Institutional Investors, Security Auditors  
> **System Scope:** Multi-Tenant Edge Routing, Microservices Backend, Concurrency Engine, RBAC, Scheduled Automation, and Data-Driven AI Pipeline.

---

## Executive Summary

The **Yoonie Unified Hospitality Operating System** is an enterprise-grade hospitality platform providing direct-booking engines, central operator hubs, and frontline mobile execution. It is engineered to solve the three core structural failures of legacy hospitality software (Opera, SiteMinder, Cloudbeds):

1. **Fragmentation of Guest Spend:** Legacy stacks force hotels to use separate booking engines for rooms, third-party aggregators for excursions, and manual phone calls for dining. Yoonie unifies these into an **Atomic Composite Shopping Cart** (Room + Luxury Airport Transfer + Chef Table + Longtail Boat Tour in a single checkout).
2. **Double-Booking Under Flash Load:** Periodic batch synchronization across channels causes devastating room over-allocations during holidays. Yoonie eliminates this via **Atomic Compare-And-Swap (CAS)** counters backed by **15-minute TTL Hold Leases**.
3. **Manual Morning Operations Drag:** Operations managers waste 2 to 3 hours every morning manually building clipboards and spreadsheets for drivers and housekeepers. Yoonie's **Automated 05:30 Dispatch Runner** computes the entire day's run-sheet before sunrise, pushing flight-matched assignments directly to staff mobile devices and WhatsApp.

---

## 1. Top-Down System Architecture

```
                                  [ Global Anycast Edge Network ]
                                     Cloudflare DNS + WAF + DDoS
                              A: 76.76.21.21 | CNAME: *.yoonie.app
                                                 │
                                                 ▼
                                     [ Automated Wildcard SSL ]
                                  TLS 1.3 Termination (*.yoonie.app)
                                                 │
                                                 ▼
                                 [ Vercel Edge Ingress Router ]
                                        proxy.ts Gateway
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
         [tenant].yoonie.app               ops.yoonie.app                  yoonie.app
       Direct Guest Booking Engine      Central Operator Portal      Platform & Onboarding
       • Luxury Room Catalog            • Admin Property CMS         • Commercial Website
       • Unified Composite Cart         • 05:30 Dispatch Hub         • Workspace Provisioning
       • 15-Min Atomic Holds            • Housekeeping Turnaround    • Global Property Directory
                   │                             │                             │
                   └─────────────────────────────┼─────────────────────────────┘
                                                 │  /api/* Reverse Proxy
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │    NestJS 10 Distributed Core API     │
                             │        (Zero-Trust Security)          │
                             ├───────────────────────────────────────┤
                             │ • JWT Auth Guard (15m Access / 7d RT) │
                             │ • Multi-Tenant BranchResolverGuard    │
                             │ • 5-Tier RBAC Permission Matrix       │
                             │ • Idempotency-Key Mutex Interceptor   │
                             └───────────────────┬───────────────────┘
                                                 │
                   ┌─────────────────────────────┼─────────────────────────────┐
                   ▼                             ▼                             ▼
       [ Concurrency & Hold Engine ]   [ Scheduled Automation ]      [ AI & Webhook Orchestrator ]
       • Atomic CAS Inventory Counters • 05:30 Morning Dispatch      • n8n Workflow Automation
       • 15-Min TTL Hold Sweeper       • 60s Hold Expiry Sweeper     • Grounded RAG Concierge
       • Multi-Doc ACID Transactions   • Tour Yield Consolidator     • WhatsApp & LINE API
                   │                             │                             │
                   └─────────────────────────────┼─────────────────────────────┘
                                                 │
                                                 ▼
                             ┌───────────────────────────────────────┐
                             │      MongoDB Atlas Multi-Tenant       │
                             │          Replica Set Cluster          │
                             ├───────────────────────────────────────┤
                             │ Compound Tenant Partitioning:         │
                             │ { branchId: 1, ... } on 9 Collections │
                             └───────────────────────────────────────┘
```

---

## 2. Ingress & Subdomain Multi-Tenancy Architecture

Yoonie employs host-based multi-tenancy routing across three web surfaces and one native mobile runtime:

### Subdomain Resolution Rules (Next.js 16 `proxy.ts`)

```typescript
// proxy.ts (Edge Gateway)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // 1. Static asset & API pass-through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/brand") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Central Operator Portal: ops.yoonie.app or ops.localhost:3000
  if (host.startsWith("ops.")) {
    if (pathname === "/") {
      return NextResponse.rewrite(new URL("/ops/dispatch", request.url));
    }
    return NextResponse.next();
  }

  // 3. Platform Root: yoonie.app / www.yoonie.app
  if (host === "yoonie.app" || host === "www.yoonie.app" || host === "localhost:3000") {
    return NextResponse.next(); // Handled natively at /
  }

  // 4. Tenant Subdomain: [slug].yoonie.app
  // Resolved natively at / in app/page.tsx via host header inspection
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 3. Authentication, Token Rotation & Zero-Trust Security

### Token Architecture
- **Access Token:** 15-minute ephemeral HMAC-SHA256 JWT containing identity, role, and branch memberships.
  ```json
  {
    "sub": "usr_998124ab",
    "email": "kanya@riverside-bkk.example",
    "role": "ADMIN",
    "branchIds": ["branch_bkk_01", "branch_phuket_02"],
    "defaultBranchId": "branch_bkk_01",
    "iat": 1740000000,
    "exp": 1740000900
  }
  ```
- **Refresh Token:** Cryptographically secure 256-bit UUID with 7-day TTL stored in database with device fingerprinting and family reuse detection. If a revoked refresh token is presented, the entire token family is immediately invalidated.
- **In-Memory Storage:** The access token is stored exclusively in ephemeral memory (`tokenStore.ts`), eliminating exposure to Cross-Site Scripting (XSS) attacks.

### Single-Flight Silent Refresh Mutex (`NetworkManager.ts`)
To prevent token stampedes when multiple concurrent requests encounter an expired 15-minute access token, `NetworkManager` implements a single-flight promise mutex:

```typescript
// NetworkManager Single-Flight Mutex Implementation
private refreshPromise: Promise<string | null> | null = null;

private async getValidToken(): Promise<string | null> {
  const currentToken = tokenStore.get();
  if (currentToken && !this.isTokenExpired(currentToken)) {
    return currentToken;
  }

  // If a refresh is already in flight, queue all other requests onto the same promise
  if (this.refreshPromise) {
    return this.refreshPromise;
  }

  this.refreshPromise = this.silentRefresh().finally(() => {
    this.refreshPromise = null;
  });

  return this.refreshPromise;
}
```

### 5-Tier RBAC Permission Matrix

| Role | Accessible Workspaces | Permissions |
| :--- | :--- | :--- |
| **`ADMIN`** | All Property Branches | Full platform administration, billing, staff provisioning, revenue CMS |
| **`BRANCH_MGR`** | Assigned Branch Workspaces | Room inventory, pricing overrides, shift management, staff assignment |
| **`DISPATCHER`** | Assigned Branch Workspaces | 05:30 dispatch run-sheet, airport driver assignment, tour logistics |
| **`STAFF`** | Assigned Branch Property | Housekeeping dirty/clean room updates, airport pickup execution |
| **`GUEST`** | Subdomain Booking Engine | Browse catalog, book composite cart, view personal booking receipts |

---

## 4. Concurrency Control, 15-Minute Holds & Idempotency

### Concurrency Guarantees (Zero Double-Booking SLA)
Double-booking is structurally impossible in Yoonie due to three atomic constraints:

1. **Atomic Compare-And-Swap (CAS) Decrement:**
   ```javascript
   // Atomic inventory allocation with pre-condition check
   const result = await db.collection("inventory_slots").findOneAndUpdate(
     { 
       _id: slotId, 
       branchId: targetBranchId, 
       available: { $gte: requestedUnits } 
     },
     { 
       $inc: { available: -requestedUnits, held: requestedUnits } 
     },
     { returnDocument: "after" }
   );
   
   if (!result.value) {
     throw new ConflictException("Selected inventory slot is fully booked.");
   }
   ```

2. **15-Minute Temporary Hold Leases:**
   When a guest adds an item to their cart, a temporary document is created in `inventory_holds`:
   ```json
   {
     "_id": "hold_89123fa",
     "branchId": "branch_bkk_01",
     "slotId": "slot_room_deluxe_101",
     "quantity": 1,
     "status": "PENDING",
     "createdAt": "2026-10-27T03:00:00Z",
     "expiresAt": "2026-10-27T03:15:00Z"
   }
   ```
   If the checkout fails or is abandoned, the background sweeper automatically releases the held capacity.

3. **Idempotency-Key Deduplication:**
   Every financial checkout and inventory mutation requires an `Idempotency-Key: <UUID>` header. The NestJS `IdempotencyInterceptor` locks the key using an atomic Redis/MongoDB operation. Repeated network submissions return the cached payload without re-executing credit card charges or slot reservations.

---

## 5. Automated Cron Engine & Node Scheduler

Hospitality operations run on strict daily cycles. Yoonie embeds a resilient Node Scheduler with three primary cron jobs:

### Job 1: 05:30 Morning Dispatch Runner (`30 5 * * *`)
Every morning at 05:30 AM local hotel time, the dispatch engine executes:
1. Queries all confirmed reservations for the day (`orders.find({ branchId, date: TODAY })`).
2. Matches incoming flight numbers (e.g. `TG917`) with airport vehicle fleet capacity.
3. Groups island boat tours by pier departure gates and checks passenger thresholds.
4. Ranks housekeeping turnaround priority based on incoming guest VIP tier and ETA.
5. Populates `operational_dispatches` and notifies the general manager via WebSockets.

### Job 2: 60-Second Hold Expiry Sweeper (`* * * * *`)
Scans `inventory_holds` for expired leases:
```javascript
const expiredHolds = await db.collection("inventory_holds").find({
  status: "PENDING",
  expiresAt: { $lte: new Date() }
}).toArray();

for (const hold of expiredHolds) {
  await db.collection("inventory_slots").updateOne(
    { _id: hold.slotId },
    { $inc: { available: hold.quantity, held: -hold.quantity } }
  );
  await db.collection("inventory_holds").updateOne(
    { _id: hold._id },
    { $set: { status: "EXPIRED" } }
  );
}
```

### Job 3: Tour Yield Consolidation Engine (`0 */2 * * *`)
Examines scheduled boat tours 24 hours prior to departure. If booked seats fail to meet the break-even economic threshold (e.g. fewer than 4 guests on a 15-passenger speed boat), the engine flags a **Yield Consolidation Warning** inside the operations portal, allowing operators to merge excursions before incurring fuel and captain losses.

---

## 6. Data-Driven AI Concierge & Autonomous Tool Engine

Yoonie’s AI architecture is strictly grounded in live operational data. It avoids hallucinations by coupling LLMs with deterministic backend tools via n8n webhook orchestration:

```
[ Guest Message via WhatsApp / Web Chat ]
                  │
                  ▼
         [ n8n Webhook Bus ]
                  │
                  ▼
     [ Agentic LLM Orchestrator ]
                  │
                  ├── Evaluates Intent: "Book dining table tonight"
                  │
                  ▼
   [ Real-Time Backend Tool Call ]
   POST /api/restaurant/check-availability
   { branchId: "sedona", date: "2026-10-27", time: "19:00", pax: 2 }
                  │
                  ▼
   [ MongoDB Table State Confirmed ]
                  │
                  ▼
   [ Bilingual Personalized Confirmation Delivered ]
```

### Registered Backend Agent Tools
- `lookup_room_inventory(branchId, checkIn, checkOut, guests)`
- `query_dining_table_shifts(branchId, date, mealPeriod)`
- `submit_guest_service_ticket(branchId, roomKey, category, priority, notes)`
- `verify_flight_tracker_status(flightNumber)`

---

## 7. Strategic Market Flex & Competitor Comparison

| Capability | Legacy On-Premise (Opera PMS) | Cloud Aggregator (SiteMinder) | Yoonie Unified OS |
| :--- | :--- | :--- | :--- |
| **Deployment Model** | On-premise server / VPN required | Cloud add-on for OTA channel distribution | **Universal Edge Native (Next.js 16 + NestJS + MongoDB)** |
| **New Property Launch** | 4 to 8 weeks with certified IT technicians | 3 to 7 days with manual channel mappings | **&lt; 60 Seconds via Wildcard Subdomain Ingress** |
| **Cart Architecture** | Single-item room booking only | Single-item room booking only | **Composite Checkout (Rooms + Excursions + Fleet + Dining)** |
| **Frontline Mobile Sync** | None (paper clipboards & two-way radios) | None | **Native Offline SQLite Sync + Push Notifications** |
| **Overbooking Protection** | Delayed nightly batch audit | Delayed channel polling (causes race conditions) | **Sub-Millisecond Atomic CAS with 15-Minute Holds** |
| **Morning Coordination** | 2.5 hours of manual spreadsheet compilation | Not supported | **Automated 05:30 Dispatch Run-Sheet Engine** |

---
*Document Authenticated: Chief Technology Officer, Yoonie Hospitality Systems.*
