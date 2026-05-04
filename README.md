# Omeswap

Last updated: 2026-05-04

Omeswap is a hybrid DeFi application: a Next.js 15 trading interface, a visual agent-builder and marketplace, and a Python FastAPI backend for an agentic trading system. The current canonical chain target is **0G Newton Testnet** for agent execution and private strategy storage, with Ethereum mainnet support in the swap UI. Some Avalanche-era files and the standalone `avax-agent/` app still exist for compatibility and reference.

## What Is In This Repo

- **Root Next.js app**: landing page, wallet onboarding, DEX trade screen, terminal, explore, portfolio, token analytics, marketplace, creator dashboard, admin, and visual agent builder.
- **ATS backend**: Python package under `ats/` with data ingestion, signal, graph, regime, risk, orchestrator, execution, receipts, FastAPI routes, and WebSocket events.
- **Marketplace**: Supabase-backed strategy and indicator publishing, activation, purchases, bookmarks, reports, admin actions, and creator analytics.
- **0G integration**: chain registry for 0G + Ethereum, 0G Storage helpers, 0G Compute helpers, 0G DA helpers, and private strategy encryption.
- **Standalone builder app**: `avax-agent/` is a separate Next.js app with its own package files.
- **Generated graph data**: `graphify-out/` and nested `graphify-out/` folders are generated artifacts, not hand-maintained docs.

## Product Areas

| Area | Route / Path | Notes |
|---|---|---|
| Landing | `/` | Marketing page using the shared landing and layout components. |
| Main app shell | `(app)` group | Wallet provider, onboarding guard, global chat panel, header, and background. |
| Trade | `/trade` | 0G DEX card and Ethereum Uniswap card, with chart/history toggles. |
| Terminal | `/terminal` | Dense DEX terminal with token list, chart, order book, trade panel, and footer. |
| Explore | `/explore` | Token/pool/transaction explorer backed by `/api/crypto` and DEX data routes. |
| Portfolio | `/portfolio` | Wallet and token analysis panels. |
| Token detail | `/token/[id]` | Token profile plus analysis routes. |
| Marketplace | `/marketplace` | Strategy and indicator discovery with filtering, featured sections, purchases, bookmarks, and reports. |
| Creator | `/creator` | Creator dashboard for strategies, indicators, activations, purchases, and earnings. |
| Agent builder | `/agent-builder` | React Flow canvas, node palette, config panel, chart panel, workflow storage, backtests, and AI sidebar. |
| Admin | `/admin` | Admin-only strategy, indicator, and report moderation. |

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS, shadcn/ui, Radix UI, lucide-react.
- **Wallet/Web3**: RainbowKit, wagmi v2, viem v2, ethers v6.
- **State/data**: Zustand, TanStack Query, Supabase service-role API routes.
- **Builder**: React Flow / XYFlow, custom node registry, bot runner, backtest runner, indicator compiler.
- **Charts/terminal**: lightweight-charts, react-grid-layout in the reusable terminal components.
- **Backend**: Python 3.12, FastAPI, Redis, SQLAlchemy async, Postgres/Supabase, LangGraph.
- **AI**: OpenRouter/OpenAI-compatible chat routes, 0G Compute wrapper, LiteLLM/Anthropic in the Python ATS conversation layer.
- **0G**: 0G Chain, 0G Storage, 0G Compute, and 0G DA wrappers under `lib/zerog/`.

## Setup

Install JavaScript dependencies:

```bash
npm install
```

Start the Next.js app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Start the Python ATS stack with Docker:

```bash
docker compose up redis api
```

Or run the FastAPI service locally:

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn ats.api.main:app --reload --host 0.0.0.0 --port 8000
```

The API exposes `/health`, `/ws`, `/activations/{id}/execute`, `/receipts/{id}`, and `/chat`.

## Environment

Create `.env.local` for the Next.js app and `.env` for the Python/Docker stack as needed.

Common Next.js variables:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_TREASURY_WALLET=

SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
ADMIN_WALLETS=0x...

OPEN_ROUTER_API_KEY=
OPENROUTER_API_KEY=
OPENAI_API_KEY=

COINGECKO_API_KEY=
COINMARKETCAP_API_KEY=

STRATEGY_ENCRYPTION_KEY=
ZEROG_COMPUTE_API_KEY=
```

