# API Types and React Query Standard

This project keeps backend Nest DTOs/interfaces as the source of truth and mirrors public wire contracts in the frontend.

## Frontend Types

- Put shared API envelope/error contracts in `lib/types/api`.
- Put each module's public request, response, and query-param types in `lib/types/<module>`.
- Export each module through `lib/types/<module>/index.ts`.
- Prefer names that match the backend DTO intent:
  - `<Action>Body` for JSON request bodies.
  - `<Action>Params` for query-string parameters.
  - `<Resource>` or `<Action>Result` for response data.
- Avoid adding feature-local API types inside views or view models.

## Frontend Domain APIs

- Keep transport helpers in `lib/domain/api`.
- Put each module's request functions and React Query hooks in `lib/domain/<module>`.
- Feature modules must import React Query hooks from `lib/domain/<module>`, not raw request functions.
- UI and view-model code must import public data contracts from `lib/types/<module>`, not from domain API files.
- Raw request functions such as `listProducts`, `createLead`, or `updateRoom` are hook internals. Keep them in domain files for query/mutation implementations, but do not import them from `modules/**` or `app/**`.
- Raw request functions may stay exported only when needed by infrastructure code such as auth/session setup or OAuth navigation metadata.
- Query keys must live beside the module hooks and be stable arrays, for example `["payment", "plan"]`.
- Mutations must invalidate or update the affected module query keys after success.

## React Query

- Mount a single `QueryClientProvider` from `providers/query-provider.tsx` at the app root.
- Use conservative defaults for starters: low retry count, no refetch on window focus, and short stale times for user/payment/admin reads.
- Use `useQuery` for GET-style reads and `useMutation` for writes/actions.
- Keep redirects and browser-only side effects in view models/components, not in raw request functions.

## Backend Contracts

- Do not add backend `lib/types`.
- Keep Nest request DTOs under `src/<module>/dto`.
- Keep shared backend interfaces under `src/common/interfaces`.
- When changing a controller response shape, update the matching frontend `lib/types/<module>` type in the same branch.
- Public responses continue to use the Nest transform envelope: `{ success, statusCode, data, timestamp }`.

## Conventions to Prevent Template Drift

Template branches must stay consistent with `main`. Past drift caused build failures:

- `lib/domain/api/NetworkConfig.ts` must not throw when `NEXT_PUBLIC_API_BASE_URL` is unset. Warn and fall back to `http://localhost:8080/api` instead. Throwing breaks `next build` (static prerender of pages such as `/login`) and crashes consumers out of the box.
- Keep `lib/domain/api/NetworkConfig.ts` in sync with `main`; template branches must not reintroduce the throw.

## Branch Rule

Apply this standard to `main` and every template branch before publishing a Yulio starter through the CLI.
