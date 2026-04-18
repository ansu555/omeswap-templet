# Graph Report - graphify-meta  (2026-04-18)

## Corpus Check
- Corpus is ~9,718 words - fits in a single context window. You may not need a graph.

## Summary
- 106 nodes · 80 edges · 37 communities detected
- Extraction: 55% EXTRACTED · 45% INFERRED · 0% AMBIGUOUS · INFERRED: 36 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Smart Contracts & Web3 Stack|Smart Contracts & Web3 Stack]]
- [[_COMMUNITY_Avalanche Chain Config|Avalanche Chain Config]]
- [[_COMMUNITY_Agent Builder UI|Agent Builder UI]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Agent Execution Trigger|Agent Execution Trigger]]
- [[_COMMUNITY_Crypto Market Data API|Crypto Market Data API]]
- [[_COMMUNITY_Agent Chatbot & Storage|Agent Chatbot & Storage]]
- [[_COMMUNITY_Portfolio Address Management|Portfolio Address Management]]
- [[_COMMUNITY_AI Chat API Routes|AI Chat API Routes]]
- [[_COMMUNITY_Node Factory|Node Factory]]
- [[_COMMUNITY_Avalanche Wallet Hook|Avalanche Wallet Hook]]
- [[_COMMUNITY_Pool Liquidity UI|Pool Liquidity UI]]
- [[_COMMUNITY_Selected Pool Info|Selected Pool Info]]
- [[_COMMUNITY_Swap History|Swap History]]
- [[_COMMUNITY_Toggle Section|Toggle Section]]
- [[_COMMUNITY_Agent Wallet Card|Agent Wallet Card]]
- [[_COMMUNITY_Net Worth Card|Net Worth Card]]
- [[_COMMUNITY_Block Palette|Block Palette]]
- [[_COMMUNITY_Backtest Summary Modal|Backtest Summary Modal]]
- [[_COMMUNITY_Limit Order Node|Limit Order Node]]
- [[_COMMUNITY_Notification Node|Notification Node]]
- [[_COMMUNITY_Chart Marker Node|Chart Marker Node]]
- [[_COMMUNITY_Price Feed Node|Price Feed Node]]
- [[_COMMUNITY_Wallet Balance Node|Wallet Balance Node]]
- [[_COMMUNITY_Condition Node|Condition Node]]
- [[_COMMUNITY_Moving Average Node|Moving Average Node]]
- [[_COMMUNITY_Threshold Alert Node|Threshold Alert Node]]
- [[_COMMUNITY_Block Templates Registry|Block Templates Registry]]
- [[_COMMUNITY_Block ID Generator|Block ID Generator]]
- [[_COMMUNITY_MetaMask Provider (avax)|MetaMask Provider (avax)]]
- [[_COMMUNITY_Markdown Renderer (avax)|Markdown Renderer (avax)]]
- [[_COMMUNITY_Landing Layout|Landing Layout]]
- [[_COMMUNITY_Transaction History Page|Transaction History Page]]
- [[_COMMUNITY_Pill Nav|Pill Nav]]
- [[_COMMUNITY_Stats Widget|Stats Widget]]
- [[_COMMUNITY_Tubelight Navbar|Tubelight Navbar]]
- [[_COMMUNITY_LiquidEther Animation|LiquidEther Animation]]

## God Nodes (most connected - your core abstractions)
1. `OmeSwap / Avalanche DEX` - 12 edges
2. `runBot()` - 7 edges
3. `GET() (app/api/crypto route)` - 6 edges
4. `MultiTokenLiquidityPools Contract` - 5 edges
5. `AppLayout` - 5 edges
6. `wagmi v2` - 4 edges
7. `AgentChatbotService` - 4 edges
8. `runBot() (avax-agent)` - 4 edges
9. `Trade Page (app/trade)` - 4 edges
10. `Portfolio Analytics Page` - 4 edges

## Surprising Connections (you probably didn't know these)
- `OmeSwap / Avalanche DEX` --implements--> `RootLayout (app shell)`  [INFERRED]
  graphify-meta/00-root-README.md → graphify-meta/10-app-shell-report.md
- `executeOnce() (agent-builder)` --calls--> `runBot()`  [INFERRED]
  graphify-meta/14-agent-builder-components-report.md → graphify-meta/15-agent-builder-lib-report.md
- `runBot() (avax-agent)` --semantically_similar_to--> `runBot()`  [INFERRED] [semantically similar]
  graphify-meta/16-avax-agent-report.md → graphify-meta/15-agent-builder-lib-report.md
- `DEXPriceNode (agent data)` --references--> `MultiTokenLiquidityPools Contract`  [INFERRED]
  graphify-meta/15-agent-builder-lib-report.md → graphify-meta/00-root-README.md
- `SwapNode (agent action)` --semantically_similar_to--> `SwapCardDex Component`  [INFERRED] [semantically similar]
  graphify-meta/15-agent-builder-lib-report.md → graphify-meta/12-trade-report.md