Common ATS variables:

```bash
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql+asyncpg://...
DATABASE_SSL=true

BINANCE_API_KEY=
BINANCE_SECRET=
NEWS_API_KEY=
COINGECKO_API_KEY=
THE_GRAPH_API_KEY=
AGENT_MODEL=claude-sonnet-4-6
AGENT_API_KEY=
ANTHROPIC_API_KEY=

RPC_URL=https://evmrpc-testnet.0g.ai
AGENT_WALLET_PRIVATE_KEY=
DEX_ROUTER_ADDRESS=0x0000000000000000000000000000000000000010
DEX_ROUTER_V1_ADDRESS=0x0000000000000000000000000000000000000011
DEX_SLIPPAGE_BPS=50

ZEROG_STORAGE_RPC=https://indexer-storage-testnet-standard.0g.ai
ZEROG_STORAGE_PRIVATE_KEY=
ZEROG_COMPUTE_ENDPOINT=https://compute-api.0g.ai/v1
ZEROG_COMPUTE_MODEL=qwen3-8b
ZEROG_COMPUTE_SEALED=false
ZEROG_DA_RPC=https://da-client-testnet.0g.ai
```

Generate `STRATEGY_ENCRYPTION_KEY` with:

```bash
openssl rand -hex 32
```

## Database

Supabase migrations live in `supabase/migrations/`:

- `20260424_create_user_risk_profiles.sql`
- `20260427120000_create_marketplace.sql`
- `20260503000000_marketplace_payments.sql`

The marketplace API routes use a Supabase service-role client. Optional marketplace reads return empty lists when Supabase is not configured or the schema is missing; creator writes, activations, purchases, and admin actions require the Supabase environment variables.

## Commands

```bash
npm run dev      # Next.js development server
npm run build    # production build
npm run start    # serve production build
npm run lint     # package lint script
```

Python checks:

```bash
python -m pytest tests/test_phase1.py -v
python -m pytest tests/test_phase4.py tests/test_phase5.py tests/test_phase6.py -v
python -m pytest tests/test_phase7.py tests/test_phase8.py -v
```

The `package.json` Hardhat scripts still point at a legacy sibling directory named `../Avalanche_contract`. Root-level Solidity ABIs and scripts remain in `contracts/` and `scripts/`, but the current docs treat the 0G chain registry as the source of truth for active app routing.

## Project Structure

```text
app/                    Next.js App Router pages and API routes
components/             UI, layout, trade, terminal, marketplace, portfolio, token, builder components
hooks/                  wallet, DEX, liquidity, token, analysis hooks
lib/                    chain registry, 0G wrappers, marketplace helpers, agent-builder engine, DEX data
store/                  Zustand stores for agent builder, terminal, chart, transactions
types/                  shared TypeScript types
ats/                    Python agentic trading system and FastAPI service
supabase/migrations/    database schema for onboarding, marketplace, purchases
contracts/              ABIs, contract config shims, Solidity source path for Hardhat
scripts/                Hardhat scripts, setup helpers, Python training/test utilities
tests/                  Python ATS test suites
doc/                    hand-written architecture and implementation docs
graphify-out/           generated graph artifacts
avax-agent/             standalone visual builder app
```

## Chain Registry

The active registry is `lib/chain-registry/`.

- Default chain: `0G Newton Testnet`, chain ID `16600`.
- Additional registered chain: Ethereum mainnet.
- Avalanche config remains available in `lib/chain-registry/chains/avalanche.ts` for compatibility, but it is not registered in `REGISTRY` by default.
- Contract addresses, token lists, router addresses, explorer URLs, and 0G protocol endpoints should be updated in the registry, not scattered through components.

## Documentation

- [Project docs index](doc/README.md)
- [ATS execution flow](doc/ATS_Agent_Execution_Flow.md)
- [Implementation phases](doc/phases/index.md)
- [Marketplace docs](doc/marketplace/README.md)
- [0G integration guideline](doc/guideline.md)
- [Built inventory](doc/BUILT.md)
- [Standalone avax-agent README](avax-agent/README.md)
