# Marketplace Documentation

Last updated: 2026-05-04

The Omeswap marketplace lets creators publish strategies and indicators, lets users browse/buy/activate them, and gives admins moderation controls. The implementation is backed by Supabase, root Next.js API routes, and 0G private strategy storage.

## Documents

| Document | Purpose |
|---|---|
| [mvp.md](mvp.md) | Current MVP scope and what is actually implemented. |
| [full-implementation.md](full-implementation.md) | Current full implementation reference and remaining production gaps. |
| [ATS_Marketplace_Design.md](ATS_Marketplace_Design.md) | UI/page/component design map for the implemented pages. |

## Core Files

| Area | Files |
|---|---|
| Pages | `app/(app)/marketplace/page.tsx`, strategy/indicator detail pages, `app/(app)/creator/page.tsx`, `app/(app)/library/page.tsx`, `app/(app)/admin/page.tsx` |
| Components | `components/marketplace/*`, `components/creator/publish-wizard.tsx`, `components/agent-builder/*` |
| APIs | `app/api/marketplace/*`, `app/api/creator/*`, `app/api/activations/*`, `app/api/admin/*`, `app/api/receipts/*` |
| Libraries | `lib/marketplace/*`, `lib/supabase/server.ts`, `lib/zerog/private-strategy.ts` |
| Schema | `supabase/migrations/20260427120000_create_marketplace.sql`, `20260503000000_marketplace_payments.sql` |

## Current Marketplace Promise

- Public users can discover published strategies and indicators.
- Creators can draft, validate, backtest, and publish strategies and indicators.
- Published strategy logic is sealed: encrypted locally, uploaded to 0G Storage, and represented in Supabase by a root hash marker.
- Paid strategies can be purchased with an on-chain transaction verified by the server.
- Activations enforce strategy availability and live eligibility.
- Admins can approve, pause, delist, and resolve reports.

## Important Boundaries

- Wallet identity is currently passed with `x-wallet-address`.
- Supabase access uses a server-side service-role client only.
- Public marketplace reads tolerate missing Supabase configuration by returning empty lists.
- Creator writes, activations, purchases, and admin actions require Supabase env vars.
- The current purchase route verifies receipt success and recipient; token/amount-specific verification is still a production hardening item.
