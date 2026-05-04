# ATS Implementation Phases

Last updated: 2026-05-04

These phase docs map the Python ATS implementation under `ats/` to the original staged build plan. They now describe the current repo state and validation files.

## Phase Map

```text
Phase 0 Foundation
  -> Phase 1 Data Ingestion
  -> Phase 2 Regime Detection
  -> Phase 3 Signal Agent
  -> Phase 4 Graph Agent
  -> Phase 5 Risk Agent
  -> Phase 6 LangGraph Orchestrator
  -> Phase 7 Execution Agent
  -> Phase 8 API, WebSocket, Conversation
```

## Files

| Phase | Doc | Implementation | Validation |
|---|---|---|---|
| 0 | [phase-0-foundation.md](phase-0-foundation.md) | `ats/config.py`, models, Redis/Postgres helpers, queues, Docker/FastAPI skeleton | imported by later suites |
| 1 | [phase-1-data-ingestion.md](phase-1-data-ingestion.md) | source workers, normalizer, Agent 1 runner | `tests/test_phase1.py` |
| 2 | [phase-2-regime-detection.md](phase-2-regime-detection.md) | HMM model, feature builder, funding/price readers, training script | `scripts/test_phase2.py` |
| 3 | [phase-3-signal-agent.md](phase-3-signal-agent.md) | sentiment, technicals, combiner, Agent 2 runner | `scripts/test_phase3.py` |
| 4 | [phase-4-graph-agent.md](phase-4-graph-agent.md) | static protocol graph, propagator, Agent 3 | `tests/test_phase4.py` |
| 5 | [phase-5-risk-agent.md](phase-5-risk-agent.md) | portfolio reader, Kelly sizing, Agent 5 veto logic | `tests/test_phase5.py` |
| 6 | [phase-6-orchestrator.md](phase-6-orchestrator.md) | LangGraph state graph, nodes, consensus, receipt writer | `tests/test_phase6.py` |
| 7 | [phase-7-execution-agent.md](phase-7-execution-agent.md) | 0G DEX client, order router, fills, portfolio updater, stop-loss monitor | `tests/test_phase7.py` |
| 8 | [phase-8-api-and-conversation.md](phase-8-api-and-conversation.md) | FastAPI app, WebSocket manager, activation/receipt/chat routes | `tests/test_phase8.py` |

## Core Rules

- Agent 1 owns external data ingestion.
- Other agents read normalized packets and Redis state rather than calling source APIs directly.
- Agent 5 risk veto is absolute.
- The orchestrator writes a receipt for every cycle.
- Agent 6 executes only after consensus is `EXECUTE`.
- Live execution requires real 0G router/token addresses and a dedicated agent wallet key.

## Run

```bash
docker compose up redis api
```

Or locally:

```bash
uvicorn ats.api.main:app --reload --host 0.0.0.0 --port 8000
```

Validation:

```bash
python -m pytest tests/test_phase1.py -v
python scripts/test_phase2.py
python scripts/test_phase3.py
python -m pytest tests/test_phase4.py tests/test_phase5.py tests/test_phase6.py -v
python -m pytest tests/test_phase7.py tests/test_phase8.py -v
```
