# Yoonie — System Architecture & Multi-Tenancy Blueprint

Comprehensive architectural specification for the **Yoonie Unified Hospitality Operating System**, detailing both frontend (Next.js 16 App Router) and backend (NestJS + MongoDB) tiers, subdomain routing, security contracts, and modular MVVM design.

---

## 1. High-Level System Architecture

Yoonie is composed of four decoupled subsystems operating across a multi-tenant boundary:

```
                                  ┌───────────────────────────────┐
                                  │      Client Web / Mobile      │
                                  └───────────────┬───────────────┘
                                                  │
                  ┌───────────────────────────────┼───────────────────────────────┐
                  ▼                               ▼                               ▼
       [tenant].yoonie.app                  ops.yoonie.app                      yoonie.app
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

## 2. Multi-Tenant Subdomain Routing (`proxy.ts`)

In Next.js 16, `middleware.ts` has been deprecated and superseded by `proxy.ts` with `export function proxy(request: NextRequest)`. Yoonie utilizes `proxy.ts` at the edge to inspect incoming `Host` headers and dynamically route requests:

### Subdomain Resolution Rules

| Inbound Host | Path | Edge Rewrite / Action | Destination Route |
| :--- | :--- | :--- | :--- |
| `[slug].yoonie.app` or `[slug].localhost` | `/` | Pass-through (`next()`) | Direct Hotel Booking at `/` via server `headers()` |
| `[slug].yoonie.app` or `[slug].localhost` | `/account` | Pass-through (`next()`) | Guest account portal |
| `ops.yoonie.app` or `ops.localhost` | `/` | Rewrite | `/ops/dispatch` (Operations Hub) |
| `ops.yoonie.app` or `ops.localhost` | `/login`, `/register` | Pass-through (`next()`) | Authoritative Authentication Pages |
| `ops.yoonie.app` or `ops.localhost` | `/ops/*`, `/admin/*` | Pass-through (`next()`) | Protected Operator Shell |
| `yoonie.app` or `localhost` | `/` | Pass-through (`next()`) | Platform Homepage & Property Directory |
| Any Domain | `/api/:path*` | Next.js Reverse Proxy | `http://localhost:8080/api/:path*` (Same-Origin) |

### Implementation in `proxy.ts`

```typescript
// proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // 1. Skip static assets, internal next routes, and public assets
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

  // 3. Tenant Direct Booking & Platform Root
  // Handled natively at / in app/page.tsx via host header inspection.
  // No artificial pathnames or internal folder rewrites.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

---

## 3. Frontend Architecture & Modular MVVM

The frontend codebase is organized strictly into feature modules following Model-View-ViewModel (MVVM) separation:

```
yoonie-frontend/
├── app/                        # Next.js 16 App Router (Routing & Layouts only)
│   ├── (auth)/                 # Login & Register route views
│   ├── (protected)/            # Generic protected layouts
│   ├── admin/                  # Property CMS Layout & Pages
│   │   ├── layout.tsx          # Wrapped with ProtectedLayoutClient + OpsNavbar
│   │   └── page.tsx            # Admin CMS page
│   ├── ops/                    # Operations Route Group
│   │   ├── layout.tsx          # Wrapped with ProtectedLayoutClient + OpsNavbar
│   │   ├── dispatch/page.tsx   # Dispatch run-sheet view
│   │   └── housekeeping/page.tsx # Digital housekeeping board
│   ├── stay/[slug]/page.tsx    # Tenant direct-booking page
│   ├── layout.tsx              # Root HTML, Providers & Guest Navbar
│   └── page.tsx                # Platform landing page
├── modules/                    # Feature Modules (MVVM)
│   ├── admin/                  # Admin CMS Views, ViewModels & Panels
│   │   ├── components/         # RoomInventoryPanel, ExperiencePanel, etc.
│   │   ├── view/               # AdminCmsView.tsx
│   │   └── viewModel/          # adminCmsVm.ts
│   ├── auth/                   # Identity & Session Management
│   │   ├── ProtectedLayoutClient.tsx # Idiomatic auth-guard wrapper
│   │   ├── view/               # LoginPageView.tsx, RegisterPageView.tsx, RequireAuthView.tsx
│   │   └── viewModel/          # loginPageVm.ts, requireAuthVm.ts
│   ├── layout/                 # Global UI & Header components
│   │   ├── Navbar.tsx          # Guest / Platform Navbar (auto-hidden on ops)
│   │   ├── OpsNavbar.tsx       # Dedicated Operator Navbar with 3 Tabs & Profile
│   │   └── AccountSuspendedBanner.tsx
│   └── ops/                    # Operational Modules
│       ├── dispatch/           # Dispatch KPI cards, run-sheet table, filters
│       └── housekeeping/       # Room cards, cleaning status transitions
├── lib/
│   ├── domain/                 # API Clients & React Query hooks
│   │   ├── api/                # NetworkManager, TokenStore, NetworkConfig
│   │   ├── auth/               # auth-api.ts, session-storage.ts
│   │   ├── dispatch/           # dispatch-api.ts
│   │   ├── inventory/          # inventory-api.ts
│   │   ├── room/               # room-api.ts
│   │   └── user/               # user-api.ts
│   └── types/                  # Shared TypeScript interfaces
└── providers/                  # Context Providers (AuthProvider, ReactQueryProvider)
```

### Route Protection Architecture (`ProtectedLayoutClient`)

Instead of embedding monolithic sign-in screens into pages, routes requiring authentication use `ProtectedLayoutClient`:

```tsx
// app/ops/layout.tsx
import * as React from "react";
import { ProtectedLayoutClient } from "@/modules/auth/ProtectedLayoutClient";
import { OpsNavbar } from "@/modules/layout/OpsNavbar";

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayoutClient>
      <div className="min-h-screen bg-[#F8F5EE] text-[#303A36] flex flex-col font-sans">
        <OpsNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedLayoutClient>
  );
}
```

#### How `ProtectedLayoutClient` Works:
1. Calls `useRequireAuthVm()`, which inspects `{ user, ready }` from `AuthProvider`.
2. While `!ready`, renders a seamless loading state (`Restoring session…`).
3. If `ready && !user`, triggers `router.replace("/login")`.
4. If `user.isSuspended`, displays `AccountSuspendedBanner`.
5. If authenticated, cleanly renders `children`.

---

## 4. Backend NestJS Modular Architecture

The backend (`yoonie-backend`) is built on NestJS 10 and Express, structured around 14 bounded context modules:

```
yoonie-backend/src/
├── app.module.ts               # Root module importing all domain modules
├── main.ts                     # NestJS bootstrap, CORS, validation pipes
├── auth/                       # AuthModule (Local, JWT, Refresh Tokens, Google SSO)
├── branch/                     # BranchModule (Multi-tenant property config & rules)
├── room/                       # RoomModule (Keys, housekeeping turnaround, amenities)
├── restaurant/                 # RestaurantModule (Dining outlets, shifts, tables)
├── service/                    # ServiceModule (Tours, excursions, airport transfers)
├── inventory/                  # InventoryModule (Atomic slots, holds, automated sweeper)
├── order/                      # OrderModule (Composite carts, bookings, revenue tracking)
├── dispatch/                   # DispatchModule (05:30 morning run-sheet engine)
├── staff/                      # StaffModule (Driver & housekeeper frontline mobile API)
├── devices/                    # DevicesModule (FCM push notification tokens)
├── notifications/              # NotificationsModule (SMS, Email, Line messaging)
├── audit/                      # AuditModule (Compliance & access logging)
├── mongo-client/               # Database connection provider
└── seed/                       # Database seeding service & CLI
```

### 9 Core MongoDB Collections

1. `branches`: Property tenant configuration (name, slug, currency, timezone, tax rates, checkout rules).
2. `users`: Unified identity for guests and staff (roles: `GUEST`, `STAFF`, `DISPATCHER`, `BRANCH_MGR`, `ADMIN`).
3. `rooms`: Physical room keys (`101`, `102`) with cleaning status (`DIRTY`, `IN_PROGRESS`, `CLEAN`, `INSPECTED`).
4. `restaurants`: F&B outlets, seating zones, and meal shifts (`BREAKFAST`, `ALL_DAY`, `EVENING`).
5. `services`: Experience catalog (tours, boat excursions, spa, airport fleet transfers).
6. `inventory_slots`: Bookable capacity per date and time slot with atomic counters.
7. `inventory_holds`: 15-minute temporary hold locks preventing double-booking during checkout.
8. `orders`: Composite multi-item guest reservations spanning rooms, dining, and transfers.
9. `operational_dispatches`: Daily morning run-sheet tasks generated for frontline staff.

---

## 5. Security & Authentication Flow

### Token Architecture
- **Access Token**: Short-lived JWT (15 minutes), held in-memory via `tokenStore.ts` and synced with `localStorage` (`oneforall_session_v1`). Sent via `Authorization: Bearer <token>`.
- **Refresh Token**: Long-lived token (7 days), exchanged automatically on HTTP 401 via `NetworkManager.ts`.
- **Session Expired Handler**: If refresh fails or token is revoked, automatically invokes `clearClientSession()` and redirects the user to `/login`.

### Single Authoritative Login
- Single login screen at `/login` with Mascot branding and 1-click dev presets:
  - **Kanya Srisuk**: Hotel Owner / Admin (`ADMIN` ➔ redirects to `/ops/dispatch`)
  - **Anan Boonmee**: General Manager (`BRANCH_MGR` ➔ redirects to `/ops/dispatch`)
  - **Eleanor Whitfield**: VIP Direct Guest (`GUEST` ➔ redirects to `/account`)
- Intelligent post-login routing:
  - If `next` query parameter is present (e.g., `?next=/ops/housekeeping`), routes to that specific URL.
  - If operator role or on `ops.` host, defaults to `/ops/dispatch`.
  - If guest, defaults to `/account`.
