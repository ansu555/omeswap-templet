# Graph Report - omeswap-templet  (2026-05-03)

## Corpus Check
- 533 files · ~311,983 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1500 nodes · 1932 edges · 101 communities detected
- Extraction: 69% EXTRACTED · 31% INFERRED · 0% AMBIGUOUS · INFERRED: 591 edges (avg confidence: 0.73)
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
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 69|Community 69]]
- [[_COMMUNITY_Community 71|Community 71]]
- [[_COMMUNITY_Community 72|Community 72]]
- [[_COMMUNITY_Community 73|Community 73]]
- [[_COMMUNITY_Community 74|Community 74]]
- [[_COMMUNITY_Community 75|Community 75]]
- [[_COMMUNITY_Community 76|Community 76]]
- [[_COMMUNITY_Community 77|Community 77]]
- [[_COMMUNITY_Community 78|Community 78]]
- [[_COMMUNITY_Community 79|Community 79]]
- [[_COMMUNITY_Community 80|Community 80]]
- [[_COMMUNITY_Community 81|Community 81]]
- [[_COMMUNITY_Community 82|Community 82]]
- [[_COMMUNITY_Community 84|Community 84]]
- [[_COMMUNITY_Community 87|Community 87]]
- [[_COMMUNITY_Community 88|Community 88]]
- [[_COMMUNITY_Community 89|Community 89]]
- [[_COMMUNITY_Community 90|Community 90]]
- [[_COMMUNITY_Community 91|Community 91]]
- [[_COMMUNITY_Community 92|Community 92]]
- [[_COMMUNITY_Community 93|Community 93]]
- [[_COMMUNITY_Community 94|Community 94]]
- [[_COMMUNITY_Community 95|Community 95]]
- [[_COMMUNITY_Community 96|Community 96]]
- [[_COMMUNITY_Community 97|Community 97]]
- [[_COMMUNITY_Community 101|Community 101]]
- [[_COMMUNITY_Community 102|Community 102]]
- [[_COMMUNITY_Community 109|Community 109]]
- [[_COMMUNITY_Community 111|Community 111]]
- [[_COMMUNITY_Community 116|Community 116]]
- [[_COMMUNITY_Community 186|Community 186]]
- [[_COMMUNITY_Community 187|Community 187]]
- [[_COMMUNITY_Community 188|Community 188]]
- [[_COMMUNITY_Community 189|Community 189]]
- [[_COMMUNITY_Community 190|Community 190]]
- [[_COMMUNITY_Community 191|Community 191]]
- [[_COMMUNITY_Community 192|Community 192]]
- [[_COMMUNITY_Community 193|Community 193]]
- [[_COMMUNITY_Community 194|Community 194]]
- [[_COMMUNITY_Community 195|Community 195]]
- [[_COMMUNITY_Community 196|Community 196]]
- [[_COMMUNITY_Community 386|Community 386]]
- [[_COMMUNITY_Community 387|Community 387]]
- [[_COMMUNITY_Community 388|Community 388]]
- [[_COMMUNITY_Community 389|Community 389]]
- [[_COMMUNITY_Community 390|Community 390]]
- [[_COMMUNITY_Community 391|Community 391]]

## God Nodes (most connected - your core abstractions)
1. `GET()` - 94 edges
2. `POST()` - 54 edges
3. `AgentState` - 46 edges
4. `SignalVote` - 36 edges
5. `PATCH()` - 31 edges
6. `RiskDecision` - 29 edges
7. `DataPacket` - 28 edges
8. `check()` - 23 edges
9. `GraphVote` - 17 edges
10. `check()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Avalanche DEX (README)` --semantically_similar_to--> `Omeswap on 0G Chain (dev guide)`  [AMBIGUOUS] [semantically similar]
  README.md → CLAUDE.md
- `POST()` --calls--> `createSupabaseAdminClient()`  [INFERRED]
  app/api/onboarding/route.ts → lib/supabase/server.ts
- `POST()` --calls--> `ensureCreator()`  [INFERRED]
  app/api/onboarding/route.ts → lib/marketplace/creator.ts
- `POST()` --calls--> `validateMarketplaceStrategyPayload()`  [INFERRED]
  app/api/onboarding/route.ts → lib/marketplace/validate-strategy.ts
