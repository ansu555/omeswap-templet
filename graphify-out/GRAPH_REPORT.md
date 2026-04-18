# Graph Report - graphify-meta  (2026-04-19)

## Corpus Check
- Corpus is ~9,718 words - fits in a single context window. You may not need a graph.

## Summary
- 33 nodes · 13 edges · 20 communities detected
- Extraction: 31% EXTRACTED · 69% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AMM Contract Rationale|AMM Contract Rationale]]
- [[_COMMUNITY_Agent Builder Execution|Agent Builder Execution]]
- [[_COMMUNITY_Bot Runtime Engine|Bot Runtime Engine]]
- [[_COMMUNITY_App Shell Branding|App Shell Branding]]
- [[_COMMUNITY_Avalanche Network Choice|Avalanche Network Choice]]
- [[_COMMUNITY_Swap Action Components|Swap Action Components]]
- [[_COMMUNITY_Wallet Analysis UI|Wallet Analysis UI]]
- [[_COMMUNITY_Schedule Trigger Nodes|Schedule Trigger Nodes]]
- [[_COMMUNITY_Agent API Bridge|Agent API Bridge]]
- [[_COMMUNITY_Chatbot Service Panel|Chatbot Service Panel]]
- [[_COMMUNITY_Swap Hook Logic|Swap Hook Logic]]
- [[_COMMUNITY_Liquidity Hook Logic|Liquidity Hook Logic]]
- [[_COMMUNITY_Token Mint Hook|Token Mint Hook]]
- [[_COMMUNITY_Wallet Hook Logic|Wallet Hook Logic]]
- [[_COMMUNITY_Flow Canvas UI|Flow Canvas UI]]
- [[_COMMUNITY_Agent Manager UI|Agent Manager UI]]
- [[_COMMUNITY_Block Palette UI|Block Palette UI]]
- [[_COMMUNITY_Agent Sidebar UI|Agent Sidebar UI]]
- [[_COMMUNITY_Backtest Summary UI|Backtest Summary UI]]
- [[_COMMUNITY_Wallet Analysis API|Wallet Analysis API]]

## God Nodes (most connected - your core abstractions)
1. `MultiTokenLiquidityPools Contract` - 2 edges
2. `handleRun() (agent-builder TopBar)` - 2 edges
3. `runBot()` - 2 edges
4. `OmeSwap / Avalanche DEX` - 1 edges
5. `Avalanche Mainnet (Chain ID 43114)` - 1 edges
6. `Uniswap V2 AMM Design` - 1 edges
7. `Rationale: Avalanche chosen for low gas fees` - 1 edges
8. `Rationale: Uniswap V2 AMM as design basis` - 1 edges
9. `SwapCardDex Component` - 1 edges
10. `WalletAnalysisDemo Component` - 1 edges

## Surprising Connections (you probably didn't know these)
- `SwapCardDex Component` --semantically_similar_to--> `SwapNode (agent action)`  [INFERRED] [semantically similar]
  graphify-meta/12-trade-report.md → graphify-meta/15-agent-builder-lib-report.md
- `ScheduleTriggerNode` --semantically_similar_to--> `ScheduleTriggerNode (avax-agent)`  [INFERRED] [semantically similar]
  graphify-meta/15-agent-builder-lib-report.md → graphify-meta/16-avax-agent-report.md
- `runBot()` --semantically_similar_to--> `runBot() (avax-agent)`  [INFERRED] [semantically similar]
  graphify-meta/15-agent-builder-lib-report.md → graphify-meta/16-avax-agent-report.md
- `POST() (avax-agent Agent API)` --semantically_similar_to--> `POST() (app/api/agent-builder route)`  [INFERRED] [semantically similar]
  graphify-meta/16-avax-agent-report.md → graphify-meta/18-app-api-report.md
- `OmeSwap / Avalanche DEX` --implements--> `RootLayout (app shell)`  [INFERRED]
  graphify-meta/00-root-README.md → graphify-meta/10-app-shell-report.md

## Hyperedges (group relationships)
- **DEX Trading Flow: Page → Hooks → Smart Contracts** — 10_app_shell_report_tradepage, 12_trade_report_swapcarddex, 01_implementation_summary_use_dex_swap, 00_root_readme_multihopswaprouter, 00_root_readme_avalanche_mainnet [INFERRED 0.85]

## Communities

### Community 0 - "AMM Contract Rationale"
Cohesion: 0.67
Nodes (3): MultiTokenLiquidityPools Contract, Rationale: Uniswap V2 AMM as design basis, Uniswap V2 AMM Design

### Community 1 - "Agent Builder Execution"
Cohesion: 0.67
Nodes (3): executeOnce() (agent-builder), getScheduleNode() (agent-builder), handleRun() (agent-builder TopBar)

