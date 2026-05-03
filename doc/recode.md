# Recode Log

All upgrades and changes made to this repository are logged here.

---

### [2026-05-03 13:55:00 Z] agent=claude user=anik branch=market_place
- upgrade_paths: components/marketplace/buy-panel.tsx, components/creator/publish-wizard.tsx, app/(app)/marketplace/page.tsx, app/(app)/marketplace/strategies/[id]/page.tsx, app/(app)/creator/page.tsx, components/agent-builder/canvas/PublishModal.tsx
- upgrade_summary: Implemented full marketplace frontend. Created BuyPanel (wagmi useSendTransaction/useWriteContract EVM payment → treasury → POST purchase API → Activate Now unlock). Created 4-step PublishWizard (details/risk/privacy+pricing/preview with AES-256-GCM encryption info, free/paid toggle, payout wallet). Rewrote marketplace home with featured horizontal scroll row, platform picks, trending, new arrivals, free/paid sections, and filter sidebar (pricing, risk, win rate floor, asset, regime). Rewrote strategy detail with prominent stat tiles, alpha score, human_summary display, BuyPanel in sidebar, perf tabs, version history, no code exposure. Created creator dashboard with metrics bar (activations, purchases, earnings), strategy/indicator tables with actions, draft continuation links. Wired PublishModal to render PublishWizard for strategy mode, keeping flat indicator form.

---

### [2026-05-03 09:30:00 Z] agent=claude user=ansu555 branch=agents
- upgrade_paths: ats/api/main.py, ats/api/ws_manager.py, ats/api/routes/__init__.py, ats/api/routes/activations.py, ats/api/routes/receipts.py, ats/api/routes/chat.py, ats/api/conversation/__init__.py, ats/api/conversation/rag.py, ats/config.py, requirements.txt, tests/test_phase8.py
- upgrade_summary: Implemented Phase 8 — API, WebSocket & Conversation Layer. FastAPI app gains CORS middleware, WebSocket broadcast manager (`/ws`), three REST routes (POST /api/activations/{id}/execute, GET /api/receipts/{id}, POST /api/chat), a RAG module that injects recent Decision Receipts as grounding context, and a Conversation Layer that answers user questions via Claude claude-sonnet-4-6 + receipt context. Added `anthropic_api_key` to Settings with fallback to `agent_api_key`. Added `anthropic>=0.97.0` to requirements.txt. 43/43 tests passing.

---

### [2026-05-03 09:17:00 Z] agent=claude user=ansu555 branch=agents
- upgrade_paths: ats/agents/execution/__init__.py, ats/agents/execution/dex_client.py, ats/agents/execution/order_router.py, ats/agents/execution/fill_monitor.py, ats/agents/execution/portfolio_updater.py, ats/agents/execution/stop_loss_monitor.py, ats/agents/agent6_execution.py, ats/orchestrator/graph.py, ats/api/main.py, tests/test_phase7.py
- upgrade_summary: Implemented Phase 7 — Agent 6 Execution Agent. Builds a web3.py async DEX client (approve + swap via Trader Joe V2-compatible ABI on 0G Chain Newton Testnet), strategy router (single swap ≤$10K / TWAP 5-slice for >$10K), tx confirmation monitor with partial-failure tolerance, portfolio state updater (Redis portfolio:state + execution:fills list + Postgres DecisionReceipt.fill_data), and a background stop-loss monitor loop that auto-exits breached positions. Wired into the LangGraph orchestrator replacing the Phase 7 stub node; stop-loss task launched at FastAPI startup. 52/52 tests passing.

---

### [2026-05-03 08:35:00 Z] agent=claude user=anik branch=market_place
- upgrade_paths: components/marketplace/strategy-card-v2.tsx
- upgrade_summary: Created StrategyCardV2 component with win-rate/trades/drawdown/alpha stats grid, 5-dot alpha score visualisation, free/paid badge, platform-pick badge, verified/watch/paper status badge, asset pair chips, risk-level colouring, and Buy/Use Free CTA buttons. Type-compatible with the EnrichedCard shape returned by GET /api/marketplace/featured.

