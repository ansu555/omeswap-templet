# ATS Agent Execution Flow

Last updated: 2026-05-04

This is the current developer reference for the Python Agentic Trading System under `ats/`. It describes the implementation in this repo, not only the original product proposal.

## System Overview

The ATS is a six-agent trading backend coordinated by LangGraph and exposed through FastAPI. It receives market events, normalizes data, computes signal and graph votes, classifies regime, applies risk vetoes, writes a decision receipt, and optionally executes an on-chain swap through a dedicated agent wallet.

```text
External data
  -> Agent 1 data ingestion
  -> normalized_queue + Redis price buffers
  -> Agent 2 signal + Agent 3 graph + Agent 4 regime
  -> Agent 5 risk
  -> LangGraph orchestrator
  -> DecisionReceipt
  -> Agent 6 execution when consensus is EXECUTE
  -> Redis portfolio state + Postgres fill data + WebSocket event
```

## Runtime Services

| Service | Implementation | Purpose |
|---|---|---|
| FastAPI | `ats/api/main.py` | Health, WebSocket, activation execution, receipt lookup, chat. |
| Redis | `ats/data/redis_client.py` | Live state, price buffers, regime, signals, portfolio, queues. |
| Postgres/Supabase | `ats/data/postgres_client.py`, `ats/models/receipts.py` | Decision receipts and fill/audit data. |
| LangGraph | `ats/orchestrator/graph.py` | Deterministic pipeline from regime to execution. |
| Next.js bridge | `lib/api/wallet-analysis.ts`, `app/api/*` | Frontend-facing routes and wallet/marketplace operations. |

## Agent Flow

| Agent | Files | Current behavior |
|---|---|---|
| Agent 1 Data Ingestion | `ats/agents/agent1_data.py`, `ats/agents/sources/*`, `ats/agents/normalizer.py` | Runs Binance WebSocket, CoinGecko polling, NewsAPI polling, DeFiLlama watcher, and the normalizer. Maintains `price_buffer:{ticker}` and pushes clean packets to `normalized_queue`. |
| Agent 2 Signal | `ats/agents/agent2_signal.py`, `ats/agents/signal/*` | Buffers news, reads `regime:current`, computes sentiment and technical direction, combines them, and writes `signal:latest:{ticker}`. |
| Agent 3 Graph | `ats/agents/agent3_graph.py`, `ats/agents/graph/*` | Uses a static DeFi protocol graph for MVP propagation scoring, queues secondary tokens, and writes `graph:latest:{ticker}`. |
| Agent 4 Regime | `ats/agents/agent4_regime.py`, `ats/agents/regime/*` | Builds BTC-anchored feature vectors, classifies regime via HMM, and writes regime and market context every 15 minutes. |
| Agent 5 Risk | `ats/agents/agent5_risk.py`, `ats/agents/risk/*` | Applies hard vetoes, Kelly sizing, volatility/regime multipliers, stop-loss/take-profit prices, and returns `RiskDecision`. |
| Agent 6 Execution | `ats/agents/agent6_execution.py`, `ats/agents/execution/*` | Executes approved swaps through the 0G DEX client, waits for receipts, updates Redis portfolio state, updates Postgres receipt fill data, and starts the stop-loss monitor. |

## Orchestrator

`ats/orchestrator/__init__.py` exposes:

```python
async def run_pipeline(ticker: str, trigger_event: dict) -> AgentState
```

The compiled graph in `ats/orchestrator/graph.py` runs:

```text
regime -> signal_and_graph -> risk -> orchestrator -> execution?
```

`orchestrator_node()` calls `evaluate_consensus()` and writes a `DecisionReceipt`. A conditional edge sends the state to Agent 6 only when consensus is `EXECUTE`; otherwise the graph ends with `SKIP`.

## State And Redis Keys

Common Redis keys:

| Key | Writer | Reader |
|---|---|---|
| `price:{ticker}` | Agent 1 / CoinGecko poller | Agent 5, Agent 6, stop-loss monitor |
| `price_buffer:{ticker}` | normalizer | Agent 2, Agent 4 |
| `regime:current` | Agent 4 | Agent 2, orchestrator nodes, risk |
| `regime:updated_at` | Agent 4 | monitoring/debugging |
| `market:btc_vol` | Agent 4 | Agent 5 |
| `market:funding_rate` | Agent 4 | Agent 5 |
| `signal:latest:{ticker}` | Agent 2 | orchestrator |
| `graph:latest:{ticker}` | Agent 3 | orchestrator/debugging |
| `portfolio:state` | Agent 6 / portfolio updater | Agent 5, stop-loss monitor |
| `execution:fills` | Agent 6 / portfolio updater | receipts/chat/debugging |

