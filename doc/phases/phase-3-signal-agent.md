# Phase 3 Signal Agent

Last updated: 2026-05-04

Phase 3 implements Agent 2, which turns normalized data into directional signal votes.

## Implemented Files

- `ats/agents/agent2_signal.py`
- `ats/agents/signal/sentiment.py`
- `ats/agents/signal/technicals.py`
- `ats/agents/signal/combiner.py`
- `scripts/test_phase3.py`

## Flow

```text
normalized_queue
  -> buffer news packets
  -> on price/on-chain packet, read regime:current
  -> compute sentiment
  -> compute regime-gated technical signal
  -> combine
  -> write signal:latest:{ticker}
```

Agent 2 does not own external market connections. It consumes Agent 1 output and Redis context.

## Output

`signal:latest:{ticker}` contains a `SignalVote` with:

- direction
- confidence
- sentiment score
- technical signal
- regime used

## Run

```python
from ats.agents.agent2_signal import Agent2Signal

await Agent2Signal().run()
```

## Validate

```bash
python scripts/test_phase3.py
```

## Current Limitations

- News packets are buffered for the next price-triggered cycle.
- ML ensemble and institutional flow concepts are roadmap items, not fully implemented in the current agent.
- The output quality depends on populated price buffers and current regime state.
