# Yoonie Frontend

The direct-channel booking engine, administrative management portal, and operational suite for **Yoonie — Unified Hospitality Operating System**.

This repository is built with **Next.js 16 (App Router)**, **React 18/19**, **Tailwind CSS v4**, **Radix UI / Shadcn Primitives**, and **TanStack React Query**, communicating with [`yoonie-backend`](../yoonie-backend) and Cloudflare R2 object storage.

---

## Architecture & Product Modules

```
yoonie-frontend/
├── app/
│   ├── (auth)/             # Login, register, oauth callbacks
│   ├── admin/              # Property management portal (CMS)
│   ├── ops/
│   │   ├── housekeeping/   # Front-desk zero digital board
│   │   └── dispatch/       # Daily run-sheet & shuttle dispatch
│   ├── layout.tsx          # Root layout with providers & spotlight tour
│   └── page.tsx            # Guest direct-booking landing page
├── modules/
│   ├── admin/              # Admin CMS views, panels, and viewModels
│   ├── home/               # Booking engine, catalog cards, & detail modals
│   ├── ops/                # Operational dispatch & housekeeping boards
│   └── layout/             # Navigation bars & brand headers
├── components/
│   ├── media/              # Cloudflare R2 image upload dropzone
│   ├── mascot/             # Yoonie mascot character assets & emotions
│   ├── onboarding/         # Bank-app style spotlight coachmark tour
│   └── ui/                 # Shadcn & Radix design system components
├── lib/
│   ├── domain/             # API services & React Query mutation hooks
│   └── types/              # Domain models (hospitality, storage, user)
```

---

## Key Features & Capabilities

### 1. Direct-Channel Guest Booking Engine (`/`)
- **Sanctuary Catalog**: Live room rates, real-time availability checks, and capacity badges.
- **5-Star Detail Modals**: Guests can inspect high-resolution photography, room size (`sqm`), bed configurations, river/garden views, luxury amenity checklists, and cancellation terms.
- **Composite Booking Cart**: Single-checkout cart combining room nights, dining reservations, airport transfers, and excursions.
- **Atomic Inventory Holds**: 15-minute holding lock (`POST /api/inventory/hold`) preventing double-bookings while guests fill checkout details.

### 2. Admin Property CMS (`/admin`)
- **Property Settings**: Brand logo and hero photography upload via Cloudflare R2, address, contact, tax rates, and checkout terms.
- **Physical Room Inventory**: Room number, floor level, category, nightly rack rate, max occupancy, and interactive amenities tag editor.
- **Dining Venues**: Meal shifts (breakfast, lunch, dinner slots), seating capacities, and table zone layout management.
- **Experience Catalog**: Tours, boat excursions, spa services, and airport transfers with pickup points, departure schedules, and minimum-viable pax thresholds.
- **Instant Photo Manager**: Direct attachment of high-resolution images to rooms, venues, and services with Cloudflare R2 cover-photo toggles and gallery deletion.

### 3. Housekeeping & Operational Dispatch (`/ops`)
- **Front-Desk Zero Housekeeping (`/ops/housekeeping`)**: Real-time room status board (`DIRTY` ➔ `IN_PROGRESS` ➔ `CLEAN` ➔ `INSPECTED`).
- **Airport & Tour Dispatch Run-Sheet (`/ops/dispatch`)**: Real-time vehicle manifests, driver assignments, flight numbers, airport terminal door assignments, and live status transitions.

### 4. Interactive Spotlight Coachmark Tour
- Bank-application style element highlighting with smooth viewport scrolling and dark backdrop spotlighting.
- Yoonie mascot interactive tips walking operators through property selection, inventory controls, and front-desk zero workflows.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.2 (App Router with Turbopack) |
| **UI Library** | React 18 / 19, Radix UI Primitives, Lucide Icons |
| **Styling** | Tailwind CSS v4, Class Variance Authority (`cva`), `tailwind-merge` |
| **State & Cache** | TanStack React Query v5 |
| **Media Storage** | Cloudflare R2 via Presigned URLs & Multipart Upload API |
| **Typography** | Inter & Outfit brand typography |

---

## Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **Backend API**: Running on `http://localhost:8080` (see `yoonie-backend`)

### 2. Environment Configuration
Create or verify `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Code Quality & Verification

Run the test and verification suite before opening pull requests:

```bash
# Linting & code standards
npm run lint

# Production Next.js build verification
npm run build
```

---

## Documentation Index

- [**`PRODUCT.md`**](./PRODUCT.md): Comprehensive hospitality operating system vision and target guest problems.
- [**`docs/FRONTEND_API.md`**](./docs/FRONTEND_API.md): Backend API contract, request/response DTOs, and error code mappings.
- [**`docs/SYSTEM_FLOWS.md`**](./docs/SYSTEM_FLOWS.md): Sequence diagrams for inventory locking, composite carts, and dispatch run-sheet generation.
- [**`docs/DATA_MODEL.md`**](./docs/DATA_MODEL.md): Entity relationship schemas and housekeeping state machines.
