# Phase 6 Orchestrator

Last updated: 2026-05-04

Phase 6 implements the LangGraph orchestration layer and decision receipt writer.

## Implemented Files

- `ats/orchestrator/__init__.py`
- `ats/orchestrator/graph.py`
- `ats/orchestrator/nodes.py`
- `ats/orchestrator/consensus.py`
- `ats/orchestrator/receipt_writer.py`
- `tests/test_phase6.py`

## Entry Point

```python
from ats.orchestrator import run_pipeline

state = await run_pipeline("BTCUSDT", {"event_type": "manual"})
```

## Graph

```text
regime
  -> signal_and_graph
  -> risk
  -> orchestrator
  -> execution when consensus == EXECUTE
```

The graph returns an `AgentState`. LangGraph may return a dict, so `run_pipeline()` restores the Pydantic model when needed.

## Receipt Behavior

`orchestrator_node()`:

1. evaluates consensus
2. writes a `DecisionReceipt`
3. attaches `consensus` and `receipt_id` to state

Receipts are written for both executed and skipped cycles.

## Validate

```bash
python -m pytest tests/test_phase6.py -v
```

## Current Limitations

- Consensus is intentionally compact.
- Agent loops are not supervised by a process manager in this repo.
- Production tracing should add run IDs across every node and receipt.