## Hyperedges (group relationships)
- **DEX Trading Flow: Page → Hooks → Smart Contracts** — 10_app_shell_report_tradepage, 12_trade_report_swapcarddex, 01_implementation_summary_use_dex_swap, 00_root_readme_multihopswaprouter, 00_root_readme_avalanche_mainnet [INFERRED 0.85]
- **Agent Execution Pipeline: Trigger → Schedule → Run → Nodes** — 15_agent_builder_lib_report_scheduletriggernode, 14_agent_builder_components_report_handlerun, 14_agent_builder_components_report_executeonce, 15_agent_builder_lib_report_runbot, 15_agent_builder_lib_report_topologicalsort [INFERRED 0.82]
- **Crypto Market Data Pipeline: Fetch → Transform → API** — 18_app_api_report_fetchcoingecko, 18_app_api_report_fetchcmc, 18_app_api_report_fetchpoolsgeckoterminal, 18_app_api_report_transformcmcdata, 18_app_api_report_get [EXTRACTED 0.95]

## Communities

### Community 0 - "Smart Contracts & Web3 Stack"
Cohesion: 0.18
Nodes (14): MultiHopSwapRouter Contract, MultiTokenLiquidityPools Contract, Rationale: Uniswap V2 AMM as design basis, Uniswap V2 AMM Design, wagmi v2, use-dex-swap Hook, use-liquidity Hook, use-token-mint Hook (+6 more)

### Community 1 - "Avalanche Chain Config"
Cohesion: 0.18
Nodes (10): Avalanche Mainnet (Chain ID 43114), Hardhat Dev Framework, OmeSwap / Avalanche DEX, RainbowKit Wallet, Rationale: Avalanche chosen for low gas fees, React 19, shadcn/ui Component Library, Tailwind CSS (+2 more)

### Community 2 - "Agent Builder UI"
Cohesion: 0.18
Nodes (8): Next.js 15 (App Router), Agent Builder UI Page, BuilderLayout, AgentManager Component, FlowCanvas Component, runBacktest(), runBot(), avax-agent (standalone Next.js app)

### Community 3 - "App Shell & Navigation"
Cohesion: 0.2
Nodes (10): AppLayout, Explore Tokens Page, Portfolio Analytics Page, RootLayout (app shell), Sidebar Component, PortfolioSummary Component, PortfolioTable Component, WalletAnalysisDemo Component (+2 more)

### Community 4 - "Agent Execution Trigger"
Cohesion: 0.22
Nodes (9): executeOnce() (agent-builder), getScheduleNode() (agent-builder), handleRun() (agent-builder TopBar), ScheduleTriggerNode, executeOnce() (avax-agent), handleRun() (avax-agent TopBar), runBacktest() (avax-agent), runBot() (avax-agent) (+1 more)

### Community 5 - "Crypto Market Data API"
Cohesion: 0.25
Nodes (2): GET() (app/api/crypto route), transformCMCData()

### Community 6 - "Agent Chatbot & Storage"
Cohesion: 0.33
Nodes (5): ChatbotPanel Component, AgentSidebar Component, AgentChatbotService, AgentStorageManager, AgentValidator

### Community 7 - "Portfolio Address Management"
Cohesion: 0.5
Nodes (2): handleAddAddress(), saveToLocalStorage()

### Community 8 - "AI Chat API Routes"
Cohesion: 0.5
Nodes (3): buildSystemPrompt() (avax-agent), POST() (avax-agent Agent API), POST() (app/api/agent-builder route)

### Community 9 - "Node Factory"
Cohesion: 1.0
Nodes (1): init() (BaseNode)

### Community 10 - "Avalanche Wallet Hook"
Cohesion: 1.0
Nodes (1): use-avalanche-wallet Hook

### Community 11 - "Pool Liquidity UI"
Cohesion: 1.0
Nodes (1): PoolLiquidity Component

### Community 12 - "Selected Pool Info"
Cohesion: 1.0
Nodes (1): SelectedPoolInfo Component

### Community 13 - "Swap History"
Cohesion: 1.0
Nodes (1): SwapHistory Component

### Community 14 - "Toggle Section"
Cohesion: 1.0
Nodes (1): ToggleSection Component

### Community 15 - "Agent Wallet Card"
Cohesion: 1.0
Nodes (1): AgentWalletCard Component

### Community 16 - "Net Worth Card"
Cohesion: 1.0
Nodes (1): NetWorthCard Component

### Community 17 - "Block Palette"
Cohesion: 1.0
Nodes (1): BlockPalette Component

### Community 18 - "Backtest Summary Modal"
Cohesion: 1.0
Nodes (1): BacktestSummaryModal Component

### Community 19 - "Limit Order Node"
Cohesion: 1.0
Nodes (1): LimitOrderNode (agent action)

### Community 20 - "Notification Node"
Cohesion: 1.0
Nodes (1): NotificationNode (agent action)

### Community 21 - "Chart Marker Node"
Cohesion: 1.0
Nodes (1): AddChartMarkerNode (agent action)

### Community 22 - "Price Feed Node"
Cohesion: 1.0
Nodes (1): PriceFeedNode (agent data)

