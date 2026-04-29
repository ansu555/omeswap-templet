# Terminal Page — 5 New Tiles + All-Sides Resize

## Context

The trading terminal at `/app/(app)/terminal` currently has 7 resizable tiles (chart, watchlist, trades, depth, info, order, copilot). The user wants to match Jupiter terminal's layout by adding:

- **News** — token news from Kryll/CoinGecko via `/api/token/[id]`
- **Positions** — connected wallet's LP positions from on-chain
- **Orders** — transaction history (swaps/add/remove) per pool
- **Holders** — holder count + top-holder concentration from Snowtrace API + audit scores
- **Liquidity Depth** — AMM liquidity distribution bar chart (same math as DepthTile, different visual)

All tiles placed below the chart row in the react-grid-layout grid. Every tile gets **all-sides resize handles** (n/s/e/w/ne/nw/se/sw).

---

## Files to Modify

| File | Change |
|------|--------|
| `store/terminal.ts` | Add 5 new TileIds, labels, default layout positions |
| `components/terminal/hooks/useTerminalLayout.ts` | Bump KEY_PREFIX from `v1` → `v2` (avoid stale layout conflicts) |
| `components/terminal/ResponsiveGrid.tsx` | Add `resizeHandles` prop → pass as `resizeConfig={{ handles }}` to RGL |
| `components/terminal/TerminalShell.tsx` | Import 5 new tiles; add 5 cases to `TileBody()` switch; add `resizeHandles` to grid |

## Files to Create

| File | Purpose |
|------|---------|
| `components/terminal/tiles/NewsTile.tsx` | News feed from `/api/token/[id]` |
| `components/terminal/tiles/PositionsTile.tsx` | LP positions via `useReadContract` |
| `components/terminal/tiles/OrdersTile.tsx` | Tx history via `usePoolDetails` hook |
| `components/terminal/tiles/HoldersTile.tsx` | Holders from Snowtrace + audit scores |
| `components/terminal/tiles/LiquidityTile.tsx` | AMM depth as horizontal bar chart (recharts) |

---

## Step-by-Step Implementation

### Step 1 — `store/terminal.ts`

Extend `TileId` union with `"news" | "positions" | "orders" | "holders" | "liquidity"`.  
Add to `ALL_TILE_IDS`, `TILE_LABELS`, and `DEFAULT_LAYOUT`:

```
{ i: "positions", x: 0,  y: 18, w: 4, h: 7, minW: 3, minH: 5 }
{ i: "orders",    x: 4,  y: 18, w: 4, h: 7, minW: 3, minH: 5 }
{ i: "holders",   x: 8,  y: 18, w: 4, h: 7, minW: 3, minH: 5 }
{ i: "news",      x: 0,  y: 25, w: 6, h: 8, minW: 4, minH: 5 }
{ i: "liquidity", x: 6,  y: 25, w: 6, h: 8, minW: 4, minH: 5 }
```
Move `copilot` from `y:17` → `y:33`.

### Step 2 — `useTerminalLayout.ts`

```ts
const KEY_PREFIX = "omeswap.terminal.layout.v2.";
```

### Step 3 — `ResponsiveGrid.tsx`

Add `resizeHandles?: ResizeHandleAxis[]` prop. Pass as `resizeConfig={{ handles: resizeHandles }}` to the underlying `RGL` component. Import `ResizeHandleAxis` from `react-grid-layout`.

### Step 4 — `TerminalShell.tsx`

Add `resizeHandles={['s','w','e','n','sw','nw','se','ne']}` to `<ResponsiveGridLayout>`. Import and add 5 new tile cases to `TileBody()`.

### Step 5 — `NewsTile.tsx`

- `useEffect` fetches `GET /api/token/${activeSymbol.coingeckoId}` on symbol change
- Shows `fundamental.news[]` — title, sentiment badge (green/red), source, time, external link
- Graceful states: no coingeckoId → placeholder; error → error message; empty → "No news"

### Step 6 — `PositionsTile.tsx`

- `useAccount()` for wallet state
- `useReadContract(POOLS, "getPoolId", [activeSymbol.address, TOKENS.USDC.address])` → poolId
- `useReadContract(POOLS, "getUserPosition", [poolId, address])` → LP amounts
- Shows: Pair, Token0 Amt, Token1 Amt, Share %, LP Tokens
- States: wallet disconnected → connect prompt; no position → empty state

### Step 7 — `OrdersTile.tsx`

- Resolves poolId same as PositionsTile (via `useReadContract`)
- Renders inner `PoolOrdersInner` component only after poolId resolves (avoids conditional hook call)
- `PoolOrdersInner` calls `usePoolDetails(poolId, symbol, "USDC")`
- 4 tabs: All | Swaps | Add | Remove
- Filters by connected wallet address when connected; shows all when disconnected
- Columns: Time, Token0 Amt (color-coded by type), Token1 Amt, TxHash (Snowtrace link)

### Step 8 — `HoldersTile.tsx`

- Parallel `Promise.all` on symbol change:
  1. `GET /api/token/${coingeckoId}` → marketCap, supply, auditScores
  2. `GET api.snowtrace.io?module=token&action=tokenholdercount&contractaddress={addr}` → holder count
  3. `GET api.snowtrace.io?module=token&action=tokenholderlist&...&offset=15` → top holders
- Shows: holder count, marketCap, circulatingSupply, audit score bars (Overall/Financial/Social/Security), top-5 holders with address + % bar
- Uses `cancelled` guard to avoid state updates after unmount/symbol-change

### Step 9 — `LiquidityTile.tsx`

- Reads `reserves` and `candles` from `useChartStore`
- Computes 20 bid + 20 ask price/depth rows using AMM constant-product formula (same math as `DepthTile`, inlined)
- Falls back to synthetic 500k/500k reserves when `reserves` is null (same as DepthTile)
- Renders recharts `<BarChart layout="vertical">` — horizontal bars, green=bid, red=ask
- `<ReferenceLine>` at midPrice; tooltip shows USD depth; Y-axis shows price levels

---

## Data Sources Summary

| Tile | Data source |
|------|-------------|
| News | `GET /api/token/[id]` → `fundamental.news` |
| Positions | wagmi `useReadContract` → POOLS contract `getUserPosition` |
| Orders | `hooks/use-pool-details.tsx` `usePoolDetails()` |
| Holders | Snowtrace free API + `/api/token/[id]` auditScores |
| Liquidity | `useChartStore().reserves` (same as DepthTile) |

---

## Key Patterns to Follow

- All interactive elements must use `onMouseDown={(e) => e.stopPropagation()}` (prevent drag)
- Tile headers use `drag-handle` class for draggable area
- Data fetches use `cancelled` flag pattern (matching InfoTile, NewsTile, HoldersTile)
- Pool lookups use `useReadContract` with `query: { enabled: !!poolId }` guards
- Import USDC address from `@/contracts/config` (`TOKENS.USDC.address`), never hardcode
- Explorer links via `getExplorerLink(chainId, "tx", hash)` from `@/lib/chain-registry`

---

## Verification

1. `bun run build` — must pass with no TypeScript errors (critical: all 5 new TileIds satisfy the union type)
2. Load `/terminal` in browser — 5 new tiles visible below existing row
3. Drag any tile by its header → repositions correctly
4. Resize tile from each edge/corner → all 8 handles work
5. Connect wallet → PositionsTile and OrdersTile show wallet data (or empty state)
6. Switch symbols in Watchlist → News/Holders/Liquidity tiles refresh
7. Disconnect wallet → PositionsTile shows "Connect wallet" prompt
8. Reload page → layout persists under v2 key (new tiles visible in saved positions)
