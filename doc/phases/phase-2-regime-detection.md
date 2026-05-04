# Phase 2 Regime Detection

Last updated: 2026-05-04

Phase 2 implements Agent 4, the market regime classifier.

## Implemented Files

- `ats/agents/agent4_regime.py`
- `ats/agents/regime/hmm_model.py`
- `ats/agents/regime/feature_builder.py`
- `ats/agents/regime/price_reader.py`
- `ats/agents/regime/funding_rate.py`
- `scripts/train_regime_model.py`
- `scripts/test_phase2.py`

## Flow

Agent 4 runs every 15 minutes:

```text
Redis price_buffer:BTC
funding rate
  -> feature vector: return, realized volatility, funding
  -> HMM prediction
  -> Redis regime and market context
```

## Redis Keys

- `regime:current`
- `regime:updated_at`
- `market:btc_vol`
- `market:funding_rate`

## Run

```python
from ats.agents.agent4_regime import Agent4RegimeDetection

await Agent4RegimeDetection().run()
```

Training helper:

```bash
python scripts/train_regime_model.py --coin bitcoin --days 730
```

## Validate

```bash
python scripts/test_phase2.py
```

## Current Limitations

- BTC is the global regime anchor.
- Classification depends on populated Redis price buffers.
- The HMM is MVP-grade and should be retrained/monitored before live capital.
