# Marketplace Full Implementation Reference

Last updated: 2026-05-04

This reference describes the implemented marketplace architecture and the remaining work needed to become production-grade.

## Objects

| Object | Purpose |
|---|---|
| Creator | Wallet-owned author profile and FK anchor for strategies/indicators. |
| Strategy | Public listing and draft metadata. |
| Strategy version | Immutable published graph version; may point to 0G Storage root hash. |
| Indicator | Creator-owned reusable indicator listing. |
| Indicator version | Immutable published indicator implementation/payload. |
| Dependency | Strategy-version to indicator-version link. |
| Activation | User instance of a strategy with limits and mode. |
| Decision receipt | Audit row for signal/risk/execution outcomes. |
| Bookmark | User saved strategy. |
| Report | User moderation report. |
| Admin action | Audit trail for moderation actions. |
| Backtest run | Stored backtest summary. |
| Alpha score | Aggregated performance summary. |
| Strategy purchase | Verified on-chain paid strategy acquisition. |

## Security Model

Current controls:

- Service-role Supabase client is server-only.
- Client wallet identity is passed through `x-wallet-address`.
- Admin operations check `ADMIN_WALLETS`.
- Private strategy graph payloads are encrypted before upload.
- 0G Storage root hash, not plaintext, is stored for published strategy versions.
- Paid purchases are verified on-chain before insert.

Production hardening needed:

- Signed wallet auth instead of plain header identity.
- Token and amount verification for purchases.
- Stronger audit logs around unsealing strategy payloads.
- Per-route rate limits.
- Full RLS policy review if moving more access to user-scoped Supabase clients.

## Private Strategy Layer

File: `lib/zerog/private-strategy.ts`

The strategy privacy layer:

1. Requires `STRATEGY_ENCRYPTION_KEY`.
2. Encrypts compiled graph JSON with AES-256-GCM.
3. Uploads bytes to 0G Storage with `uploadToStorage()`.
4. Returns a content root hash.
5. Stores only a marker payload in Supabase.
6. Can later unseal by downloading from 0G Storage and decrypting server-side.

Human summaries are generated from sanitized node labels and metadata via sealed 0G Compute. Summaries are meant for buyer evaluation, not strategy replication.

## Purchase Layer

File: `app/api/marketplace/strategies/[id]/purchase/route.ts`

Current flow:

1. Buyer sends `{ tx_hash }`.
2. Server reads strategy pricing metadata.
3. Server fetches transaction receipt from 0G RPC.
4. Receipt must have `status === "success"`.
5. Receipt recipient must match `NEXT_PUBLIC_TREASURY_WALLET`.
6. Server inserts `strategy_purchases`.

Needed before production:

- Verify expected token contract and transfer event.
- Verify amount and decimals.
- Verify payout wallet or split logic.
- Handle refunds/failures/disputes.

## Execution Boundary

The marketplace publishes and activates strategies. The ATS backend is responsible for signal/risk/execution decisions. A marketplace strategy should never bypass:

- activation limits
- live eligibility status
- Agent 5 risk veto
- receipt writing
- execution confirmation

## Pages

| Page | Purpose |
|---|---|
| `/marketplace` | Strategy and indicator discovery, filters, featured rows. |
| `/marketplace/strategies/[id]` | Strategy detail, access, purchase, activation context. |
| `/marketplace/indicators/[id]` | Indicator detail and version data. |
| `/creator` | Creator stats, strategy table, indicator table, earnings/purchases. |
| `/library` | User-owned or saved marketplace assets. |
| `/admin` | Moderation surface. |
| `/agent-builder` | Strategy/indicator authoring surface. |

## API Implementation Notes

- Optional reads use `tryCreateSupabaseAdminClient()` and schema-unavailable fallback.
- Mutations use `createSupabaseAdminClient()` and require configured Supabase env vars.
- Creator writes call `ensureCreator()` before FK-dependent inserts.
- Strategy validation lives in `lib/marketplace/validate-strategy.ts`.
- Risk category helpers are shared between onboarding and marketplace via `lib/marketplace/risk-check.ts` and `lib/onboarding`.

## Production Backlog

- Wallet signature login and session binding.
- Complete strategy execution runtime that unseals and runs private payloads safely.
- Better purchase verification.
- Alpha score jobs and reliable performance aggregation.
- Creator public pages.
- Notification system.
- Full moderation audit trail in UI.
- Marketplace analytics dashboard.
- Better test coverage for Next.js API routes with mocked Supabase and viem.
