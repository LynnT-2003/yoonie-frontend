# Yoonie Frontend

The direct-channel booking engine, administrative management portal, and operational suite for **Yoonie — Unified Hospitality Operating System**.

This repository is built with **Next.js 16.2 (App Router with Turbopack)**, **React 18/19**, **Tailwind CSS v4**, **Radix UI Primitives**, and **TanStack React Query**, communicating with [`yoonie-backend`](../yoonie-backend) and Cloudflare R2 object storage.

---

## Architecture & Product Modules

```
yoonie-frontend/
├── app/                        # Next.js 16 App Router (Layouts & Page entry points)
│   ├── (auth)/                 # Login & Register views
│   ├── (protected)/            # Generic protected layouts
│   ├── admin/                  # Property CMS (Wrapped with ProtectedLayoutClient + OpsNavbar)
│   ├── ops/                    # Operations Route Group (Dispatch & Housekeeping)
│   │   ├── dispatch/           # 05:30 Daily Dispatch Run-Sheet
│   │   ├── housekeeping/       # Digital Housekeeping Turnaround Board
│   │   └── layout.tsx          # ProtectedLayoutClient + OpsNavbar
│   ├── stay/[slug]/            # Tenant direct-booking engine (Multi-Tenant)
│   ├── layout.tsx              # Root HTML, TanStack Query, AuthProvider & Guest Navbar
│   └── page.tsx                # Platform showcase & hotel workspace onboarding
├── modules/                    # Feature Modules (MVVM Pattern)
│   ├── admin/                  # Admin CMS views, panels, and viewModels
│   ├── auth/                   # Identity, session storage, ProtectedLayoutClient
│   │   ├── ProtectedLayoutClient.tsx # Standardized route protection guard
│   │   ├── view/               # LoginPageView, RegisterPageView, RequireAuthView
│   │   └── viewModel/          # loginPageVm, requireAuthVm
│   ├── layout/                 # Global UI & Header components
│   │   ├── Navbar.tsx          # Guest / Platform Navbar (auto-hidden on ops)
│   │   ├── OpsNavbar.tsx       # Dedicated Operator Navbar with 3 Tabs & Profile
│   │   └── AccountSuspendedBanner.tsx
│   ├── ops/                    # Operational Dispatch & Housekeeping views/viewModels
│   └── home/                   # Booking engine, catalog cards, & detail modals
├── components/                 # Shared UI Components
│   ├── media/                  # Cloudflare R2 image upload dropzone
│   ├── mascot/                 # Yoonie mascot character assets & emotions
│   ├── onboarding/             # Interactive coachmark spotlight tour
│   └── ui/                     # Shadcn & Radix design system primitives
├── lib/
│   ├── domain/                 # API services & React Query mutation hooks
│   └── types/                  # Domain models (hospitality, storage, user)
├── proxy.ts                    # Next.js 16 Edge Proxy (Subdomain routing & rewrites)
└── providers/                  # Context Providers (AuthProvider, QueryProvider)
```

---

## Multi-Tenant Subdomain Routing (`proxy.ts`)

In Next.js 16, `middleware.ts` has been deprecated and replaced by **`proxy.ts`** exporting `export function proxy(request: NextRequest)`.

Yoonie inspects incoming `Host` headers at the edge to provide seamless multi-tenancy:

| Host / Subdomain | Target Experience | Edge Action |
| :--- | :--- | :--- |
| **`ops.yoonie.si`** / **`ops.localhost:3000`** | Central Operations Hub (`/ops/dispatch`) | Rewrites `/` to `/ops/dispatch`. Auth pages (`/login`, `/register`) pass through to single branded login. |
| **`[slug].yoonie.si`** / **`[slug].localhost:3000`** | Tenant Direct Booking Engine (`/`) | Resolved directly at `/` for the tenant property. No artificial pathnames or URL prefixes. |
| **`yoonie.si`** / **`localhost:3000`** | Platform Root | Platform landing page, property directory, and hotel workspace onboarding. |
| **`/api/*`** (All domains) | NestJS Backend API | Next.js reverse proxy rewrite to `http://localhost:8080/api/*` eliminating cross-origin preflight overhead. |

---

## Key Features & Capabilities

