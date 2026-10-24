# System Architecture & Operational Sequence Flows

Comprehensive sequence diagrams and operational workflows for the **Yoonie Unified Hospitality Operating System**, covering multi-tenant edge routing, authentication, protected layouts, inventory concurrency, morning dispatch, and housekeeping turnarounds.

---

## 1. Multi-Tenant Subdomain Routing (`proxy.ts`)

How Next.js 16 Edge Proxy resolves requests across tenant direct booking, central operator hub, and root platform.

```mermaid
sequenceDiagram
    autonumber
    actor Client as Browser / Mobile App
    participant Edge as Next.js 16 proxy.ts
    participant OpsPage as /ops/dispatch
    participant StayPage as /stay/[slug]
    participant LoginPage as /login
    participant Backend as NestJS API (:8080)

    alt 1. Central Operator Portal (ops.yoonie.si or ops.localhost:3000)
        Client->>Edge: GET http://ops.localhost:3000/
        Note over Edge: host starts with "ops." & pathname === "/"
        Edge->>OpsPage: Rewrite to /ops/dispatch
        OpsPage-->>Client: Render Ops Shell (Protected via ProtectedLayoutClient)
    else 2. Operator Accessing Unauthenticated Route
        Client->>Edge: GET http://ops.localhost:3000/login
        Note over Edge: host starts with "ops." & pathname === "/login"
        Edge->>LoginPage: Pass-through (NextResponse.next())
        LoginPage-->>Client: Render Authoritative /login Page
    else 3. Tenant Direct Booking ([tenant].yoonie.si or [tenant].localhost:3000)
        Client->>Edge: GET http://riverside-bkk.localhost:3000/
        Note over Edge: extract subdomain "riverside-bkk" & pathname === "/"
        Edge->>StayPage: Rewrite to /stay/riverside-bkk
        StayPage-->>Client: Render Sanctuary Booking Engine for Riverside BKK
    else 4. API Proxy Requests
        Client->>Edge: GET /api/v1/rooms?branchId=...
        Note over Edge: next.config.ts reverse proxy rewrites /api/*
        Edge->>Backend: Forward to http://localhost:8080/api/v1/rooms
        Backend-->>Client: JSON Response (No CORS issues across subdomains)
    end
```

---

## 2. Authentication, Token Lifecycle & ProtectedLayoutClient

Complete authentication, session restoration, role-based redirection, and route protection.

```mermaid
sequenceDiagram
    autonumber
    actor Operator as Hotel Staff / Operator
    participant View as LoginPageView
    participant Vm as loginPageVm
    participant Auth as AuthProvider
    participant API as auth-api (loginRequest)
    participant Backend as NestJS AuthController
    participant Guard as ProtectedLayoutClient
    participant Ops as OpsPage (/ops/dispatch)

    Note over Operator,View: 1. Sign-In Flow
    Operator->>View: Select "Kanya Srisuk" (Admin) & Submit
    View->>Vm: onSubmit(e)
    Vm->>Auth: login("kanya@riverside-bkk.example", "Password123!", nextParam)
    Auth->>API: loginRequest({ email, password })
    API->>Backend: POST /api/auth/login
    Backend-->>API: { user, tokens: { accessToken, refreshToken } }
    API-->>Auth: AuthResponse
    Note over Auth: 1. Set in-memory tokenStore<br/>2. Write localStorage ("oneforall_session_v1")<br/>3. QueryClient cache user
    Note over Auth: Role is "ADMIN" & host is "ops." ➔ target = "/ops/dispatch"
    Auth->>Ops: router.push("/ops/dispatch")

    Note over Operator,Guard: 2. Route Protection via ProtectedLayoutClient
    Operator->>Ops: Navigate to /ops/dispatch
    Ops->>Guard: <ProtectedLayoutClient><OpsNavbar/><DispatchView/></ProtectedLayoutClient>
    Guard->>Guard: useRequireAuthVm() inspects { user, ready }
    alt Authenticated Session Valid
        Guard-->>Operator: Render OpsNavbar + Dispatch Run-Sheet
    else Unauthenticated (ready && !user)
        Guard->>View: router.replace("/login")
    else User Suspended (user.isSuspended)
        Guard-->>Operator: Render AccountSuspendedBanner + Read-only view
    end
```

