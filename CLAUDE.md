# CLAUDE.md

This file gives coding agents the current operating map for this repository.

Last updated: 2026-05-04

## Commands

```bash
# Root Next.js app
npm install
npm run dev
npm run build
npm run start
npm run lint

# Python ATS API
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn ats.api.main:app --reload --host 0.0.0.0 --port 8000

# Dockerized ATS API + Redis
docker compose up redis api

# ATS tests
python -m pytest tests/test_phase1.py -v
python -m pytest tests/test_phase4.py tests/test_phase5.py tests/test_phase6.py -v
python -m pytest tests/test_phase7.py tests/test_phase8.py -v
```

`package.json` still contains Hardhat scripts that `cd ../Avalanche_contract`. Treat those as legacy unless the sibling repo exists. The root app now gets active chain/router data from `lib/chain-registry/`.

## Environment

Minimum Next.js local variables:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPEN_ROUTER_API_KEY=
```

Useful optional variables:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_TREASURY_WALLET=
ADMIN_WALLETS=0x...
OPENAI_API_KEY=
COINGECKO_API_KEY=
COINMARKETCAP_API_KEY=
STRATEGY_ENCRYPTION_KEY= # 64 hex chars, openssl rand -hex 32
ZEROG_COMPUTE_API_KEY=
```

ATS variables are defined in `ats/config.py`. Important ones include `REDIS_URL`, `DATABASE_URL`, `AGENT_WALLET_PRIVATE_KEY`, `RPC_URL`, `DEX_ROUTER_ADDRESS`, `ZEROG_STORAGE_RPC`, `ZEROG_COMPUTE_ENDPOINT`, and `ZEROG_DA_RPC`.

## Current Architecture

**Omeswap** is a Next.js 15 + Python platform for DEX trading, strategy building, strategy marketplace distribution, and a six-agent trading backend.

The current chain story is:

- **0G Newton Testnet** is the default chain target for Omeswap agent execution, marketplace purchases, 0G Storage, 0G Compute, and 0G DA helpers.
- **Ethereum mainnet** is registered for the swap UI and Uniswap-style routes.
- **Avalanche** code remains in config files and the standalone `avax-agent/` app, but it is compatibility/reference material rather than the default app chain.

## Route Groups

| Group | Path | Purpose |
|---|---|---|
| `(landing)` | `/` | Landing page. |
| `(app)` | `/trade`, `/portfolio`, `/explore`, `/transactions`, `/marketplace`, `/creator`, `/library`, `/admin`, token/pool details | Main wallet-gated app shell. |
| `(builder)` | `/agent-builder` | Visual bot workflow editor. |
| `(userform)` | `/onboarding`, `/userform` | Wallet onboarding and risk profile flow. |
| standalone | `/terminal` | Dense trading terminal outside the `(app)` shell. |

The `(app)` layout wraps children in `AvalancheWalletProvider` (compatibility export of `WalletProvider`), `OnboardingGuard`, `DisconnectOverlay`, `ChatProvider`, and the global chat panel. It exports `dynamic = "force-dynamic"` for wallet-dependent pages.

## API Routes

Key Next.js API groups:

- `/api/onboarding` stores and reads wallet risk profiles.
- `/api/crypto` aggregates CoinMarketCap, CoinGecko, GeckoTerminal, and Kryll data for explorer screens.
- `/api/dex/*` exposes markets, chart candles, depth, and trade streams for the terminal.
- `/api/token/[id]` and `/api/token/[id]/analysis` power token detail analysis.
- `/api/agent-builder/*` powers builder chat and streaming agent block generation.
- `/api/marketplace/*` lists strategies/indicators, featured sections, bookmarks, reports, purchases, access checks, and version detail.
- `/api/creator/*` owns strategy/indicator CRUD, validation, backtests, publishing, and dashboard stats.
- `/api/activations/*` manages user strategy activations, pause/evaluate/execute, and activation receipts.
- `/api/receipts/*` writes and reads trade/decision receipts.
- `/api/admin/*` gates moderation actions through `ADMIN_WALLETS`.

Wallet auth is header-based: `requireWallet()` reads `x-wallet-address` in `lib/marketplace/wallet-header.ts`.