---

### [2026-05-03 08:30:00 Z] agent=claude user=anik branch=agents
- upgrade_paths: app/api/marketplace/strategies/[id]/purchase/route.ts, app/api/marketplace/strategies/[id]/access/route.ts, app/api/marketplace/featured/route.ts
- upgrade_summary: Created three new marketplace API routes: POST purchase (verifies EVM tx via viem against treasury wallet, inserts into strategy_purchases with verified_at), GET access (returns hasAccess/isPaid/price for a given wallet+strategy), and GET featured (returns platformPicks by avg_alpha, trending by win_rate_pct, and new arrivals from last 7 days).

---

### [2026-05-03 08:20:00 Z] agent=claude user=anik branch=agents
- upgrade_paths: supabase/migrations/20260503000000_marketplace_payments.sql, app/api/creator/strategies/[id]/publish/route.ts
- upgrade_summary: Added marketplace payments migration (is_free/price columns on strategies, zerog_root_hash on strategy_versions, strategy_purchases table with RLS). Updated publish route to AES-256-GCM encrypt strategy payload via sealStrategyPayload(), store rootHash in strategy_versions.zerog_root_hash, write only the encrypted marker to the payload column, and auto-generate human_summary via generateHumanSummary() when not supplied by the caller.

### [2026-05-03 08:10:00 Z] agent=claude user=anik branch=agents
- upgrade_paths: lib/zerog/private-strategy.ts, lib/zerog/index.ts, .env.example
- upgrade_summary: Created strategy privacy layer (`lib/zerog/private-strategy.ts`) — AES-256-GCM encrypt/decrypt of compiled strategy payloads, upload/download via 0G Storage, and `generateHumanSummary()` via sealed qwen3.6-plus inference. Added STRATEGY_ENCRYPTION_KEY and NEXT_PUBLIC_TREASURY_WALLET to .env.example. Barrel re-export added to lib/zerog/index.ts.

### [2026-05-03 07:12:00 Z] agent=claude user=anik branch=agents
- upgrade_paths: doc/idea.md
- upgrade_summary: Added comprehensive 0G protocol integration mapping to the ATS idea doc. Section 2.4 documents exactly where each 0G component is used: 0G Chain (Layer 3 execution), 0G Storage (persistent agent memory — KV state + Log history, Decision Receipt storage with root hash), 0G Compute (Conversation Layer with qwen3-8b, sealed ZK inference via qwen3.6-plus/GLM-5-FP8 for Signal Agent causal gate and Risk Agent pre-trade gate), 0G DA (swarm coordination messages, large inference result blobs, market data attestation). Updated Chain Adapter table, ML Stack table, and Decision Receipt structure to reference 0G fields.

### [2026-05-03 07:03:00 Z] agent=claude user=anik branch=agents
- upgrade_paths: lib/chain-registry/chains/zerog.ts, lib/chain-registry/index.ts, contracts/config.ts, lib/zerog/storage.ts, lib/zerog/compute.ts, lib/zerog/da.ts, lib/zerog/index.ts, lib/agent-builder/zerog/provider.ts, lib/agent-builder/avalanche/provider.ts, lib/chains/avalanche.ts, lib/agent-builder/evm-provider.ts, ats/config.py, .env.example, constants/index.ts, doc/guideline.md, CLAUDE.md
- upgrade_summary: Replaced Avalanche C-Chain (chainId 43114) with 0G Newton Testnet (chainId 16600) as the default chain across the entire codebase. Created three 0G SDK wrappers — `lib/zerog/storage.ts` (0G Storage KV+Log for persistent agent memory), `lib/zerog/compute.ts` (0G Compute decentralized AI inference with qwen3-8b, qwen3.6-plus sealed ZK, GLM-5-FP8), and `lib/zerog/da.ts` (0G DA for high-throughput data availability commitments). Updated ATS Python config with 0G RPC, storage, compute, and DA endpoints. Updated .env.example with all 0G env vars. Backward-compat shims preserved for old Avalanche imports. Rewrote doc/guideline.md as a comprehensive 0G integration guide covering all four 0G primitives.
