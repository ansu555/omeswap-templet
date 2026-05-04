# Marketplace Design Map

Last updated: 2026-05-04

This document maps the current marketplace UX to files and implemented behavior.

## Marketplace Home

Route: `app/(app)/marketplace/page.tsx`

Uses:

- `components/marketplace/strategy-card-v2.tsx`
- `components/marketplace/indicator-card.tsx`
- `/api/marketplace/featured`
- `/api/marketplace/strategies`
- `/api/marketplace/indicators`

Current UX:

- tabs for strategies and indicators
- search
- sort
- pricing/risk/win-rate/asset/regime filters
- featured sections
- responsive filter sheet/sidebar
- strategy cards enriched with activation and PnL placeholders where available

## Strategy Detail

Route: `app/(app)/marketplace/strategies/[id]/page.tsx`

Backed by:

- `GET /api/marketplace/strategies/[id]`
- `GET /api/marketplace/strategies/[id]/access`
- `POST /api/marketplace/strategies/[id]/purchase`
- `POST /api/activations`

Design intent:

- show strategy metadata, creator, risk level, tags, asset pairs, public summary, and version status
- show buy/activation affordances based on access and pricing
- preserve private implementation details

## Indicator Detail

Route: `app/(app)/marketplace/indicators/[id]/page.tsx`

Backed by:

- `GET /api/marketplace/indicators/[id]`
- `GET /api/marketplace/indicator-versions/[versionId]`

Design intent:

- show indicator metadata and usage context
- expose version payload only as allowed by current API
- support indicator selection as strategy dependencies in the builder

## Creator Dashboard

Route: `app/(app)/creator/page.tsx`

Backed by:

- `GET /api/creator/dashboard`
- creator strategy and indicator routes

Current UX:

- wallet-required dashboard
- metrics for strategies, indicators, activations, purchases, and earnings
- strategy and indicator tables
- status badges
- entry points to create/publish

## Agent Builder

Route: `app/(builder)/agent-builder/page.tsx`

Key components:

- `TopBar`
- `NodePalette`
- `FlowCanvas`
- `ConfigPanel`
- `AgentSidebar`
- `ChartPanel`
- `WorkflowManager`
- `PublishModal`

Current UX:

- full-screen canvas in a framed builder shell
- node palette and config panel
- AI sidebar can generate blocks and connections
- top bar supports strategy or indicator publish mode through `?mode=indicator`
- chart and backtest panels are available from builder controls

## Admin

Route: `app/(app)/admin/page.tsx`

Backed by:

- `/api/admin/strategies`
- `/api/admin/strategies/[id]/approve`
- `/api/admin/strategies/[id]/pause`
- `/api/admin/strategies/[id]/delist`
- `/api/admin/indicators/[id]/pause`
- `/api/admin/reports`
- `/api/admin/reports/[id]/resolve`

Admin access is controlled by wallet address through `ADMIN_WALLETS`.

## Design Principles

- Marketplace cards should show enough performance/risk/access context to decide whether to inspect a listing.
- Strategy detail must describe behavior without leaking private payloads.
- Creator tools should keep draft, validate, backtest, and publish as separate explicit steps.
- Admin actions should be reversible where possible and always auditable.
- Paid strategy UX must make chain, recipient, and purchase state clear before live monetization.

## Known UX Gaps

- Some data fields are placeholders until alpha-score and paper/live execution aggregation mature.
- More explicit empty states are needed when Supabase is not configured.
- Purchase flow should show token/amount-specific confirmation once verification is hardened.
- Creator profile pages are not yet a full public surface.
