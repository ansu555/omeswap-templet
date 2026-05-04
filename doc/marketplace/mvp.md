# Marketplace MVP

Last updated: 2026-05-04

This MVP doc describes the current marketplace behavior in the repo.

## In Scope

Implemented MVP capabilities:

- Browse public strategies and indicators.
- Filter/search strategies by status, risk, tag, asset, pricing, and sort mode.
- View strategy and indicator details.
- Create creator records automatically before strategy/indicator writes.
- Create and update strategy drafts.
- Validate strategy payloads.
- Backtest strategy drafts.
- Publish strategies as versions.
- Create, validate, and publish indicators.
- Track indicator dependencies in strategy versions.
- Store private strategy logic on 0G Storage instead of plaintext Supabase rows.
- Bookmark strategies.
- Report strategies/indicators.
- Buy paid strategies through on-chain receipt verification.
- Create activations in research/live modes.
- Gate live activation on `live_eligible` status.
- Admin approve/pause/delist strategy and pause indicator flows.
- Admin list/resolve reports.
- Creator dashboard for strategy/indicator stats, purchases, and earnings.

## Out Of Scope For MVP

Still not complete:

- Full paper-trading accounting.
- Full live PnL attribution and alpha scoring.
- Token/amount-level purchase verification.
- Rich creator profiles and public creator pages.
- Webhook/email notifications.
- Production marketplace search indexing.
- Full user-owned RLS flows; current APIs use service-role backend access.

## MVP Data Model

Defined in Supabase migrations:

- `creators`
- `strategies`
- `strategy_versions`
- `indicators`
- `indicator_versions`
- `strategy_indicator_dependencies`
- `activations`
- `decision_receipts`
- `bookmarks`
- `reports`
- `admin_actions`
- `backtest_runs`
- `alpha_scores`
- `strategy_purchases`

Payment migration also adds:

- `strategies.is_free`
- `strategies.price_amount`
- `strategies.price_token`
- `strategies.payout_wallet`
- `strategy_versions.zerog_root_hash`

## MVP API Surface

Marketplace:

- `GET /api/marketplace/featured`
- `GET /api/marketplace/strategies`
- `GET /api/marketplace/strategies/[id]`
- `GET /api/marketplace/strategies/[id]/access`
- `POST /api/marketplace/strategies/[id]/purchase`
- `GET /api/marketplace/indicators`
- `GET /api/marketplace/indicators/[id]`
- `GET /api/marketplace/indicator-versions/[versionId]`
- `GET|POST|DELETE /api/marketplace/bookmarks`
- `POST /api/marketplace/reports`

Creator:

- `GET /api/creator/dashboard`
- `GET|POST /api/creator/strategies`
- `GET|PATCH /api/creator/strategies/[id]`
- `POST /api/creator/strategies/[id]/validate`
- `POST /api/creator/strategies/[id]/backtest`
- `POST /api/creator/strategies/[id]/publish`
- `GET|POST /api/creator/indicators`
- `GET|PATCH /api/creator/indicators/[id]`
- `POST /api/creator/indicators/[id]/validate`
- `POST /api/creator/indicators/[id]/publish`

Activation and receipts:

- `GET|POST /api/activations`
- `PATCH /api/activations/[id]`
- `POST /api/activations/[id]/pause`
- `POST /api/activations/[id]/evaluate`
- `POST /api/activations/[id]/execute`
- `GET /api/activations/[id]/receipts`
- `POST /api/receipts`
- `GET /api/receipts/[id]`

Admin:

- `GET /api/admin/strategies`
- `POST /api/admin/strategies/[id]/approve`
- `POST /api/admin/strategies/[id]/pause`
- `POST /api/admin/strategies/[id]/delist`
- `POST /api/admin/indicators/[id]/pause`
- `GET /api/admin/reports`
- `POST /api/admin/reports/[id]/resolve`

## Publish Flow

1. Creator saves a draft.
2. Validation checks graph structure and required payload fields.
3. Publish collects indicator references from `subgraph_indicator` nodes.
4. All referenced indicator versions must exist and be published.
5. The compiled strategy graph is encrypted with AES-256-GCM.
6. The ciphertext is uploaded to 0G Storage.
7. Supabase stores marker payload `{ encrypted: true, rootHash }` and `zerog_root_hash`.
8. A public human summary is generated through sealed 0G Compute when possible.
9. Strategy status becomes `published`.

## Activation Rules

- `strategy_id` and `strategy_version_id` are required.
- `paused` and `delisted` strategies cannot be activated.
- Live mode requires `live_eligible` status.
- Research mode is allowed for available non-paused/non-delisted strategies.
- Defaults include 5 percent allocation, 2 percent max position, 3 max trades/day, 3 percent max daily loss, 75 bps slippage, and confirmation required.

## MVP Acceptance Criteria

- Marketplace can render without Supabase by showing empty lists.
- With Supabase configured and migrations applied, users can browse, create, publish, bookmark, report, and activate.
- Private strategy payloads do not land in Supabase as plaintext during publish.
- Paid purchase records are only inserted by the backend after on-chain receipt verification.
- Admin routes require an admin wallet.
