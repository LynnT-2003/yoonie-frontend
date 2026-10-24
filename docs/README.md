# Yoonie — Platform Documentation Index

Comprehensive technical, operational, and architectural documentation index for the **Yoonie Unified Hospitality Operating System**, encompassing the Next.js 16 frontend, NestJS backend API, multi-tenant edge routing, and frontline operations.

---

## Documentation Index

| Document | Tier | Purpose |
| :--- | :--- | :--- |
| [**`ARCHITECTURE.md`**](./ARCHITECTURE.md) | **Cross-Platform** | **System Architecture & Multi-Tenancy Blueprint**: Host subdomain routing rules (`proxy.ts`), edge proxying, frontend MVVM separation, NestJS modular core, MongoDB collections, and security contracts. |
| [**`SYSTEM_FLOWS.md`**](./SYSTEM_FLOWS.md) | **Cross-Platform** | **Operational Sequence Flows**: Mermaid diagrams for edge routing, auth lifecycle, direct guest booking with atomic hold, 05:30 morning dispatch, and housekeeping turnarounds. |
| [**`FRONTEND_API.md`**](./FRONTEND_API.md) | **API Contract** | **Frontend API Integration Guide**: Exhaustive REST endpoint contracts across all domain modules (`/auth`, `/rooms`, `/inventory`, `/orders`, `/dispatch`, `/staff`, `/branch`). |
| [**`DATA_MODEL.md`**](./DATA_MODEL.md) | **Data Layer** | **Data Model & Lifecycles**: Entity-Relationship Diagram (ERD), collection schemas, indexes, and state machine lifecycles (`Order`, `InventorySlot`, `Room`, `OperationalDispatch`). |

---

## Core System Architecture

```
                                  ┌───────────────────────────────┐
                                  │       Hospitality Users       │
                                  │   (Guests, Owners, Frontline) │
                                  └───────────────┬───────────────┘
                                                  │
                  ┌───────────────────────────────┼───────────────────────────────┐
                  ▼                               ▼                               ▼
       [tenant].yoonie.si                  ops.yoonie.si                      yoonie.si
     (Direct Guest Booking)              (Operator Portal)             (Platform & Onboarding)
                  │                               │                               │
                  └───────────────────────────────┼───────────────────────────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │   Next.js 16 App      │
                                      │       proxy.ts        │
                                      └───────────┬───────────┘
                                                  │
                                                  │ /api/* reverse proxy
                                                  ▼
                                      ┌───────────────────────┐
                                      │  NestJS Backend API   │
                                      │   (Port 8080 / Express│
                                      └───────────┬───────────┘
                                                  │
                                                  ▼
                                      ┌───────────────────────┐
                                      │  MongoDB Database     │
                                      │  (9 Core Collections) │
                                      └───────────────────────┘
```

---

## Multi-Tenancy Routing Topology

| Subdomain | Environment | Routing Mechanism | Target Experience |
| :--- | :--- | :--- | :--- |
| **`ops.yoonie.si`** | Production | `proxy.ts` Edge Rewrite | **Central Operator Portal**: 05:30 Dispatch Run-Sheet, Housekeeping Board, Property CMS |
| **`ops.localhost:3000`** | Local Dev | `proxy.ts` Edge Rewrite | Local operator development hub |
| **`[slug].yoonie.si`** | Production | `proxy.ts` Edge Rewrite | **Tenant Direct Booking Engine**: Direct room reservations, F&B dining shifts, airport transfers |
| **`[slug].localhost:3000`**| Local Dev | `proxy.ts` Edge Rewrite | Local tenant direct booking preview |
| **`yoonie.si`** | Production | Default Next.js App | **Platform Showcase**: Multi-property directory & hotel owner workspace onboarding |
| **`localhost:3000`** | Local Dev | Default Next.js App | Platform root development |

---

## Operational Modules Summary

### 1. Direct Guest Booking Engine
- Direct booking without high OTA commission fees (15–25% saved).
- Atomic 15-minute holding locks (`POST /api/inventory/hold`) protecting bookable inventory from overbooking during guest checkout.
- Automated background sweeper running every 60 seconds to release abandoned carts.

### 2. Back-of-House Operations (`ops.yoonie.si`)
- **Protected Layout Architecture**: Enforced through `ProtectedLayoutClient`, ensuring unauthenticated users are redirected cleanly to `/login`.
- **05:30 Morning Dispatch Run-Sheet**: Automated air-traffic control evaluating room logistics, airport flight arrival doors, and tour minimum viable capacity thresholds (`minViablePax`).
- **Front-Desk Zero Housekeeping**: Dynamically prioritized cleaning board (`DIRTY` ➔ `IN_PROGRESS` ➔ `CLEAN` ➔ `INSPECTED`) ensuring rooms for early arriving VIP guests are turned around first.
- **Property CMS (`/admin`)**: Cloudflare R2 image manager, room key catalog, F&B shift definitions, and experience catalog.