In-process queues are defined in `ats/data/queue.py`. The MVP uses Python queues; Kafka remains a production upgrade path.

## Decision Logic

Consensus is intentionally simple:

- `EXECUTE` requires compatible signal/graph/risk state and an approved `RiskDecision`.
- Risk veto is absolute. If Agent 5 rejects, execution cannot proceed.
- Every pipeline cycle writes a receipt, including skipped or vetoed cycles.

Important risk gates in `Agent5Risk`:

- crisis mode hard halt
- daily drawdown halt
- minimum signal confidence
- regime/direction conflict
- protocol category concentration
- minimum position size
- max risk per trade
- price availability and zero-size guard

## Execution

Agent 6 uses token convention:

- LONG: buy asset token with USDC.
- SHORT: sell asset token for USDC.

Current ticker mapping:

| Ticker | Token |
|---|---|
| `BTCUSDT` | `WBTC` |
| `WBTCUSDT` | `WBTC` |
| `ETHUSDT` | `WETH` |
| fallback | `W0G` |

Execution is implemented with `web3.py` in `ats/agents/execution/dex_client.py` and configured from `ats/config.py`.

## FastAPI Surface

| Route | File | Purpose |
|---|---|---|
| `GET /health` | `ats/api/main.py` | Health and WebSocket connection count. |
| `WS /ws` | `ats/api/main.py` | Server-pushed events. |
| `POST /activations/{activation_id}/execute` | `ats/api/routes/activations.py` | Runs `run_pipeline()` for a trigger and broadcasts completion. |
| `GET /receipts/{receipt_id}` | `ats/api/routes/receipts.py` | Fetches a decision receipt. |
| `POST /chat` | `ats/api/routes/chat.py` | Conversation endpoint with receipt context. |

## Environment

The source of truth is `ats/config.py`.

```bash
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql+asyncpg://...
DATABASE_SSL=true

BINANCE_API_KEY=
BINANCE_SECRET=
NEWS_API_KEY=
COINGECKO_API_KEY=
THE_GRAPH_API_KEY=
DEFILLAMA_BASE_URL=https://api.llama.fi

AGENT_MODEL=claude-sonnet-4-6
AGENT_API_KEY=
ANTHROPIC_API_KEY=

AGENT_WALLET_PRIVATE_KEY=
RPC_URL=https://evmrpc-testnet.0g.ai
DEX_ROUTER_ADDRESS=0x0000000000000000000000000000000000000010
DEX_ROUTER_V1_ADDRESS=0x0000000000000000000000000000000000000011
DEX_SLIPPAGE_BPS=50

ZEROG_STORAGE_RPC=https://indexer-storage-testnet-standard.0g.ai
ZEROG_STORAGE_PRIVATE_KEY=
ZEROG_COMPUTE_ENDPOINT=https://compute-api.0g.ai/v1
ZEROG_COMPUTE_API_KEY=
ZEROG_COMPUTE_MODEL=qwen3-8b
ZEROG_COMPUTE_SEALED=false
ZEROG_DA_RPC=https://da-client-testnet.0g.ai
```

## Run And Test

```bash
docker compose up redis api
```

Or:

```bash
uvicorn ats.api.main:app --reload --host 0.0.0.0 --port 8000
```

Validation suites:

```bash
python -m pytest tests/test_phase1.py -v
python -m pytest tests/test_phase4.py tests/test_phase5.py tests/test_phase6.py -v
python -m pytest tests/test_phase7.py tests/test_phase8.py -v
```

`scripts/test_phase2.py` and `scripts/test_phase3.py` are script-style checks for the regime and signal phases.

## Production Gaps

- In-process queues should become Kafka or another durable stream.
- Static graph data should become a graph database or indexed protocol graph.
- Execution router addresses in 0G config are placeholders until live deployment.
- More observability is needed around agent loops, fills, and model decisions.
- Stop-loss and execution flows need live-chain integration tests before real funds.