---

## 3. Direct Guest Multi-Product Booking & Atomic Inventory Hold

Guests select a room, dinner shift, and airport transfer in one cart. Capacity is locked using atomic conditional increments.

```mermaid
sequenceDiagram
    autonumber
    actor Guest
    participant Web as Booking Frontend (/stay/riverside-bkk)
    participant Inv as InventoryController & Service
    participant Ord as OrderController & Service
    participant DB as MongoDB (inventory_slots & inventory_holds)

    Guest->>Web: Select room (STANDARD_KING), dinner shift, & transfer
    Web->>Inv: GET /api/inventory/availability?roomType=STANDARD_KING&checkIn=...&checkOut=...
    Inv-->>Web: { available: 18 }

    Guest->>Web: Proceed to checkout
    Web->>Inv: POST /api/inventory/hold<br/>{branchId, cartId, lines: [{slotKey, qty: 1}]}
    Note over Inv,DB: Atomic conditional lock per slot:<br/>$inc: { held: +qty } WHERE held + booked + qty <= capacity
    Inv->>DB: updateOne({ slotKey, $expr: { $lte: [{ $add: ['$held', '$booked', qty] }, '$capacity'] } }, { $inc: { held: qty } })
    DB-->>Inv: Slot secured
    Inv->>DB: insertOne(InventoryHold { cartId, status: "ACTIVE", expiresAt: now + 15m })
    Inv-->>Web: InventoryHold { _id, expiresAt }

    Guest->>Web: Complete payment details
    Web->>Ord: POST /api/orders { branchId, guest, lines, holdId, channel: "DIRECT_WEB" }
    Ord->>DB: Insert Order (status: "PENDING")
    Ord-->>Web: Order { orderNumber: "TS-261024-X9Y1Z", status: "PENDING" }

    Web->>Ord: POST /api/orders/:id/confirm { paymentRef: "ch_stripe_123", paidThb: 6944 }
    Ord->>Inv: confirm(holdId, orderId)
    Note over Inv,DB: Convert Held to Booked:<br/>$inc: { held: -qty, booked: +qty }
    Inv->>DB: Update inventory_slots and mark hold "CONVERTED"
    Ord->>DB: Update order status to "CONFIRMED"
    Ord-->>Web: Confirmed Itinerary
    Web-->>Guest: Booking Complete & Voucher Generated
```

---

## 4. Cart Abandonment & Automated Capacity Sweeper

If a guest leaves during checkout, inventory is safely restored to the selling pool.

```mermaid
sequenceDiagram
    autonumber
    actor Guest
    participant Web as Browser
    participant Inv as InventoryModule
    participant Sweep as Background Sweeper Job (cron 1m)
    participant DB as MongoDB

    Guest->>Web: Begins checkout (Hold created, expires in 15 mins)
    Web->>Inv: POST /api/inventory/hold
    Inv->>DB: $inc: { held: +1 } on target slots
    Note over Guest,Web: Guest closes browser tab / abandons cart

    loop Every 60 Seconds
        Sweep->>DB: find({ status: "ACTIVE", expiresAt: { $lt: now } })
        DB-->>Sweep: Expired holds list
        Sweep->>DB: For each slotKey: $inc: { held: -qty }
        Sweep->>DB: Update hold status = "EXPIRED", purgeAt = now + 1hr
    end
    Note over DB: Capacity restored to open pool.<br/>MongoDB TTL index purges expired hold document at purgeAt.
```

---

## 5. 05:30 AM Morning Dispatch Run-Sheet Generation

The automated air-traffic controller for frontline operations running at 05:30 Bangkok time (`Asia/Bangkok`).