### Community 23 - "Wallet Balance Node"
Cohesion: 1.0
Nodes (1): WalletBalanceNode (agent data)

### Community 24 - "Condition Node"
Cohesion: 1.0
Nodes (1): ConditionNode (agent logic)

### Community 25 - "Moving Average Node"
Cohesion: 1.0
Nodes (1): MovingAverageNode (agent logic)

### Community 26 - "Threshold Alert Node"
Cohesion: 1.0
Nodes (1): ThresholdAlertNode (agent logic)

### Community 27 - "Block Templates Registry"
Cohesion: 1.0
Nodes (1): block-templates.ts

### Community 28 - "Block ID Generator"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "MetaMask Provider (avax)"
Cohesion: 1.0
Nodes (1): connectMetaMask() (avax-agent)

### Community 30 - "Markdown Renderer (avax)"
Cohesion: 1.0
Nodes (1): renderMarkdown() (avax-agent sidebar)

### Community 31 - "Landing Layout"
Cohesion: 1.0
Nodes (1): LandingLayout

### Community 32 - "Transaction History Page"
Cohesion: 1.0
Nodes (1): TransactionHistory Page

### Community 33 - "Pill Nav"
Cohesion: 1.0
Nodes (1): PillNav Component

### Community 34 - "Stats Widget"
Cohesion: 1.0
Nodes (1): StatsWidget Component

### Community 35 - "Tubelight Navbar"
Cohesion: 1.0
Nodes (1): TubelightNavbar Component

### Community 36 - "LiquidEther Animation"
Cohesion: 1.0
Nodes (1): LiquidEther Component

## Knowledge Gaps
- **52 isolated node(s):** `React 19`, `viem v2`, `RainbowKit Wallet`, `shadcn/ui Component Library`, `Tailwind CSS` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Node Factory`** (2 nodes): `createNodeInstance()`, `init() (BaseNode)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Avalanche Wallet Hook`** (1 nodes): `use-avalanche-wallet Hook`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pool Liquidity UI`** (1 nodes): `PoolLiquidity Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Selected Pool Info`** (1 nodes): `SelectedPoolInfo Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Swap History`** (1 nodes): `SwapHistory Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Toggle Section`** (1 nodes): `ToggleSection Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agent Wallet Card`** (1 nodes): `AgentWalletCard Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Net Worth Card`** (1 nodes): `NetWorthCard Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Block Palette`** (1 nodes): `BlockPalette Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Backtest Summary Modal`** (1 nodes): `BacktestSummaryModal Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Limit Order Node`** (1 nodes): `LimitOrderNode (agent action)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notification Node`** (1 nodes): `NotificationNode (agent action)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Chart Marker Node`** (1 nodes): `AddChartMarkerNode (agent action)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Price Feed Node`** (1 nodes): `PriceFeedNode (agent data)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Wallet Balance Node`** (1 nodes): `WalletBalanceNode (agent data)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Condition Node`** (1 nodes): `ConditionNode (agent logic)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Moving Average Node`** (1 nodes): `MovingAverageNode (agent logic)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Threshold Alert Node`** (1 nodes): `ThresholdAlertNode (agent logic)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Block Templates Registry`** (1 nodes): `block-templates.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Block ID Generator`** (1 nodes): `generateBlockId()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `MetaMask Provider (avax)`** (1 nodes): `connectMetaMask() (avax-agent)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Markdown Renderer (avax)`** (1 nodes): `renderMarkdown() (avax-agent sidebar)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Landing Layout`** (1 nodes): `LandingLayout`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Transaction History Page`** (1 nodes): `TransactionHistory Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pill Nav`** (1 nodes): `PillNav Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Stats Widget`** (1 nodes): `StatsWidget Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tubelight Navbar`** (1 nodes): `TubelightNavbar Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LiquidEther Animation`** (1 nodes): `LiquidEther Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `OmeSwap / Avalanche DEX` connect `Avalanche Chain Config` to `Smart Contracts & Web3 Stack`, `Agent Builder UI`, `App Shell & Navigation`?**
  _High betweenness centrality (0.191) - this node is a cross-community bridge._
- **Why does `runBot()` connect `Agent Builder UI` to `Agent Execution Trigger`?**
  _High betweenness centrality (0.134) - this node is a cross-community bridge._
- **Why does `Next.js 15 (App Router)` connect `Agent Builder UI` to `Avalanche Chain Config`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `runBot()` (e.g. with `setStatus()` and `runBacktest()`) actually correct?**
  _`runBot()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `MultiTokenLiquidityPools Contract` (e.g. with `use-liquidity Hook` and `DEXPriceNode (agent data)`) actually correct?**
  _`MultiTokenLiquidityPools Contract` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `AppLayout` (e.g. with `Trade Page (app/trade)` and `Portfolio Analytics Page`) actually correct?**
  _`AppLayout` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `React 19`, `viem v2`, `RainbowKit Wallet` to the rest of the system?**
  _52 weakly-connected nodes found - possible documentation gaps or missing edges._