- `POST()` --calls--> `validateIndicatorPayload()`  [INFERRED]
  app/api/onboarding/route.ts → lib/marketplace/validate-strategy.ts

## Hyperedges (group relationships)
- **DEX Trading Flow: Page → Hooks → Smart Contracts** — 10_app_shell_report_tradepage, 12_trade_report_swapcarddex, 01_implementation_summary_use_dex_swap, 00_root_readme_multihopswaprouter, 00_root_readme_avalanche_mainnet [INFERRED 0.85]
- **Uniswap ecosystem marketing bento set** — liquidityprovisions_bento_art, tradingapi_bento_art, unichain_bento_art, uniswapx_bg_lightning, uniswapx_wordmark_ui [INFERRED 0.75]
- **Marketplace README anchors full and MVP specs** — mp_readme_hub, mp_full_implementation, mp_mvp_spec [INFERRED 0.82]
- **Execution flow doc and phase index define ATS rollout** — docats_agent_execution_flow, phases_index, phase0_foundation [INFERRED 0.76]
- **0G guideline and recode log document same migration** — docguideline_0g_integration, docrecode_0g_upgrade, claude_omeswap_zerog [INFERRED 0.74]
- **Raw market data normalized into typed packets for downstream agents** — phase1_raw_queue, phase1_normalizer, phase1_normalized_queue, phase1_price_buffer_redis [EXTRACTED 1.00]
- **Global regime from HMM gates indicator choice and downstream risk sizing** — phase2_regime_current, phase2_hmm_regime_hmm, phase3_agent2_signal, phase5_agent5_risk [INFERRED 0.84]
- **LangGraph cycle collects votes, persists receipt, may invoke execution** — phase6_langgraph_orchestrator, phase6_run_pipeline, phase6_decision_receipt, phase7_agent6_execution, phase8_fastapi_ats [EXTRACTED 1.00]
- **Public MetaMask logo asset for wallet recognition and branding** — meta_mask_logo_png_asset, metamask_low_poly_fox_brand_mark, metamask_wallet_product, wallet_branding_in_product_ui [INFERRED 0.87]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (79): Agent5Risk, Agent6Execution, Agent 6 — Execution Agent.  Responsibilities:   1. Receive an approved RiskDecis, Execution agent — wraps strategy selection, confirmation, and state update., Execute the approved order and return updated state.          Returns state unch, _to_wei(), BaseModel, BaseSettings (+71 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (37): isAdminWallet(), parseAdminWallets(), ensureCreator(), buildStoredAnswers(), computeRiskScore(), getRiskCategory(), isValidRiskResponses(), isValidWalletAddress() (+29 more)

### Community 2 - "Community 2"
Cohesion: 0.05
Nodes (56): Agent4RegimeDetection, Agent 4 — Market Regime Detection  Runs every 15 minutes, classifies the global, build_features(), build_multi_token_features(), Feature matrix builder for regime detection.  Any agent can call build_features(, Build a (1, 3) feature matrix for `ticker`.      Args:         ticker: uppercase, Build feature matrices for multiple tickers in one call.     Fetches the funding, get_avg_funding_rate() (+48 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (58): Agent2Signal, Agent 2 — Signal Agent  Drains normalized_queue (written by Agent 1). For each p, Agent3Graph, combine(), Signal combiner — merges sentiment + technicals into a final directional vote., Produce a SignalVote from the two sub-module outputs.      Args:         ticker:, Run Agent2 (Signal) and Agent3 (Graph) using the current regime., Agent5 evaluates after both Signal and Graph complete (fan-in). (+50 more)

### Community 4 - "Community 4"
Cohesion: 0.05
Nodes (40): ConfigPanel(), formatValue(), getIndicator(), unregisterIndicator(), buildNewsItems(), buildSecurityData(), buildSocialPlatforms(), DELETE() (+32 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (45): apply_multipliers(), compute_stop_loss(), compute_take_profit(), kelly_fraction(), f* = (p*b - q) / b, scaled to quarter-Kelly., check(), _evaluate(), _make_portfolio() (+37 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (19): listWorkflows(), loadFromSession(), constructor(), init(), setConfig(), setStatus(), loadInitialChart(), syncIndicatorSeries() (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.11
Nodes (29): Agent1DataIngestion, Runs all data source workers plus the central normalization loop concurrently., binance_ws_worker(), coingecko_poller_worker(), _domain_source(), news_poller_worker(), _anomaly_check(), cq_score() (+21 more)

### Community 8 - "Community 8"
Cohesion: 0.08
Nodes (11): runBacktest(), runBot(), topologicalSort(), fetchBinanceHistory(), MergeNode, ScheduleTriggerNode, executeOnce(), getScheduleNode() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.07
Nodes (6): handleToggleActive(), AgentChatbotService, handleSubmit(), AgentStorageManager, AgentValidator, generateBlockId()

### Community 10 - "Community 10"
Cohesion: 0.08
Nodes (30): approve_token(), get_agent_address(), get_quote(), get_token_balance(), get_w3(), DEX client — web3.py async wrapper for the 0G DEX (Trader Joe V2-compatible) rou, Derive the public address from the configured private key., Call getAmountsOut — returns expected output in token_out's smallest unit. (+22 more)

### Community 11 - "Community 11"
Cohesion: 0.1
Nodes (24): registerBuiltinIndicators(), compileUserIndicator(), evalExpr(), scalarOf(), closes(), ema(), fillNulls(), highest() (+16 more)

### Community 12 - "Community 12"
Cohesion: 0.08
Nodes (15): execute_activation(), TriggerRequest, Launch the stop-loss background monitor (call once at API startup)., chat(), ChatRequest, _get_client(), startup(), websocket_endpoint() (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.11
Nodes (24): Agent 1 Data Ingestion, normalized_queue, normalizer (CQ, dedup, DataPacket), Redis price_buffer tickers, raw_queue, Agent 4 Regime Detection, RegimeHMM / regime_hmm.pkl, regime:current Redis key (+16 more)

### Community 14 - "Community 14"
Cohesion: 0.2
Nodes (10): connectWallet(), getMetaMaskProvider(), getPublicProvider(), getChainConfig(), getDefaultChainId(), getDexRouters(), getExplorerLink(), getTokens() (+2 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (3): handleSubmit(), calculateRiskScore(), clamp01()

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (4): isExternalLink(), isRouterLink(), layout(), onResize()

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (3): clsx(), clsx(), cn()

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (3): useChatContext(), AgentBuilderContent(), AgentBuilderPage()

### Community 21 - "Community 21"
Cohesion: 0.48
Nodes (5): Pagination(), PaginationEllipsis(), PaginationLink(), PaginationNext(), PaginationPrevious()

### Community 23 - "Community 23"
Cohesion: 0.48
Nodes (5): addToRemoveQueue(), dispatch(), genId(), reducer(), toast()

### Community 24 - "Community 24"
Cohesion: 0.43
Nodes (5): ensureIndicatorId(), ensureStrategyId(), publishIndicator(), publishStrategy(), saveDraftStrategy()

### Community 25 - "Community 25"
Cohesion: 0.43
Nodes (4): handleAddAddress(), handleDeleteAddress(), saveToLocalStorage(), validateAddress()

### Community 26 - "Community 26"
Cohesion: 0.52
Nodes (6): appendLog(), downloadFromStorage(), getSDK(), loadAgentMemory(), saveAgentMemory(), uploadToStorage()

### Community 27 - "Community 27"
Cohesion: 0.47
Nodes (3): postInferenceResult(), postSwarmMessage(), submitToDA()

### Community 31 - "Community 31"
Cohesion: 0.6
Nodes (3): cn(), ItemGroup(), ItemSeparator()

### Community 32 - "Community 32"
Cohesion: 0.6
Nodes (3): cn(), handleKeyDown(), useSidebar()

### Community 34 - "Community 34"
Cohesion: 0.6
Nodes (3): readLayout(), storageKey(), writeLayout()

### Community 35 - "Community 35"
Cohesion: 0.4
Nodes (2): TransactionHistory(), useHydrateTransactionStore()

### Community 36 - "Community 36"
Cohesion: 0.4
Nodes (4): Primary path: large Next.js wordmark geometry (fill #000), Secondary path: small Next.js mark / sub-wordmark detail (fill #000), SVG root (viewBox 0 0 394 80, fill none, xmlns SVG 1.1), Next.js framework default logo asset (public static SVG)

### Community 37 - "Community 37"
Cohesion: 0.4
Nodes (4): Primary path: large Next.js wordmark geometry (fill #000), Secondary path: small Next.js mark / sub-wordmark detail (fill #000), SVG root (viewBox 0 0 394 80, fill none, xmlns SVG 1.1), Next.js framework default logo asset (public static SVG)

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (4): Browser or OS window chrome icon (frame + traffic-light dots), Window outer frame path (rounded rectangle, fill #666), Title bar control dots (three .75-radius circles, fill #666), SVG root (viewBox 0 0 16 16, fill none)

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (4): Browser or OS window chrome icon (frame + traffic-light dots), Window outer frame path (rounded rectangle, fill #666), Title bar control dots (three .75-radius circles, fill #666), SVG root (viewBox 0 0 16 16, fill none)

### Community 40 - "Community 40"
Cohesion: 0.4
Nodes (5): Liquidity provisions bento illustration, Omeswap purple swirl brand mark, Omeswap Explore dashboard marketing screenshot, Trading API bento illustration, Unichain bento graphic

### Community 41 - "Community 41"
Cohesion: 0.4
Nodes (5): ATS Agent Execution Flow, Phase 0 foundation and infrastructure, ATS implementation phases index, Development record (Phase 0 ATS), Python dependency phases

### Community 42 - "Community 42"
Cohesion: 0.5
Nodes (5): Coinbase navigation logo (SVG), Coinbase brand identity, Primary fill #0052FF, Stylized C ring logo geometry, Navigation header brand glyph

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (2): onMove(), onUp()

### Community 44 - "Community 44"
Cohesion: 0.5
Nodes (1): MovingAverageNode

### Community 45 - "Community 45"
Cohesion: 0.5
Nodes (1): AccumulatorNode

### Community 46 - "Community 46"
Cohesion: 0.5
Nodes (1): ConditionNode

### Community 47 - "Community 47"
Cohesion: 0.5
Nodes (1): MathNode

### Community 48 - "Community 48"
Cohesion: 0.5
Nodes (1): PreviousValueNode

### Community 49 - "Community 49"
Cohesion: 0.5
Nodes (1): ThresholdAlertNode

### Community 50 - "Community 50"
Cohesion: 0.5
Nodes (1): DelayNode

### Community 51 - "Community 51"
Cohesion: 0.5
Nodes (1): LimitOrderNode

### Community 52 - "Community 52"
Cohesion: 0.5
Nodes (1): AddChartMarkerNode

### Community 53 - "Community 53"
Cohesion: 0.5
Nodes (1): NotificationNode

### Community 54 - "Community 54"
Cohesion: 0.5
Nodes (1): WalletBalanceNode

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (1): DEXPriceNode

### Community 56 - "Community 56"
Cohesion: 0.5
Nodes (1): PriceFeedNode

### Community 57 - "Community 57"
Cohesion: 0.5
Nodes (1): EndNode

### Community 58 - "Community 58"
Cohesion: 0.5
Nodes (1): StartNode

### Community 61 - "Community 61"
Cohesion: 0.5
Nodes (1): cn()

### Community 62 - "Community 62"
Cohesion: 0.67
Nodes (2): cn(), useChart()

### Community 69 - "Community 69"
Cohesion: 0.67
Nodes (2): agentReason(), computeInference()

### Community 71 - "Community 71"
Cohesion: 0.5
Nodes (3): Generic document or file attachment icon (page with folded corner and text lines), Single compound path: folded sheet, corner fold triangle, horizontal rule lines (fill #666, evenodd), SVG root (viewBox 0 0 16 16, fill none, W3C SVG namespace)

### Community 72 - "Community 72"
Cohesion: 0.5
Nodes (3): Generic document or file attachment icon (page with folded corner and text lines), Single compound path: folded sheet, corner fold triangle, horizontal rule lines (fill #666, evenodd), SVG root (viewBox 0 0 16 16, fill none, W3C SVG namespace)

### Community 73 - "Community 73"
Cohesion: 0.5
Nodes (3): World or internet globe UI glyph (16px), Globe meridian grid path (fill #666, fill-rule evenodd), SVG root (viewBox 0 0 16 16, fill none)

### Community 74 - "Community 74"
Cohesion: 0.5
Nodes (3): World or internet globe UI glyph (16px), Globe meridian grid path (fill #666, fill-rule evenodd), SVG root (viewBox 0 0 16 16, fill none)

### Community 75 - "Community 75"
Cohesion: 0.5
Nodes (3): Vercel-style upward triangle mark (brand-associated raster/vector glyph), SVG root (viewBox 0 0 1155 1000, fill none, SVG namespace), Single path triangle (d m577.3 0 577.4 1000H0z, fill #fff)

### Community 76 - "Community 76"
Cohesion: 0.5
Nodes (3): Vercel-style upward triangle mark (brand-associated raster/vector glyph), SVG root (viewBox 0 0 1155 1000, fill none, SVG namespace), Single path triangle (d m577.3 0 577.4 1000H0z, fill #fff)

### Community 77 - "Community 77"
Cohesion: 0.5
Nodes (4): Omeswap on 0G Chain (dev guide), 0G Chain integration guideline, Recode log (0G migration), Avalanche DEX (README)

### Community 78 - "Community 78"
Cohesion: 0.5
Nodes (4): Strategy Builder (BUILT), Agentic Trading System v3.0, ATS Marketplace design (UX), Marketplace documentation hub

### Community 79 - "Community 79"
Cohesion: 0.67
Nodes (4): meta-mask-logo.png (MetaMask fox logo image), MetaMask low-poly fox head brand mark, MetaMask (browser extension / crypto wallet product), Wallet branding in product (logos, connect flows, trust cues)

### Community 80 - "Community 80"
Cohesion: 0.67
Nodes (1): RootLayout()

### Community 81 - "Community 81"
Cohesion: 0.67
Nodes (1): Home()

### Community 82 - "Community 82"
Cohesion: 1.0
Nodes (2): inlineMarkdown(), renderMarkdown()

### Community 84 - "Community 84"
Cohesion: 0.67
Nodes (1): TerminalPage()

### Community 87 - "Community 87"
Cohesion: 0.67
Nodes (1): Header()

### Community 88 - "Community 88"
Cohesion: 0.67
Nodes (1): ButtonGroup()

### Community 89 - "Community 89"
Cohesion: 0.67
Nodes (1): cn()

### Community 90 - "Community 90"
Cohesion: 0.67
Nodes (1): cn()

### Community 91 - "Community 91"
Cohesion: 0.67
Nodes (1): Toaster()

### Community 92 - "Community 92"
Cohesion: 0.67
Nodes (1): cn()

### Community 93 - "Community 93"
Cohesion: 0.67
Nodes (1): cn()

### Community 94 - "Community 94"
Cohesion: 0.67
Nodes (1): Badge()

### Community 95 - "Community 95"
Cohesion: 0.67
Nodes (1): Spinner()

### Community 96 - "Community 96"
Cohesion: 0.67
Nodes (1): Skeleton()

### Community 97 - "Community 97"
Cohesion: 0.67
Nodes (1): useCarousel()

### Community 101 - "Community 101"
Cohesion: 0.67
Nodes (1): ThemeProvider()

### Community 102 - "Community 102"
Cohesion: 0.67
Nodes (1): useIsMobile()

### Community 109 - "Community 109"
Cohesion: 1.0
Nodes (2): fmt(), InfoTile()

### Community 111 - "Community 111"
Cohesion: 1.0
Nodes (2): getScoreColor(), ScoreCard()

### Community 116 - "Community 116"
Cohesion: 0.67
Nodes (3): MultiTokenLiquidityPools Contract, Rationale: Uniswap V2 AMM as design basis, Uniswap V2 AMM Design

### Community 186 - "Community 186"
Cohesion: 1.0
Nodes (1): Phase 7 — Execution sub-package.  Modules:     dex_client       — web3.py wrappe

### Community 187 - "Community 187"
Cohesion: 1.0
Nodes (2): Avalanche Mainnet (Chain ID 43114), Rationale: Avalanche chosen for low gas fees

### Community 188 - "Community 188"
Cohesion: 1.0
Nodes (2): Vercel Triangle Logo, Vercel Deployment

### Community 189 - "Community 189"
Cohesion: 1.0
Nodes (2): File Icon, Window Icon

### Community 190 - "Community 190"
Cohesion: 1.0
Nodes (2): Globe Icon, Next.js Documentation

### Community 191 - "Community 191"
Cohesion: 1.0
Nodes (2): ClipPath id a: 16x16 rectangular mask (white fill), Group with clip-path url(#a)

### Community 192 - "Community 192"
Cohesion: 1.0
Nodes (2): ClipPath id a: 16x16 rectangular mask (white fill), Group with clip-path url(#a)

### Community 193 - "Community 193"
Cohesion: 1.0
Nodes (2): Next.js Wordmark, Next.js Starter Project

### Community 194 - "Community 194"
Cohesion: 1.0
Nodes (2): UniswapX purple lightning background, UniswapX wordmark and gasless swap UI chrome

### Community 195 - "Community 195"
Cohesion: 1.0
Nodes (2): Marketplace full implementation blueprint, Marketplace MVP spec

### Community 196 - "Community 196"
Cohesion: 1.0
Nodes (2): WalletConnect logo (PNG, public/), WalletConnect (wallet connection infrastructure)

### Community 386 - "Community 386"
Cohesion: 1.0
Nodes (1): PoolPage() Component

### Community 387 - "Community 387"
Cohesion: 1.0
Nodes (1): app/(app)/trade/page.tsx

### Community 388 - "Community 388"
Cohesion: 1.0
Nodes (1): OmeSwap / Avalanche DEX

### Community 389 - "Community 389"
Cohesion: 1.0
Nodes (1): avax-agent (standalone Next.js app)

### Community 390 - "Community 390"
Cohesion: 1.0
Nodes (1): Geist Font Setup

### Community 391 - "Community 391"
Cohesion: 1.0
Nodes (1): Graphify multi-slice process

## Ambiguous Edges - Review These
- `Next.js Documentation` → `Globe Icon`  [AMBIGUOUS]
  avax-agent/README.md · relation: conceptually_related_to
- `Avalanche DEX (README)` → `Omeswap on 0G Chain (dev guide)`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to

## Knowledge Gaps
- **117 isolated node(s):** `Train the regime HMM on historical daily price data.  Run once before first depl`, `Download daily price history from CoinGecko. Returns list of prices.`, `Build (N, 3) feature matrix from a price series:       col 0: daily return`, `Config`, `Runs all data source workers plus the central normalization loop concurrently.` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 35`** (5 nodes): `page.tsx`, `TransactionHistory()`, `transaction-store.ts`, `persist()`, `useHydrateTransactionStore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (4 nodes): `ChartPanel.tsx`, `onMove()`, `onUp()`, `ChartPanel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (4 nodes): `MovingAverageNode.ts`, `MovingAverageNode.ts`, `MovingAverageNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (4 nodes): `AccumulatorNode`, `.execute()`, `AccumulatorNode.ts`, `AccumulatorNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (4 nodes): `ConditionNode.ts`, `ConditionNode`, `.execute()`, `ConditionNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (4 nodes): `MathNode.ts`, `MathNode.ts`, `MathNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (4 nodes): `PreviousValueNode.ts`, `PreviousValueNode.ts`, `PreviousValueNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (4 nodes): `ThresholdAlertNode.ts`, `ThresholdAlertNode.ts`, `ThresholdAlertNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (4 nodes): `DelayNode.ts`, `DelayNode`, `.execute()`, `DelayNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (4 nodes): `LimitOrderNode.ts`, `LimitOrderNode.ts`, `LimitOrderNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (4 nodes): `AddChartMarkerNode`, `.execute()`, `AddChartMarkerNode.ts`, `AddChartMarkerNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (4 nodes): `NotificationNode.ts`, `NotificationNode.ts`, `NotificationNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (4 nodes): `WalletBalanceNode.ts`, `WalletBalanceNode.ts`, `WalletBalanceNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (4 nodes): `DEXPriceNode.ts`, `DEXPriceNode`, `.execute()`, `DEXPriceNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (4 nodes): `PriceFeedNode.ts`, `PriceFeedNode.ts`, `PriceFeedNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (4 nodes): `EndNode.ts`, `EndNode`, `.execute()`, `EndNode.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (4 nodes): `StartNode.ts`, `StartNode.ts`, `StartNode`, `.execute()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (4 nodes): `Calendar()`, `cn()`, `calendar.tsx`, `calendar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (4 nodes): `cn()`, `useChart()`, `chart.tsx`, `chart.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 69`** (4 nodes): `agentReason()`, `computeInference()`, `listComputeModels()`, `compute.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 80`** (3 nodes): `layout.tsx`, `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 81`** (3 nodes): `page.tsx`, `page.tsx`, `Home()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 82`** (3 nodes): `inlineMarkdown()`, `renderMarkdown()`, `AgentSidebar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 84`** (3 nodes): `page.tsx`, `page.tsx`, `TerminalPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 87`** (3 nodes): `Header.tsx`, `header.tsx`, `Header()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 88`** (3 nodes): `ButtonGroup()`, `button-group.tsx`, `button-group.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 89`** (3 nodes): `input-group.tsx`, `input-group.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 90`** (3 nodes): `field.tsx`, `field.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 91`** (3 nodes): `sonner.tsx`, `sonner.tsx`, `Toaster()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 92`** (3 nodes): `empty.tsx`, `empty.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 93`** (3 nodes): `kbd.tsx`, `kbd.tsx`, `cn()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 94`** (3 nodes): `Badge()`, `badge.tsx`, `badge.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 95`** (3 nodes): `spinner.tsx`, `spinner.tsx`, `Spinner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 96`** (3 nodes): `skeleton.tsx`, `skeleton.tsx`, `Skeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 97`** (3 nodes): `useCarousel()`, `carousel.tsx`, `carousel.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 101`** (3 nodes): `theme-provider.tsx`, `theme-provider.tsx`, `ThemeProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 102`** (3 nodes): `use-mobile.tsx`, `use-mobile.tsx`, `useIsMobile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 109`** (3 nodes): `InfoTile.tsx`, `fmt()`, `InfoTile()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 111`** (3 nodes): `ScoreCard.tsx`, `getScoreColor()`, `ScoreCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 186`** (2 nodes): `__init__.py`, `Phase 7 — Execution sub-package.  Modules:     dex_client       — web3.py wrappe`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 187`** (2 nodes): `Avalanche Mainnet (Chain ID 43114)`, `Rationale: Avalanche chosen for low gas fees`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 188`** (2 nodes): `Vercel Triangle Logo`, `Vercel Deployment`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 189`** (2 nodes): `File Icon`, `Window Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 190`** (2 nodes): `Globe Icon`, `Next.js Documentation`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 191`** (2 nodes): `ClipPath id a: 16x16 rectangular mask (white fill)`, `Group with clip-path url(#a)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 192`** (2 nodes): `ClipPath id a: 16x16 rectangular mask (white fill)`, `Group with clip-path url(#a)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 193`** (2 nodes): `Next.js Wordmark`, `Next.js Starter Project`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 194`** (2 nodes): `UniswapX purple lightning background`, `UniswapX wordmark and gasless swap UI chrome`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 195`** (2 nodes): `Marketplace full implementation blueprint`, `Marketplace MVP spec`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 196`** (2 nodes): `WalletConnect logo (PNG, public/)`, `WalletConnect (wallet connection infrastructure)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 386`** (1 nodes): `PoolPage() Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 387`** (1 nodes): `app/(app)/trade/page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 388`** (1 nodes): `OmeSwap / Avalanche DEX`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 389`** (1 nodes): `avax-agent (standalone Next.js app)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 390`** (1 nodes): `Geist Font Setup`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 391`** (1 nodes): `Graphify multi-slice process`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Next.js Documentation` and `Globe Icon`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Avalanche DEX (README)` and `Omeswap on 0G Chain (dev guide)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Why does `GET()` connect `Community 4` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 5`, `Community 7`, `Community 8`, `Community 10`, `Community 12`, `Community 20`?**
  _High betweenness centrality (0.119) - this node is a cross-community bridge._
- **Why does `runBot()` connect `Community 8` to `Community 0`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `POST()` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Are the 59 inferred relationships involving `GET()` (e.g. with `runBacktest()` and `runBot()`) actually correct?**
  _`GET()` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Are the 21 inferred relationships involving `POST()` (e.g. with `buildSystemPrompt()` and `requireWallet()`) actually correct?**
  _`POST()` has 21 INFERRED edges - model-reasoned connections that need verification._