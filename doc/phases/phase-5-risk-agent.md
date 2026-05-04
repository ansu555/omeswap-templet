# Phase 5 Risk Agent

Last updated: 2026-05-04

Phase 5 implements Agent 5, the hard risk veto and position sizing layer.

## Implemented Files

- `ats/agents/agent5_risk.py`
- `ats/agents/risk/kelly.py`
- `ats/agents/risk/portfolio_reader.py`
- `tests/test_phase5.py`

## Inputs

Agent 5 reads:

- `AgentState`
- `portfolio:state`
- `market:btc_vol`
- `price:{trigger_ticker}`
- signal vote and current regime

## Hard Rules

The current evaluator checks:

- crisis mode
- daily drawdown limit
- minimum signal confidence
- direction/regime conflict
- protocol category concentration
- Kelly sizing and minimum position size
- volatility/regime multipliers
- max risk per trade
- price availability
- zero-size guard

## Output

`RiskDecision` contains either:

- `approved=False` and `veto_code`
- or approved position size, token amount, stop-loss, take-profit, BTC volatility, and regime at decision time

## Validate

```bash
python -m pytest tests/test_phase5.py -v
```

## Current Limitations

- Protocol categories are a fixed dictionary in `agent5_risk.py`.
- Portfolio state is Redis-backed and should be reconciled with durable fills for production.
- Risk parameters are intentionally conservative and should be reviewed before live use.