```mermaid
sequenceDiagram
    autonumber
    participant Cron as 05:30 AM Bangkok Scheduler
    participant Dispatch as DispatchService
    participant Rules as dispatch-rules.ts
    participant DB as MongoDB (operational_dispatches)
    participant StaffUI as Staff Mobile App / Ops Portal

    Cron->>Dispatch: generateMorningRunSheet(branchId, today)
    
    par 1. Query Active Operations Context
        Dispatch->>DB: Find dirty/turnaround rooms & check-in orders for today
        Dispatch->>DB: Find departing tour excursion bookings
        Dispatch->>DB: Find arrival flight airport transfer bookings
    end

    Note over Dispatch,Rules: Evaluate Housekeeping Urgency
    Dispatch->>Rules: calcHousekeepingPriority(guestArrivalEta, isVip)
    Rules-->>Dispatch: High priority score for VIPs & early arrivals (e.g. Room 101, ETA 11:30)

    Note over Dispatch,Rules: Evaluate Tour Yield & Consolidation
    Dispatch->>Rules: checkConsolidation(bookedPax, minViablePax: 6, fixedCostThb: 4500)
    Rules-->>Dispatch: Departure at 33% capacity ➔ Flag "MERGE_OR_CANCEL"

    Note over Dispatch,Rules: Build Bilingual Driver Manifests
    Dispatch->>Rules: buildPickupCard(guestName, flight, terminalDoor, driver)
    Rules-->>Dispatch: Formatted English + Thai driver instructions

    Dispatch->>DB: Upsert operational_dispatches (idempotent dedupeKey)
    Dispatch-->>StaffUI: Push notification & Live updates on Dispatch Run-Sheet
```

---

## 6. Front-Desk Zero Housekeeping Turnaround Lifecycle

Room turnaround prioritized dynamically by incoming guest logistics.

```mermaid
sequenceDiagram
    autonumber
    actor Housekeeper as Housekeeper (Mobile Staff App)
    actor Supervisor as Floor Supervisor / Front Desk
    participant API as RoomController (/api/v1/rooms)
    participant DB as MongoDB (rooms & operational_dispatches)

    Note over Housekeeper: 1. Room Status: DIRTY
    Housekeeper->>API: GET /api/v1/rooms/housekeeping?branchId=...
    API->>DB: Query rooms sorted by cleaning priority score
    API-->>Housekeeper: Room 101 (High Priority: VIP Early Arrival)

    Note over Housekeeper: 2. Start Cleaning
    Housekeeper->>API: PATCH /api/v1/rooms/:id/cleaning { cleaningStatus: "IN_PROGRESS" }
    API->>DB: Update room.cleaningStatus = "IN_PROGRESS", cleaningUpdatedAt = now
    API-->>Housekeeper: 200 OK (Status updated)

    Note over Housekeeper: 3. Finish Cleaning
    Housekeeper->>API: PATCH /api/v1/rooms/:id/cleaning { cleaningStatus: "CLEAN" }
    API->>DB: Update room.cleaningStatus = "CLEAN"
    API-->>Housekeeper: 200 OK

    Note over Supervisor: 4. Supervisory Inspection
    Supervisor->>API: PATCH /api/v1/rooms/:id/cleaning { cleaningStatus: "INSPECTED" }
    API->>DB: Update room.cleaningStatus = "INSPECTED"
    API-->>Supervisor: 200 OK
    Note over Supervisor: Room is now green for frictionless key release.
```

---

## 7. Staff Mobile App Real-Time Status Synchronization

Frontline drivers and housekeepers updating operational dispatch tasks via mobile API.

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Shuttle Driver (Mobile App)
    participant MobileAPI as StaffController (/api/v1/staff)
    participant DispatchAPI as DispatchController
    participant DB as MongoDB (operational_dispatches)
    participant OpsHub as Dispatch Run-Sheet (Web Ops Portal)

    Driver->>MobileAPI: GET /api/v1/staff/tasks?date=today
    MobileAPI->>DB: Query tasks assigned to Driver (Airport Pickups)
    MobileAPI-->>Driver: [Task #D-101: Flight TG921, Guest: Eleanor Whitfield]

    Driver->>MobileAPI: PATCH /api/v1/staff/tasks/D-101/status { status: "IN_TRANSIT" }
    MobileAPI->>DB: Update operational_dispatches status = "IN_TRANSIT"
    MobileAPI-->>Driver: 200 OK

    OpsHub->>DispatchAPI: GET /api/v1/dispatch/daily?serviceDate=today
    DispatchAPI->>DB: Query live dispatch run-sheet
    DispatchAPI-->>OpsHub: Live Task Status: "IN_TRANSIT" (Van 01 departing BKK Door 4)
    Note over OpsHub: Real-time operator dashboard reflects driver movement without reload.
```