## Chain Registry

`lib/chain-registry/` is the source of truth for chain config.

- `chains/zerog.ts`: default 0G Newton Testnet config, 0G protocol endpoints, placeholder 0G DEX routers/tokens, and OmeSwap contract placeholders.
- `chains/ethereum.ts`: Ethereum mainnet token and Uniswap config.
- `chains/avalanche.ts`: compatibility Avalanche config, not registered in `REGISTRY`.
- `index.ts`: registered chains and lookup helpers.

Do not hardcode chain IDs, explorer links, token addresses, or router addresses in components. Add or change them in the registry.

## 0G SDK Layer

Use `@/lib/zerog` wrappers:

- `storage.ts`: upload/download content-addressed blobs and agent memory helpers.
- `compute.ts`: 0G Compute inference and streaming inference.
- `da.ts`: data availability submissions for swarm messages and inference results.
- `private-strategy.ts`: AES-256-GCM strategy sealing, 0G Storage upload, unsealing, and public human summary generation through sealed 0G Compute.

Decision-critical AI calls should use sealed inference.

## Marketplace

Supabase migrations define creators, strategies, strategy versions, indicators, indicator versions, dependencies, activations, receipts, bookmarks, reports, admin actions, backtests, alpha scores, pricing fields, 0G root hashes, and strategy purchases.

Publishing flow:

1. Creator drafts graph payload.
2. `validateMarketplaceStrategyPayload()` checks required structure.
3. Indicator dependencies are collected from `subgraph_indicator` nodes.
4. Compiled payload is encrypted with `STRATEGY_ENCRYPTION_KEY`.
5. Ciphertext is uploaded to 0G Storage.
6. Supabase stores only `{ encrypted: true, rootHash }` plus `zerog_root_hash` and a human-readable summary.

Paid strategy flow:

1. Buyer broadcasts an on-chain payment to `NEXT_PUBLIC_TREASURY_WALLET`.
2. `/api/marketplace/strategies/[id]/purchase` verifies the receipt on 0G with viem.
3. The server records `strategy_purchases` and access checks read that row.

## Agent Builder

The main builder lives under `components/agent-builder/`, `lib/agent-builder/`, `store/agent-builder.ts`, and `types/agent-builder-canvas.ts`.

Core pieces:

- `NODE_REGISTRY` maps node type IDs to executable nodes.
- `BaseNode` defines `execute(inputs, context)`.
- Data nodes: price, wallet balance, DEX price, subgraph indicator.
- Logic nodes: condition, math, moving average, threshold, delay, variable, accumulator, previous value.
- Action nodes: swap, limit order, notification, chart marker.
- Flow nodes: start, end, merge, schedule trigger.
- `BotRunner` executes the DAG.
- `BacktestRunner` replays historical data.
- `IndicatorCompiler` compiles custom indicators.

Workflow persistence is currently Zustand/localStorage based.

## ATS Backend

Python package `ats/` implements:

- Agent 1 data ingestion and normalization.
- Agent 2 signal generation.
- Agent 3 graph propagation.
- Agent 4 regime detection.
- Agent 5 risk veto and sizing.
- Agent 6 execution, fill monitoring, portfolio updates, and stop-loss monitoring.
- LangGraph orchestrator.
- FastAPI app, WebSocket manager, activation/receipt/chat routes.

See `doc/ATS_Agent_Execution_Flow.md` and `doc/phases/index.md` for the current backend map.

## Sub-projects And Generated Files

- `avax-agent/` is a separate Next.js app. Do not import from it into the root app or from the root app into it unless explicitly refactoring that boundary.
- `graphify-out/`, nested `graphify-out/`, and `graphify-meta/` are generated graph/audit artifacts. Prefer updating hand-written docs in `doc/` and regenerate graph artifacts when needed.

## Conventions

- Use the `@/` path alias for root app imports.
- Use existing shadcn/ui and local component patterns.
- Keep service-role Supabase access server-side only.
- Keep strategy plaintext out of Supabase; use the private strategy layer.
- Keep 0G protocol access behind `lib/zerog/`.
- Do not introduce another `localStorage` polyfill; `next.config.ts` already injects the Node.js v25+ server shim.
