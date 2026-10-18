# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2026-05-04]

### Added

- **Hotel template frontend** (`template/hotel-v2` branch) — full guest-facing storefront and admin panel:
  - **Rooms** — public room/suite catalog with type, capacity, amenities, and image gallery; admin CRUD.
  - **Bookings** — reservation flow with seasonal pricing, conflict detection, and confirmation codes; guest + admin routes.
  - **Reviews** — guest review submission (gated to checked-out stays) with admin approval flow.
  - Admin panel uses shadcn/ui tables throughout; layout aligned with `hotel-v2` pattern.
- **CRM template frontend** (`template/crm-v2` branch) — DriveNow Motors used car dealership storefront:
  - **Inventory** — public vehicle showroom with filterable listing (make, model, year, price, status); admin CRUD.
  - **Leads** — customer inquiry form (public) and admin pipeline with status, source, assignment, and notes.
  - **Appointments** — test drive scheduling; admin-only CRUD linked to lead and vehicle records.

### Changed

- **Global light mode** — light mode enforced across all pages; removed per-page dark-mode overrides.
- **Navbar** — single consistent white glass navbar (`backdrop-blur`, `bg-white/80`); sticky on all pages, transparent-over-hero only on `/`. All page-specific navbar logic removed.
- **Admin layout** — shadcn/ui `Table` components replace custom HTML tables in admin panels.

### Fixed

- **Conflicting route segments** — `(protected)` route group entries that shadowed storefront pages removed.
- **Admin redirect in render** — `router.replace()` moved into `useEffect` to prevent `setState during render` React error.
- **Broken hero image** — dead Unsplash URL replaced with a working hosted asset.
- **Table cell spacing** — `px-4 py-3` padding applied consistently across admin table cells.

---

## [2026-04-19]

### Added

- **Payment & subscription flow**: Stripe-backed plan management via three new backend endpoints (`GET /payment/plan`, `POST /payment/checkout`, `POST /payment/billing-portal`). Domain layer in **`lib/domain/payment/paymentApi.ts`** (`getUserPlan`, `createCheckoutSession`, `createBillingPortalSession`, `PRICE_IDS`). Types `PaymentPlanId`, `UserPlan`, `CheckoutSession`, `BillingPortalSession` live in **`lib/types/payment`**.
- **`/pricing` page** (`app/(protected)/pricing`): three-column plan cards (Free / Pro $19/mo / Lifetime $299) with active-plan highlight, correct per-state button logic (subscribe → Stripe checkout, manage → billing portal, active → disabled), and inline error display. MVVM: `pricingPageVm.ts` + `PricingPageView.tsx`.
- **Plan card on `/account`**: **`modules/account/components/PlanCard.tsx`** shows current plan, renewal date or "Lifetime access", and a "Manage billing →" button (hidden for free users). Polls `GET /payment/plan` every 2 s (up to 10 s) when returning from Stripe via `?payment=success`.
- **`/pro-demo` page** (`app/(protected)/pro-demo`): investor-demo gated page — blurred content + upgrade CTA for free users; full content for pro/lifetime. MVVM: `proDemoPageVm.ts` + `ProDemoPageView.tsx`.
- **Navbar "Plan" link**: visible to all authenticated users, links to `/pricing`.
- **Homepage "View plans" CTA**: secondary button in the hero alongside Sign in / Register.
- Route constants `routes.pricing` and `routes.proDemo` added to **`lib/config/routes.ts`**.

## [2026-04-12]

### Added

- **Admin account moderation** (`/admin/moderation`): authenticated **`role: admin`**, not suspended; **`AdminLayoutClient`** + **`useRequireAdminVm`** redirect others to **`/account`**. Table UI lists **`GET /api/admin/moderation/users`** with search, suspended filter, pagination, **suspend** (optional reason modal) and **unsuspend** (confirm), wired through **`lib/domain/admin/moderation-api.ts`**. Types **`ModerationUser`** / **`ModerationUserListResult`** live in **`lib/types/admin`**; route constant **`routes.adminModeration`** in **`lib/config/routes.ts`**. Navbar shows **Admin** when `user.role === "admin"` and **`!user.isSuspended`**.
- **`AccountSuspendedBanner`** on protected routes; **`User`** includes **`isSuspended`**, **`suspensionReason`**, **`suspendedAt`** (aligned with Nest **`IUserPublic`**). Persisted session read path normalizes missing suspension fields for older localStorage payloads.

### Changed

- **Suspended accounts (pair with Nest [2026-04-12])**: login/OAuth/refresh succeed; blocked API calls return **`403`** + **`Account suspended`** by default. **`ApiError.isAccountSuspended`** is set for **401** or **403** with that message; the client **no longer** clears the session or redirects via **`setAccountSuspendedHandler`** (removed). **`NetworkManager`** treats suspension as a normal authorization failure after token refresh logic.
- **`logoutRequest`**: Sends the **Bearer access token** again (not `isPublic`). **`POST /auth/logout`** is JWT-protected on the API; if the access JWT is expired, **`NetworkManager`** refreshes once and retries the logout call automatically.
- **`useRequireAdminVm`** / Navbar: suspended users are not treated as admins in the UI (**`/admin`** hidden; redirect from admin layout). **`ApiStatusCodes.FORBIDDEN`** (**403**) title mapping added.

## [2026-04-11]

### Added

- **Login page**: `Suspense` + `useSearchParams` show an amber notice when `?suspended=1` (optional deep link; primary suspended UX is in-app per **[2026-04-12]**).

### Fixed

- **Access-token refresh**: silent refresh now keys off the API **`message`** for expired JWTs (`jwt expired`), matching Nest `JwtGuard` behavior, instead of unused `code` / `error` fields or a generic `"Unauthorized"` string.

### Changed

- **`NetworkManager`**: dropped `code` / `error` body matching for `shouldAttemptTokenRefresh`; detection uses **`message`** (plus optional `WWW-Authenticate` for other stacks) only.
- **`ApiErrorBody`**: aligned with the wire shape from `HttpExceptionFilter` only (`success`, `statusCode`, `message`, `path`, `timestamp`); removed optional `code` and related auth code constants/types.

### Notes

- Pair with the Nest template’s **`JwtGuard.handleRequest`**: expired access token → `message: "jwt expired"`; bad/missing bearer JWT → `message: "invalid access token"`; login failures keep explicit messages such as `Invalid email or password`.
