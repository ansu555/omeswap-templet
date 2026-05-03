# Recode Log

All upgrades and changes made to this repository are logged here.

---

### [2026-05-03 07:03:00 Z] agent=claude user=anik branch=agents
- upgrade_paths: lib/chain-registry/chains/zerog.ts, lib/chain-registry/index.ts, contracts/config.ts, lib/zerog/storage.ts, lib/zerog/compute.ts, lib/zerog/da.ts, lib/zerog/index.ts, lib/agent-builder/zerog/provider.ts, lib/agent-builder/avalanche/provider.ts, lib/chains/avalanche.ts, lib/agent-builder/evm-provider.ts, ats/config.py, .env.example, constants/index.ts, doc/guideline.md, CLAUDE.md
- upgrade_summary: Replaced Avalanche C-Chain (chainId 43114) with 0G Newton Testnet (chainId 16600) as the default chain across the entire codebase. Created three 0G SDK wrappers — `lib/zerog/storage.ts` (0G Storage KV+Log for persistent agent memory), `lib/zerog/compute.ts` (0G Compute decentralized AI inference with qwen3-8b, qwen3.6-plus sealed ZK, GLM-5-FP8), and `lib/zerog/da.ts` (0G DA for high-throughput data availability commitments). Updated ATS Python config with 0G RPC, storage, compute, and DA endpoints. Updated .env.example with all 0G env vars. Backward-compat shims preserved for old Avalanche imports. Rewrote doc/guideline.md as a comprehensive 0G integration guide covering all four 0G primitives.

### [2026-05-03 07:12:00 Z] agent=claude user=anik branch=agents
- upgrade_paths: doc/idea.md
- upgrade_summary: Added comprehensive 0G protocol integration mapping to the ATS idea doc. Section 2.4 documents exactly where each 0G component is used: 0G Chain (Layer 3 execution), 0G Storage (persistent agent memory — KV state + Log history, Decision Receipt storage with root hash), 0G Compute (Conversation Layer with qwen3-8b, sealed ZK inference via qwen3.6-plus/GLM-5-FP8 for Signal Agent causal gate and Risk Agent pre-trade gate), 0G DA (swarm coordination messages, large inference result blobs, market data attestation). Updated Chain Adapter table, ML Stack table, and Decision Receipt structure to reference 0G fields.
