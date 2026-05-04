# Phase 4 Graph Agent

Last updated: 2026-05-04

Phase 4 implements Agent 3, the graph and relationship impact agent.

## Implemented Files

- `ats/agents/agent3_graph.py`
- `ats/agents/graph/protocol_graph.py`
- `ats/agents/graph/propagator.py`
- `tests/test_phase4.py`

## Flow

```text
trigger token/protocol event
  -> static protocol graph lookup
  -> impact score calculation
  -> graph vote
  -> secondary token queueing
  -> graph:latest:{ticker}
```

## Output

`graph:latest:{ticker}` stores:

- direction
- impact scores
- propagation count

## Validate

```bash
python -m pytest tests/test_phase4.py -v
```

## Current Limitations

- The MVP graph is a static Python dictionary.
- Neo4j, GraphSAGE, live subgraph indexing, and learned propagation weights are future upgrades.
