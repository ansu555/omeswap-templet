# Phase 7 Execution Agent

Last updated: 2026-05-04

Phase 7 implements Agent 6, the execution path for approved ATS decisions.

## Implemented Files

- `ats/agents/agent6_execution.py`
- `ats/agents/execution/dex_client.py`
- `ats/agents/execution/order_router.py`
- `ats/agents/execution/fill_monitor.py`
- `ats/agents/execution/portfolio_updater.py`
- `ats/agents/execution/stop_loss_monitor.py`
- `tests/test_phase7.py`

## Flow

```text
approved RiskDecision
  -> map ticker to token
  -> select single swap or TWAP
  -> submit swap through 0G DEX client
  -> wait for receipt(s)
  -> update portfolio:state
  -> update DecisionReceipt fill_data
  -> stop-loss monitor handles exits
```

## Token Convention

- LONG: buy asset token with USDC.
- SHORT: sell asset token for USDC.

Current mapping:

| Ticker | Token |
|---|---|
| `BTCUSDT` | `WBTC` |
| `WBTCUSDT` | `WBTC` |
| `ETHUSDT` | `WETH` |
| fallback | `W0G` |

## Environment

```bash
AGENT_WALLET_PRIVATE_KEY=
RPC_URL=https://evmrpc-testnet.0g.ai
DEX_ROUTER_ADDRESS=0x0000000000000000000000000000000000000010
DEX_ROUTER_V1_ADDRESS=0x0000000000000000000000000000000000000011
DEX_SLIPPAGE_BPS=50
```

## Validate

```bash
python -m pytest tests/test_phase7.py -v
```

## Security Notes

- Never log `AGENT_WALLET_PRIVATE_KEY`.
- Do not return private key material in API responses or fill data.
- Keep a dry-run or low-value test path until live 0G router/token addresses are confirmed.
- Stop-loss market exits need live-chain simulation before production funds.
