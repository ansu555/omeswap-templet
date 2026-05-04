# Phase 0 Foundation

Last updated: 2026-05-04

Phase 0 provides the shared runtime foundation for the Python ATS.

## Implemented Files

| Area | Files |
|---|---|
| Settings | `ats/config.py` |
| Package roots | `ats/__init__.py`, `ats/agents/__init__.py`, `ats/api/__init__.py`, `ats/data/__init__.py`, `ats/models/__init__.py` |
| Models | `ats/models/packets.py`, `ats/models/state.py`, `ats/models/receipts.py` |
| Data helpers | `ats/data/queue.py`, `ats/data/redis_client.py`, `ats/data/postgres_client.py` |
| API skeleton | `ats/api/main.py`, `ats/api/ws_manager.py` |
| Infra | `requirements.txt`, `Dockerfile`, `docker-compose.yml` |

## Runtime

- Redis stores live agent state and queues.
- Postgres/Supabase stores decision receipts.
- FastAPI starts the database tables and Agent 6 stop-loss monitor.
- Docker Compose runs Redis and the API service.

## Important Settings

The `Settings` class in `ats/config.py` reads `.env` with `extra = "ignore"`. Key groups:

- data source keys: Binance, NewsAPI, CoinGecko, The Graph
- model keys: `AGENT_MODEL`, `AGENT_API_KEY`, `ANTHROPIC_API_KEY`
- storage: `DATABASE_URL`, `DATABASE_SSL`, `REDIS_URL`
- execution: `AGENT_WALLET_PRIVATE_KEY`, `RPC_URL`, `DEX_ROUTER_ADDRESS`, `DEX_SLIPPAGE_BPS`
- 0G: storage, compute, and DA endpoint/key settings

## Start

```bash
docker compose up redis api
```

Or:

```bash
uvicorn ats.api.main:app --reload --host 0.0.0.0 --port 8000
```

## Notes

There is no standalone `tests/test_phase0.py`; Phase 0 is exercised by later phase suites because every agent imports the shared models, queues, Redis/Postgres helpers, and app setup.
