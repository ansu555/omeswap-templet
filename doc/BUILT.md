# Built Inventory

Last updated: 2026-05-04

This document tracks what is present in the repo today. It avoids the older aspirational language that implied all product concepts were fully production-ready.

## Frontend App

Implemented in the root Next.js app:

- Landing page: `app/(landing)/page.tsx`, `components/landing/*`, shared footer/layout components.
- Main app shell: `app/(app)/layout.tsx`, wallet provider, onboarding guard, disconnect overlay, chat provider, global chat panel.
- Onboarding/risk profile: `app/(userform)/onboarding/page.tsx`, `app/api/onboarding/route.ts`, `lib/onboarding/*`, `components/onboarding/*`, `supabase/migrations/20260424_create_user_risk_profiles.sql`.
- Trade page: `/trade` with 0G DEX swap card, Ethereum Uniswap card, liquidity panel, history toggle.
- Terminal: `/terminal` standalone dense trading layout with token list, chart, order book, trade panel, and footer.
- Explore: `/explore` token/pool/transaction explorer backed by `/api/crypto` and `/api/dex/*`.
- Portfolio and token analysis: `components/portfolio/*`, `components/token*/*`, `app/api/token/[id]/*`.
- Marketplace: strategy/indicator listings, featured sections, detail pages, purchases, bookmarks, reports.
- Creator dashboard: creator strategy/indicator views, dashboard stats, publish workflow entry points.
- Admin: strategy, indicator, and report moderation routes and page.

## Agent Builder

Implemented in the root app:

- Page and shell: `app/(builder)/agent-builder/page.tsx`.
- Canvas UI: `components/agent-builder/canvas/*`.
- Node palette/config/chart/sidebar/toast/workflow manager.
- Node runtime: `lib/agent-builder/nodes/*`.
- Engine: `BotRunner`, `BacktestRunner`, `IndicatorCompiler`.
- Built-in indicators: `lib/indicators/builtins/*`.
- Store: `store/agent-builder.ts`.
- AI-assisted block generation: `/api/agent-builder/chat`, `/api/agent-builder/agent`.
- Publish support for strategy and indicator modes.

Current limitations:

- Workflow persistence is mostly localStorage/Zustand for the canvas.
- Some agent chat prompts still mention Avalanche defaults and should be updated during the next builder pass.
- 0G Storage sealing is wired into marketplace publish, not every local builder save.

## Marketplace

Implemented:

- Supabase schema with creators, strategies, versions, indicators, dependencies, activations, decision receipts, bookmarks, reports, admin actions, backtests, alpha scores.
- Pricing and purchases migration with `strategy_purchases`.
- Server-side Supabase admin client.
- Wallet-header auth via `x-wallet-address`.
- Public list/detail APIs for strategies and indicators.
- Creator CRUD, validation, backtest, publish, and dashboard APIs.
- Admin approve/pause/delist/report routes.
- Paid strategy purchase verification on 0G via viem.
- Private strategy sealing: AES-256-GCM + 0G Storage root hash + marker payload in Supabase.
- Public human summary generation through sealed 0G Compute.

Current limitations:

- Live alpha scoring is skeletal and reads from available receipt data.
- Paper/live execution analytics need deeper persistence and aggregation.
- Purchase verification checks successful recipient payment, but token/amount-specific verification should be tightened before production monetization.

## 0G And Chain Layer

Implemented:

- `lib/chain-registry/chains/zerog.ts` as default 0G Newton Testnet config.
- `lib/chain-registry/chains/ethereum.ts` registered for Ethereum mainnet.
- `lib/chain-registry/chains/avalanche.ts` retained for compatibility.
- Registry helpers for tokens, routers, supported chains, and explorer links.
- 0G Storage wrapper.
- 0G Compute wrapper.
- 0G DA wrapper.
- Private strategy encryption/upload/download layer.

Current limitations:

- 0G DEX router and token addresses in `zerog.ts` include placeholders.
- The optional `@0glabs/0g-ts-sdk` is dynamically imported and must be installed when using real 0G Storage uploads.

## ATS Backend

Implemented under `ats/`:

- Phase 0 foundation: settings, models, queues, Redis/Postgres helpers, FastAPI skeleton.
- Phase 1 data ingestion: Binance WebSocket, CoinGecko poller, NewsAPI poller, DeFiLlama/on-chain watcher, normalizer.
- Phase 2 regime detection: HMM wrapper, feature builder, funding rate reader, training script.
- Phase 3 signal agent: sentiment buffer, FinBERT-style sentiment module, technicals, combiner.
- Phase 4 graph agent: static protocol graph, propagation, secondary token queueing.
- Phase 5 risk agent: Kelly sizing, portfolio reader, ten-rule veto evaluator.
- Phase 6 orchestrator: LangGraph pipeline, consensus, receipt writer.
- Phase 7 execution agent: order routing, DEX client, fill monitor, portfolio updater, stop-loss monitor.
- Phase 8 API/conversation: FastAPI routes, WebSocket manager, receipt-aware chat.

Validation files:

- `tests/test_phase1.py`
- `scripts/test_phase2.py`
- `scripts/test_phase3.py`
- `tests/test_phase4.py`
- `tests/test_phase5.py`
- `tests/test_phase6.py`
- `tests/test_phase7.py`
- `tests/test_phase8.py`
- `tests/test_integration.py`

## Standalone Sub-App

`avax-agent/` is a standalone Next.js app with its own builder canvas and OpenRouter-backed assistant route. It is retained separately from the root app's integrated `/agent-builder`.

## Generated Knowledge Graphs

Generated Graphify outputs exist at:

- `graphify-out/`
- `graphify-meta/`
- nested `graphify-out/` folders under app/component/lib areas

These are useful for architecture exploration but are not the source of truth for current docs.
