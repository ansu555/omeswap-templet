# Omeswap Product Vision And Implementation Alignment

Last updated: 2026-05-04

This document keeps the product vision connected to what the repo currently implements. Older versions described a broad agentic trading platform as if every concept were complete. The current repo is part shipped system, part MVP, and part research roadmap.

## Vision

Omeswap is a DEX and autonomous strategy platform where users can:

- connect a wallet and complete risk onboarding
- trade and inspect markets
- build strategy graphs visually
- publish strategies and indicators to a marketplace
- buy or activate marketplace strategies
- let a multi-agent backend evaluate, risk-check, and execute strategy decisions
- inspect decision receipts afterward

## Current Implementation

Shipped or substantially wired:

- Next.js app shell with wallet connection and onboarding guard.
- 0G + Ethereum chain registry.
- 0G Storage, Compute, and DA wrappers.
- DEX trade page and standalone terminal.
- Explore, portfolio, token, and transaction UI surfaces.
- Visual agent builder with executable node registry and backtesting support.
- Marketplace and creator dashboard backed by Supabase.
- Paid strategy purchase verification route.
- Private strategy encryption and 0G Storage upload during publish.
- Python ATS backend through Phases 0, 1, 4, 5, 6, 7, and 8 test suites, with script checks for Phases 2 and 3.

## System Layers

| Layer | Current files | Role |
|---|---|---|
| Product UI | `app/`, `components/`, `hooks/`, `store/` | Wallet app, trading surfaces, builder, marketplace, admin. |
| Chain adapter | `lib/chain-registry/`, `lib/zerog/`, `contracts/` | Chains, tokens, routers, 0G protocols, ABIs. |
| Strategy engine | `lib/agent-builder/`, `lib/indicators/`, `types/agent-builder*` | Visual graph, node execution, indicators, backtesting. |
| Marketplace | `app/api/marketplace`, `app/api/creator`, `lib/marketplace`, `supabase/migrations` | Publish, discover, buy, activate, moderate strategies/indicators. |
| ATS backend | `ats/`, `tests/` | Multi-agent analysis, risk, orchestration, execution, receipts, chat. |

## Agent Roles

The six-agent design is implemented in Python:

1. **Data Ingestion**: collects and normalizes market/news/on-chain packets.
2. **Signal**: computes sentiment and technical signal votes.
3. **Graph**: propagates DeFi relationship impact from events.
4. **Regime**: classifies market regime and writes global context.
5. **Risk**: applies hard vetoes and position sizing.
6. **Execution**: submits approved swaps, monitors fills, updates portfolio state.

The orchestrator coordinates these agents and writes receipts.

## Strategy Marketplace Model

The marketplace centers on:

- creators
- strategies
- strategy versions
- indicators
- indicator versions
- dependencies
- activations
- decision receipts
- purchases
- reports and admin actions

The privacy model is important: marketplace strategy logic should not be stored as plaintext in Supabase. The publish flow encrypts the compiled graph, uploads it to 0G Storage, and stores only a root hash/marker in the database.

## Operating Modes

Current implementation supports these ideas unevenly:

| Mode | Current status |
|---|---|
| Research | Activation APIs and UI language support research-style usage. |
| Paper | Schema supports `paper`; analytics still need deeper implementation. |
| Live | Guarded by strategy status (`live_eligible`) and risk/execution backend; needs live-chain hardening. |

## Roadmap

Near-term:

- Update remaining Avalanche wording in agent-builder prompts and UI copy.
- Tighten purchase verification to validate token/amount transfers.
- Align 0G chain IDs across all terminal and registry surfaces.
- Add developer docs for `/api/creator/*` request/response payloads.
- Add integration tests for Next.js marketplace routes with mocked Supabase.

Before real funds:

- Replace placeholder 0G DEX/token/router addresses.
- Add explicit execution kill switch and dry-run mode.
- Add durable queue infrastructure.
- Add production logging, metrics, and trace IDs across agent cycles.
- Add live-chain simulation tests for Agent 6.
- Complete admin review workflows and marketplace moderation dashboards.

Longer-term:

- Replace static graph data with a database-backed protocol graph.
- Add creator reputation and robust alpha scoring.
- Support reusable private indicators in the strategy runtime.
- Support multi-chain execution beyond 0G/Ethereum.
- Add verifiable model decision attestations for sealed inference.
