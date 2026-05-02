# Graph Report - omeswap-templet  (2026-05-02)

## Corpus Check
- 426 files · ~253,072 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 845 nodes · 677 edges · 60 communities detected
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 80 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]
- [[_COMMUNITY_Community 66|Community 66]]
- [[_COMMUNITY_Community 70|Community 70]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 141|Community 141]]
- [[_COMMUNITY_Community 308|Community 308]]
- [[_COMMUNITY_Community 309|Community 309]]
- [[_COMMUNITY_Community 310|Community 310]]
- [[_COMMUNITY_Community 311|Community 311]]

## God Nodes (most connected - your core abstractions)
1. `POST()` - 54 edges
2. `GET()` - 49 edges
3. `AgentStorageManager` - 12 edges
4. `runBot()` - 10 edges
5. `handleRun()` - 8 edges
6. `ScheduleTriggerNode` - 7 edges
7. `createNodeInstance()` - 6 edges
8. `getChainConfig()` - 6 edges
9. `getWalletFromRequest()` - 6 edges
10. `requireWallet()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `ConfigPanel()`  [INFERRED]
  app/api/onboarding/route.ts → components/agent-builder/canvas/ConfigPanel.tsx
- `POST()` --calls--> `requireWallet()`  [INFERRED]
  app/api/onboarding/route.ts → lib/marketplace/wallet-header.ts
- `POST()` --calls--> `createSupabaseAdminClient()`  [INFERRED]
  app/api/onboarding/route.ts → lib/supabase/server.ts
- `POST()` --calls--> `ensureCreator()`  [INFERRED]
  app/api/onboarding/route.ts → lib/marketplace/creator.ts
- `POST()` --calls--> `validateMarketplaceStrategyPayload()`  [INFERRED]
  app/api/onboarding/route.ts → lib/marketplace/validate-strategy.ts

## Hyperedges (group relationships)
- **DEX Trading Flow: Page → Hooks → Smart Contracts** — 10_app_shell_report_tradepage, 12_trade_report_swapcarddex, 01_implementation_summary_use_dex_swap, 00_root_readme_multihopswaprouter, 00_root_readme_avalanche_mainnet [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.04
Nodes (32): isAdminWallet(), parseAdminWallets(), ensureCreator(), buildStoredAnswers(), computeRiskScore(), getRiskCategory(), isValidRiskResponses(), buildStoredAnswers() (+24 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (27): isValidWalletAddress(), normalizeWalletAddress(), buildNewsItems(), buildSecurityData(), buildSocialPlatforms(), DELETE(), fetchFromCoinGecko(), fetchFromCoinMarketCap() (+19 more)

### Community 2 - "Community 2"
Cohesion: 0.08
Nodes (19): listWorkflows(), loadFromSession(), constructor(), init(), setConfig(), setStatus(), loadInitialChart(), syncIndicatorSeries() (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (11): runBacktest(), runBot(), topologicalSort(), fetchBinanceHistory(), MergeNode, ScheduleTriggerNode, executeOnce(), getScheduleNode() (+3 more)

### Community 4 - "Community 4"
Cohesion: 0.1
Nodes (5): handleToggleActive(), AgentChatbotService, handleSubmit(), AgentValidator, generateBlockId()

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (10): connectWallet(), getMetaMaskProvider(), getPublicProvider(), getChainConfig(), getDefaultChainId(), getDexRouters(), getExplorerLink(), getTokens() (+2 more)

### Community 6 - "Community 6"
Cohesion: 0.24
Nodes (1): AgentStorageManager

### Community 7 - "Community 7"
Cohesion: 0.22
Nodes (4): isExternalLink(), isRouterLink(), layout(), onResize()

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (2): handleSubmit(), calculateRiskScore()

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (3): clsx(), clsx(), cn()

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (3): useChatContext(), AgentBuilderContent(), AgentBuilderPage()

### Community 13 - "Community 13"
Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 15 - "Community 15"
Cohesion: 0.48
Nodes (5): addToRemoveQueue(), dispatch(), genId(), reducer(), toast()

### Community 16 - "Community 16"
Cohesion: 0.43
Nodes (5): ensureIndicatorId(), ensureStrategyId(), publishIndicator(), publishStrategy(), saveDraftStrategy()

### Community 17 - "Community 17"
Cohesion: 0.43
Nodes (4): handleAddAddress(), handleDeleteAddress(), saveToLocalStorage(), validateAddress()

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (2): ConfigPanel(), formatValue()

### Community 22 - "Community 22"
Cohesion: 0.6
Nodes (3): cn(), ItemGroup(), ItemSeparator()

### Community 23 - "Community 23"
Cohesion: 0.6
Nodes (3): cn(), handleKeyDown(), useSidebar()

### Community 24 - "Community 24"
Cohesion: 0.4
Nodes (2): TransactionHistory(), useHydrateTransactionStore()

### Community 25 - "Community 25"
Cohesion: 0.67
Nodes (2): onMove(), onUp()

### Community 26 - "Community 26"
Cohesion: 0.5
Nodes (1): MovingAverageNode

### Community 27 - "Community 27"
Cohesion: 0.5
Nodes (1): AccumulatorNode

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (1): ConditionNode

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (1): MathNode

### Community 30 - "Community 30"
Cohesion: 0.5
Nodes (1): PreviousValueNode

### Community 31 - "Community 31"
Cohesion: 0.5
Nodes (1): ThresholdAlertNode

### Community 32 - "Community 32"
Cohesion: 0.5
Nodes (1): DelayNode

### Community 33 - "Community 33"
Cohesion: 0.5
Nodes (1): LimitOrderNode

### Community 34 - "Community 34"
Cohesion: 0.5
Nodes (1): AddChartMarkerNode

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (1): NotificationNode

### Community 36 - "Community 36"
Cohesion: 0.5
Nodes (1): WalletBalanceNode

### Community 37 - "Community 37"
Cohesion: 0.5
Nodes (1): DEXPriceNode

### Community 38 - "Community 38"
Cohesion: 0.5
Nodes (1): PriceFeedNode

### Community 39 - "Community 39"
Cohesion: 0.5
Nodes (1): EndNode

### Community 40 - "Community 40"
Cohesion: 0.5
Nodes (1): StartNode

### Community 43 - "Community 43"
Cohesion: 0.5
Nodes (1): cn()

### Community 44 - "Community 44"
Cohesion: 0.67
Nodes (2): cn(), useChart()

### Community 50 - "Community 50"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 51 - "Community 51"
Cohesion: 0.67
Nodes (1): Home()

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (2): inlineMarkdown(), renderMarkdown()

### Community 56 - "Community 56"
Cohesion: 0.67
Nodes (1): Header()

### Community 57 - "Community 57"
Cohesion: 0.67
Nodes (1): ButtonGroup()

### Community 58 - "Community 58"
Cohesion: 0.67
Nodes (1): cn()

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (1): cn()

### Community 60 - "Community 60"
Cohesion: 0.67
Nodes (1): Toaster()

### Community 61 - "Community 61"
Cohesion: 0.67
Nodes (1): cn()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (1): cn()

### Community 63 - "Community 63"
Cohesion: 0.67
Nodes (1): Badge()

### Community 64 - "Community 64"
Cohesion: 0.67
Nodes (1): Spinner()

### Community 65 - "Community 65"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 66 - "Community 66"
Cohesion: 0.67
Nodes (1): useCarousel()

### Community 70 - "Community 70"
Cohesion: 0.67
Nodes (1): ThemeProvider()

### Community 71 - "Community 71"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 76 - "Community 76"
Cohesion: 1.0
Nodes (2): getScoreColor(), ScoreCard()

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (3): MultiTokenLiquidityPools Contract, Rationale: Uniswap V2 AMM as design basis, Uniswap V2 AMM Design

### Community 141 - "Community 141"
Cohesion: 1.0
Nodes (2): Avalanche Mainnet (Chain ID 43114), Rationale: Avalanche chosen for low gas fees

### Community 308 - "Community 308"
Cohesion: 1.0
Nodes (1): PoolPage() Component

### Community 309 - "Community 309"
Cohesion: 1.0
Nodes (1): app/(app)/trade/page.tsx

### Community 310 - "Community 310"
Cohesion: 1.0
Nodes (1): OmeSwap / Avalanche DEX

### Community 311 - "Community 311"
Cohesion: 1.0
Nodes (1): avax-agent (standalone Next.js app)

## Knowledge Gaps
- **8 isolated node(s):** `PoolPage() Component`, `app/(app)/trade/page.tsx`, `OmeSwap / Avalanche DEX`, `Avalanche Mainnet (Chain ID 43114)`, `Uniswap V2 AMM Design` (+3 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 6`** (12 nodes): `AgentStorageManager`, `.clearAll()`, `.deleteAgent()`, `.duplicateAgent()`, `.exportAgent()`, `.getActiveAgentId()`, `.importAgent()`, `.loadAgent()`, `.loadAgents()`, `.saveAgent()`, `.saveAgents()`, `.setActiveAgent()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 8`** (11 nodes): `multi-step-form.tsx`, `risk-score.ts`, `buildReviewItems()`, `getCurrentSelection()`, `goBack()`, `goNext()`, `goToStep()`, `handleSelect()`, `handleSubmit()`, `isStepValid()`, `calculateRiskScore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (6 nodes): `ConfigPanel.tsx`, `ConfigPanel.tsx`, `clsx()`, `ConfigPanel()`, `formatValue()`, `handleChange()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (5 nodes): `page.tsx`, `TransactionHistory()`, `transaction-store.ts`, `persist()`, `useHydrateTransactionStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (4 nodes): `ChartPanel.tsx`, `onMove()`, `onUp()`, `ChartPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (4 nodes): `MovingAverageNode.ts`, `MovingAverageNode.ts`, `MovingAverageNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (4 nodes): `AccumulatorNode`, `.execute()`, `AccumulatorNode.ts`, `AccumulatorNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (4 nodes): `ConditionNode.ts`, `ConditionNode`, `.execute()`, `ConditionNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (4 nodes): `MathNode.ts`, `MathNode.ts`, `MathNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (4 nodes): `PreviousValueNode.ts`, `PreviousValueNode.ts`, `PreviousValueNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (4 nodes): `ThresholdAlertNode.ts`, `ThresholdAlertNode.ts`, `ThresholdAlertNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (4 nodes): `DelayNode.ts`, `DelayNode`, `.execute()`, `DelayNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (4 nodes): `LimitOrderNode.ts`, `LimitOrderNode.ts`, `LimitOrderNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (4 nodes): `AddChartMarkerNode`, `.execute()`, `AddChartMarkerNode.ts`, `AddChartMarkerNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (4 nodes): `NotificationNode.ts`, `NotificationNode.ts`, `NotificationNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (4 nodes): `WalletBalanceNode.ts`, `WalletBalanceNode.ts`, `WalletBalanceNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (4 nodes): `DEXPriceNode.ts`, `DEXPriceNode`, `.execute()`, `DEXPriceNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (4 nodes): `PriceFeedNode.ts`, `PriceFeedNode.ts`, `PriceFeedNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (4 nodes): `EndNode.ts`, `EndNode`, `.execute()`, `EndNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (4 nodes): `StartNode.ts`, `StartNode.ts`, `StartNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (4 nodes): `Calendar()`, `cn()`, `calendar.tsx`, `calendar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `cn()`, `useChart()`, `chart.tsx`, `chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (3 nodes): `layout.tsx`, `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (3 nodes): `page.tsx`, `page.tsx`, `Home()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (3 nodes): `inlineMarkdown()`, `renderMarkdown()`, `AgentSidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (3 nodes): `Header.tsx`, `header.tsx`, `Header()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (3 nodes): `ButtonGroup()`, `button-group.tsx`, `button-group.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (3 nodes): `input-group.tsx`, `input-group.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (3 nodes): `field.tsx`, `field.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (3 nodes): `sonner.tsx`, `sonner.tsx`, `Toaster()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (3 nodes): `empty.tsx`, `empty.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (3 nodes): `kbd.tsx`, `kbd.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (3 nodes): `Badge()`, `badge.tsx`, `badge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (3 nodes): `spinner.tsx`, `spinner.tsx`, `Spinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (3 nodes): `skeleton.tsx`, `skeleton.tsx`, `Skeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 66`** (3 nodes): `useCarousel()`, `carousel.tsx`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 70`** (3 nodes): `theme-provider.tsx`, `theme-provider.tsx`, `ThemeProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 71`** (3 nodes): `use-mobile.tsx`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 76`** (3 nodes): `ScoreCard.tsx`, `getScoreColor()`, `ScoreCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 141`** (2 nodes): `Avalanche Mainnet (Chain ID 43114)`, `Rationale: Avalanche chosen for low gas fees`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 308`** (1 nodes): `PoolPage() Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 309`** (1 nodes): `app/(app)/trade/page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 310`** (1 nodes): `OmeSwap / Avalanche DEX`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 311`** (1 nodes): `avax-agent (standalone Next.js app)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GET()` connect `Community 1` to `Community 0`, `Community 18`, `Community 3`, `Community 12`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `runBot()` connect `Community 3` to `Community 1`, `Community 2`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Are the 21 inferred relationships involving `POST()` (e.g. with `buildSystemPrompt()` and `requireWallet()`) actually correct?**
  _`POST()` has 21 INFERRED edges - model-reasoned connections that need verification._
- **Are the 14 inferred relationships involving `GET()` (e.g. with `runBacktest()` and `runBot()`) actually correct?**
  _`GET()` has 14 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `runBot()` (e.g. with `executeOnce()` and `runBacktest()`) actually correct?**
  _`runBot()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `handleRun()` (e.g. with `.reset()` and `.shouldContinue()`) actually correct?**
  _`handleRun()` has 4 INFERRED edges - model-reasoned connections that need verification._