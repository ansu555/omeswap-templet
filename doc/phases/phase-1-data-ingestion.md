# Phase 1 Data Ingestion

Last updated: 2026-05-04

Phase 1 implements Agent 1, the data ingestion and normalization layer.

## Implemented Files

- `ats/agents/agent1_data.py`
- `ats/agents/normalizer.py`
- `ats/agents/sources/binance_ws.py`
- `ats/agents/sources/coingecko_poller.py`
- `ats/agents/sources/news_poller.py`
- `ats/agents/sources/onchain_watcher.py`
- `ats/data/queue.py`
- `ats/models/packets.py`

## Flow

```text
Binance WS
CoinGecko poller
NewsAPI poller
DeFiLlama watcher
  -> raw_queue
  -> normalization_loop
  -> Redis price keys and buffers
  -> normalized_queue
```

## Output

Agent 1 writes:

- `price:{ticker}`
- `price_buffer:{ticker}`
- normalized `DataPacket` objects into `normalized_queue`

The normalizer computes content quality from freshness and source reliability, deduplicates packets, and updates rolling price buffers.

## Run

Agent 1 is started by calling:

```python
from ats.agents.agent1_data import Agent1DataIngestion

await Agent1DataIngestion().run()
```

## Validate

```bash
python -m pytest tests/test_phase1.py -v
```

## Current Limitations

- The MVP uses in-process queues, not Kafka.
- Some source workers depend on public APIs and may need API keys or network availability.
- News and on-chain source coverage is intentionally lightweight.
