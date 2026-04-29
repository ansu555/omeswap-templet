# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
bun run dev          # or: npm run dev
bun run build
bun run lint

# Smart contract operations (requires ../Avalanche_contract)
npm run hardhat:compile
npm run hardhat:test
npm run hardhat:mint       # mint test tokens
npm run hardhat:liquidity  # add liquidity
npm run hardhat:swap       # execute swap
npm run hardhat:multihop   # multi-hop swap
npm run hardhat:quickstart # full setup
```

## Environment

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=  # required — from cloud.walletconnect.com
```

## Architecture

**Omeswap** is a DEX on Avalanche using Next.js 15 App Router. The repo has no tests; validate with `bun run build` and visual inspection.

### Route Groups

| Group | Path | Purpose |
|-------|------|---------|
| `(app)` | `/trade`, `/terminal`, `/portfolio`, `/token`, `/pool`, `/explore`, `/transactions` | Main authenticated DEX |
| `(builder)` | `/agent-builder` | Visual bot workflow editor |
| `(landing)` | `/` | Marketing landing page |
| `(userform)` | `/onboarding` | Wallet-based onboarding |

The `(app)` layout wraps everything in `AvalancheWalletProvider` → `OnboardingGuard` → `ChatProvider`. `OnboardingGuard` redirects new wallets to onboarding; `DisconnectOverlay` handles wallet-switch detection.

### Chain Registry (`lib/chain-registry/`)

Single source of truth for all chain config (RPC URLs, contract addresses, tokens, DEX routers). All other files import from here — never hardcode addresses elsewhere.

To add a new chain: create `lib/chain-registry/chains/<chain>.ts` exporting a `ChainConfig`, import it in `lib/chain-registry/index.ts`, and add to `REGISTRY`. The wallet provider, swap hooks, and agent nodes pick it up automatically.

Currently only Avalanche Mainnet (chainId 43114) is registered.

### Contract Layer (`contracts/`)

`contracts/config.ts` is a backward-compatible shim that re-exports from the chain registry. Deployed contracts:
- **Liquidity Pools**: `0xe63514C2B0842B58A16Ced0C63668BAA91B033Af`
- **Swap Router**: `0xFe2108798dC74481d5cCE1588cBD00801758dD6d`

External DEX routers (TraderJoe V1/V2, Pangolin) are also configured in the chain registry.

### State Management (`store/`)

Zustand stores — no Redux:
- `agent-builder.ts` — canvas nodes/edges, workflow save/load (localStorage key `avax-agent-workflows`), bot run logs, backtest results
- `terminal.ts` — active symbol, watchlist, tile layout (react-grid-layout), bot run state
- `chart.ts` — chart-level state
- `transaction-store.ts` — transaction history

### Agent Builder (`lib/agent-builder/`)

Visual DAG-based trading bot editor. Key concepts:

- **`BaseNode`** (`nodes/BaseNode.ts`) — abstract class all nodes extend. Implement `execute(inputs, context): Promise<Record<string, unknown>>`.
- **Node categories**: `data` (PriceFeed, WalletBalance, DEXPrice), `logic` (Condition, Math, MovingAverage, Threshold, Delay, Variable, Accumulator, PreviousValue), `action` (Swap, LimitOrder, Notification, AddChartMarker), `flow` (Start, End, Merge, ScheduleTrigger).
- **`BotRunner`** (`engine/BotRunner.ts`) — executes the DAG via topological sort. Receives callbacks for logging, status updates, and chart markers.
- **`BacktestRunner`** (`engine/BacktestRunner.ts`) — replays OHLCV candles through the bot, mocking blockchain action nodes.
- **`IndicatorCompiler`** (`engine/IndicatorCompiler.ts`) — compiles custom indicator code.
- **Indicator registry** (`lib/indicators/`) — pub/sub registry for built-in and user-defined indicators. Indicators expose `builtins/` math primitives.
- **`ExecutionContext`** (`types/agent-builder-canvas.ts`) — runtime context injected into nodes: wallet address, provider/signer, logger, toast, chart access.

### Trading Terminal (`/(app)/terminal`)

Resizable tile grid (react-grid-layout). Tiles: `chart`, `watchlist`, `trades`, `depth`, `info`, `order`, `copilot`. Charts use `lightweight-charts` v5. The copilot tile integrates OpenAI.

Components live in `components/terminal/`. Tile layout is persisted in the terminal Zustand store.

### Web3 Stack

- **wagmi v2 + viem v2** for contract reads/writes
- **RainbowKit** for wallet modal (WalletConnect, MetaMask, etc.)
- **ethers v6** used in some hooks alongside viem
- Custom hooks in `hooks/` — `use-dex-swap.tsx`, `use-dex-aggregator.tsx`, `use-liquidity.tsx`, `use-token-balances.tsx`, `use-wallet-analysis.tsx`, etc.

### UI

shadcn/ui components (Radix primitives + Tailwind). Component aliases configured in `tsconfig.paths.json` — import as `@/components/ui/...`. Dark theme by default via `next-themes`.

### Supabase

`supabase/` contains migrations. Client initialized in `lib/supabase/`. Used for persistent user data and wallet analysis.

### Graphify

A knowledge graph of this codebase lives in `graphify-out/`. Before answering architecture questions, check `graphify-out/GRAPH_REPORT.md`. After modifying code files, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Key Conventions

- Path alias `@/` maps to the project root — use it everywhere instead of relative imports.
- All contract addresses must come from the chain registry, not be hardcoded in components or hooks.
- Node.js v25+ `localStorage` shim is injected via webpack BannerPlugin in `next.config.ts` — do not add another localStorage polyfill.
- `export const dynamic = "force-dynamic"` is set on the `(app)` layout to prevent static rendering of wallet-dependent pages.
