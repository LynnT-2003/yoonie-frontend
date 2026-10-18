# Yoonie Frontend

The direct-channel booking engine and operational portal for **Yoonie — Unified Hospitality Operating System**.

This repository is an SPA-style Next.js App Router client communicating directly via CORS with [`yoonie-backend`](../yoonie-backend).

---

## Documentation Index

- [**`PRODUCT.md`**](./PRODUCT.md): Product guide, core pillars, target user problems, and domain mappings.
- [**`docs/FRONTEND_API.md`**](./docs/FRONTEND_API.md): Complete backend endpoint references, DTO contracts, query parameters, and integration examples.
- [**`docs/SYSTEM_FLOWS.md`**](./docs/SYSTEM_FLOWS.md): Sequence diagrams for composite booking carts, atomic inventory holds, 05:30 AM dispatch generation, and housekeeping front-desk zero.
- [**`docs/DATA_MODEL.md`**](./docs/DATA_MODEL.md): ERD and state machine lifecycles (`Order`, `InventorySlot`, `Room`, `OperationalDispatch`).

---

## Architecture Principles

1. **MVVM (Model - View - ViewModel)**:
   - Pages in `app/` are thin routing entry points that instantiate a ViewModel hook (e.g. `useHomePageVm()`) and pass state to a pure View component (`HomePageView.tsx`).
2. **Domain Network Manager (`lib/domain/api/NetworkManager.ts`)**:
   - Central HTTP client handling Bearer JWT authentication, silent refresh token rotation, and unwrapping NestJS `{ success, statusCode, data }` envelopes.
   - Domain modules (`lib/domain/<feature>/`) expose feature-specific API methods and React Query hooks without coupling UI components to raw `fetch`.
3. **Atomic Inventory & Booking**:
   - Room nights, dining shifts, and experience services share one native booking model using atomic slot holds (`/inventory/hold`) and composite order confirmation (`/orders/:id/confirm`).

---

## Getting Started

### 1. Environment Configuration

Create or verify `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### 2. Development

Run the development server:

```bash
npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000). Ensure `yoonie-backend` is running concurrently on port 8080.

### 3. Build & Typecheck

```bash
npm run build
npm run lint
```