### Community 2 - "Bot Runtime Engine"
Cohesion: 0.67
Nodes (3): runBot(), avax-agent (standalone Next.js app), runBot() (avax-agent)

### Community 3 - "App Shell Branding"
Cohesion: 1.0
Nodes (2): OmeSwap / Avalanche DEX, RootLayout (app shell)

### Community 4 - "Avalanche Network Choice"
Cohesion: 1.0
Nodes (2): Avalanche Mainnet (Chain ID 43114), Rationale: Avalanche chosen for low gas fees

### Community 5 - "Swap Action Components"
Cohesion: 1.0
Nodes (2): SwapCardDex Component, SwapNode (agent action)

### Community 6 - "Wallet Analysis UI"
Cohesion: 1.0
Nodes (2): WalletAnalysisDemo Component, WalletAnalysisPanel Component

### Community 7 - "Schedule Trigger Nodes"
Cohesion: 1.0
Nodes (2): ScheduleTriggerNode, ScheduleTriggerNode (avax-agent)

### Community 8 - "Agent API Bridge"
Cohesion: 1.0
Nodes (2): POST() (avax-agent Agent API), POST() (app/api/agent-builder route)

### Community 9 - "Chatbot Service Panel"
Cohesion: 1.0
Nodes (2): ChatbotPanel Component, AgentChatbotService

### Community 10 - "Swap Hook Logic"
Cohesion: 1.0
Nodes (1): use-dex-swap Hook

### Community 11 - "Liquidity Hook Logic"
Cohesion: 1.0
Nodes (1): use-liquidity Hook

### Community 12 - "Token Mint Hook"
Cohesion: 1.0
Nodes (1): use-token-mint Hook

### Community 13 - "Wallet Hook Logic"
Cohesion: 1.0
Nodes (1): use-avalanche-wallet Hook

### Community 14 - "Flow Canvas UI"
Cohesion: 1.0
Nodes (1): FlowCanvas Component

### Community 15 - "Agent Manager UI"
Cohesion: 1.0
Nodes (1): AgentManager Component

### Community 16 - "Block Palette UI"
Cohesion: 1.0
Nodes (1): BlockPalette Component

### Community 17 - "Agent Sidebar UI"
Cohesion: 1.0
Nodes (1): AgentSidebar Component

### Community 18 - "Backtest Summary UI"
Cohesion: 1.0
Nodes (1): BacktestSummaryModal Component

### Community 19 - "Wallet Analysis API"
Cohesion: 1.0
Nodes (1): analyzeWallet() (lib/api)

## Knowledge Gaps
- **30 isolated node(s):** `OmeSwap / Avalanche DEX`, `Avalanche Mainnet (Chain ID 43114)`, `Uniswap V2 AMM Design`, `Rationale: Avalanche chosen for low gas fees`, `Rationale: Uniswap V2 AMM as design basis` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `App Shell Branding`** (2 nodes): `OmeSwap / Avalanche DEX`, `RootLayout (app shell)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Avalanche Network Choice`** (2 nodes): `Avalanche Mainnet (Chain ID 43114)`, `Rationale: Avalanche chosen for low gas fees`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Swap Action Components`** (2 nodes): `SwapCardDex Component`, `SwapNode (agent action)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Wallet Analysis UI`** (2 nodes): `WalletAnalysisDemo Component`, `WalletAnalysisPanel Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Schedule Trigger Nodes`** (2 nodes): `ScheduleTriggerNode`, `ScheduleTriggerNode (avax-agent)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent API Bridge`** (2 nodes): `POST() (avax-agent Agent API)`, `POST() (app/api/agent-builder route)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chatbot Service Panel`** (2 nodes): `ChatbotPanel Component`, `AgentChatbotService`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Swap Hook Logic`** (1 nodes): `use-dex-swap Hook`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Liquidity Hook Logic`** (1 nodes): `use-liquidity Hook`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Token Mint Hook`** (1 nodes): `use-token-mint Hook`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Wallet Hook Logic`** (1 nodes): `use-avalanche-wallet Hook`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Flow Canvas UI`** (1 nodes): `FlowCanvas Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Manager UI`** (1 nodes): `AgentManager Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Block Palette UI`** (1 nodes): `BlockPalette Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Sidebar UI`** (1 nodes): `AgentSidebar Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backtest Summary UI`** (1 nodes): `BacktestSummaryModal Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Wallet Analysis API`** (1 nodes): `analyzeWallet() (lib/api)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `runBot()` (e.g. with `avax-agent (standalone Next.js app)` and `runBot() (avax-agent)`) actually correct?**
  _`runBot()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `OmeSwap / Avalanche DEX`, `Avalanche Mainnet (Chain ID 43114)`, `Uniswap V2 AMM Design` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._