### 1. Direct-Channel Guest Booking Engine (`/` or `[tenant].localhost:3000`)
- **Sanctuary Catalog**: Live room rates, real-time availability checks, and capacity badges.
- **5-Star Detail Modals**: Guests can inspect high-resolution photography, room size (`sqm`), bed configurations, river/garden views, luxury amenity checklists, and cancellation terms.
- **Composite Booking Cart**: Single-checkout cart combining room nights, dining reservations, airport transfers, and excursions.
- **Atomic Inventory Holds**: 15-minute holding lock (`POST /api/inventory/hold`) preventing double-bookings while guests fill checkout details.

### 2. Back-of-House Operations (`ops.localhost:3000` or `/ops`)
- **Protected Layout Architecture**: All operational routes (`/ops/*`, `/admin/*`) are protected by `ProtectedLayoutClient`, ensuring unauthenticated users are seamlessly redirected to `/login`.
- **05:30 Morning Dispatch Run-Sheet (`/ops/dispatch`)**: Real-time vehicle manifests, driver assignments, flight numbers, airport terminal door assignments, and tour consolidation warnings for low-yield departures.
- **Front-Desk Zero Housekeeping (`/ops/housekeeping`)**: Real-time room status board (`DIRTY` ➔ `IN_PROGRESS` ➔ `CLEAN` ➔ `INSPECTED`) prioritized dynamically by incoming guest arrival ETAs and VIP scores.
- **Property CMS (`/admin`)**: Cloudflare R2 image upload manager, physical room key catalog, F&B shift configurations, and experience catalog.

### 3. Unified Identity & Single Authoritative Login (`/login`)
- Authoritative login screen with the Yoonie mascot and 1-click dev presets:
  - **Kanya Srisuk**: Hotel Owner / Admin (`ADMIN` ➔ routes to `/ops/dispatch`)
  - **Anan Boonmee**: General Manager (`BRANCH_MGR` ➔ routes to `/ops/dispatch`)
  - **Eleanor Whitfield**: VIP Direct Guest (`GUEST` ➔ routes to `/account`)
- Clean support for `?next=` parameter preserving operator navigation targets.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2 (App Router with Turbopack) |
| **Edge Proxy** | Next.js 16 `proxy.ts` (Dynamic subdomain routing) |
| **UI Library** | React 18 / 19, Radix UI Primitives, Lucide Icons |
| **Styling** | Tailwind CSS v4, Class Variance Authority (`cva`), `tailwind-merge` |
| **State & Cache** | TanStack React Query v5 |
| **Media Storage** | Cloudflare R2 via Presigned URLs & Multipart Upload API |
| **Backend API** | NestJS 10, Express, MongoDB / Mongoose (:8080) |
| **Typography** | Inter & Outfit brand typography |

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Backend API**: Running on `http://localhost:8080` (see `../yoonie-backend`)

### 2. Local Subdomain Setup (`/etc/hosts`)
For local multi-tenancy testing, add the following entry to your `/etc/hosts`:
```
127.0.0.1 ops.localhost riverside-bkk.localhost
```

### 3. Environment Configuration
Create or verify `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=/api
```

### 4. Install Dependencies & Run
```bash
npm install
npm run dev
```

- **Platform Root**: [http://localhost:3000](http://localhost:3000)
- **Operator Portal**: [http://ops.localhost:3000](http://ops.localhost:3000) (or port `3001` if port 3000 is occupied)
- **Tenant Direct Booking**: [http://riverside-bkk.localhost:3000](http://riverside-bkk.localhost:3000)

---

## Code Quality & Verification

```bash
# Code standards and lint verification
npm run lint

# Next.js build verification
npm run build
```

---

## Documentation Index

Comprehensive guides and architectural specifications are located in the [`/docs`](./docs) folder:

- [**`docs/ARCHITECTURE.md`**](./docs/ARCHITECTURE.md): Complete system architecture, Next.js 16 App Router & NestJS backend, edge proxy rules, and security model.
- [**`docs/SYSTEM_FLOWS.md`**](./docs/SYSTEM_FLOWS.md): Sequence diagrams for edge proxy resolution, authentication lifecycle, atomic inventory holds, 05:30 dispatch, and housekeeping.
- [**`docs/FRONTEND_API.md`**](./docs/FRONTEND_API.md): Exhaustive REST API contract with request/response schemas and TypeScript interfaces.
- [**`docs/DATA_MODEL.md`**](./docs/DATA_MODEL.md): MongoDB Entity-Relationship Diagram (ERD), collection definitions, and state machine lifecycles.
- [**`PRODUCT.md`**](./PRODUCT.md): Hospitality operating system vision and target guest experience.
