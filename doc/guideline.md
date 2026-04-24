# Chain and DEX Switching Guideline

This guide explains exactly what to create, edit, or delete when you want to:

1. **Switch to a different chain** (e.g., replace Avalanche with Polygon, Base, or BNB Chain)
2. **Add a new chain** alongside the existing one (multi-chain support)
3. **Add a new DEX** to an existing chain
4. **Remove a DEX** from a chain
5. **Change a token address** or add new tokens

---

## Architecture in One Sentence

Everything chain-specific lives in `lib/chain-registry/`. All other files read from the registry using helper functions. You almost never need to touch the app code to change a chain or DEX.

```
lib/chain-registry/
  types.ts              ← type definitions (rarely touch)
  index.ts              ← registry lookup + DEFAULT_CHAIN_ID (touch when adding/removing chains)
  chains/
    avalanche.ts        ← ALL Avalanche addresses (touch to edit Avalanche)
    polygon.ts          ← (you would create this for Polygon)
    base.ts             ← (you would create this for Base)
```

---

## Scenario 1: Switch to a Different Chain (Replace Avalanche)

This replaces Avalanche as the default chain. Users will connect to the new chain instead.

### Step 1 — Create the chain config file

Create `lib/chain-registry/chains/<your-chain>.ts`. Use `avalanche.ts` as your template:

```typescript
import { polygon } from 'viem/chains'          // ← import the viem chain object
import type { Address } from 'viem'
import type { ChainConfig } from '../types'

export const POLYGON_RPC = 'https://polygon-rpc.com'

export const polygonConfig: ChainConfig = {
  chain: polygon,                              // ← viem chain object (gives chain ID, name, etc.)

  nativeWrapped: '0x0d500B1d8...' as Address, // WMATIC address
  hubTokens: [
    '0x0d500B1d8...' as Address,              // WMATIC — deepest liquidity hub
    '0x2791Bca1f...' as Address,              // USDC.e — secondary hub
  ],

  explorerUrl: 'https://polygonscan.com',
  explorerTxPath: '/tx/',
  explorerAddressPath: '/address/',

  dexRouters: [
    {
      id: 'quickswap',
      name: 'QuickSwap',
      type: 'uniswapV2',                      // ← use 'uniswapV2' for standard AMMs
      routerAddress: '0xa5E0829...' as Address,
    },
    {
      id: 'sushiswap',
      name: 'SushiSwap',
      type: 'uniswapV2',
      routerAddress: '0x1b02dA8...' as Address,
    },
  ],

  tokens: {
    WMATIC: {
      address: '0x0d500B1d8...' as Address,
      name: 'Wrapped Matic',
      symbol: 'WMATIC',
      decimals: 18,
    },
    USDC: {
      address: '0x2791Bca1f...' as Address,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
    // ... add all tokens you want available in the UI
  },

  omeswapPools: '0x0000000000000000000000000000000000000000' as Address,
  omeswapRouter: '0x0000000000000000000000000000000000000000' as Address,
}
```

### Step 2 — Register the chain and set it as default

Open `lib/chain-registry/index.ts` and make two changes:

```typescript
// 1. Import your new config
import { polygonConfig } from './chains/polygon'

// 2. Add it to the registry
const REGISTRY: Record<number, ChainConfig> = {
  [polygonConfig.chain.id]: polygonConfig,    // ← ONLY this chain now
  // Remove or comment out avalancheConfig if you want pure replacement
}

// 3. Change the default
export const DEFAULT_CHAIN_ID: number = polygonConfig.chain.id
```

### That's it. Here's what updates automatically:

| What changes automatically | Why |
|---|---|
| Wallet provider supports the new chain | `WalletProvider` calls `getSupportedChains().map(c => c.chain)` |
| Swap hooks use the new DEX routers and tokens | `useDexAggregator` and `useDexSwap` call `getChainConfig(connectedChainId)` |
| Explorer links point to the right explorer | `getExplorerLink(chainId, 'tx', hash)` reads from config |
| Agent builder nodes show correct DEXes and tokens | They call `getChainConfig(getDefaultChainId())` at load |
| Transaction history links correct | `store/transaction-store.ts` uses `getExplorerLink(getDefaultChainId(), ...)` |

### Nothing else to change (unless stated below)

You do NOT need to edit:
- Any hook file
- Any component file
- `contracts/config.ts` (it reads from the registry via `getDefaultChainId()`)
- Any agent builder node

---

## Scenario 2: Add a New Chain Alongside Avalanche (Multi-Chain)

Keep Avalanche and add another chain. Users can switch networks in the wallet.

### Step 1 — Create the chain config file

Same as Scenario 1, Step 1 — create `lib/chain-registry/chains/<your-chain>.ts`.

### Step 2 — Register without removing Avalanche

In `lib/chain-registry/index.ts`:

```typescript
import { avalancheConfig } from './chains/avalanche'
import { polygonConfig } from './chains/polygon'   // ← new

const REGISTRY: Record<number, ChainConfig> = {
  [avalancheConfig.chain.id]: avalancheConfig,
  [polygonConfig.chain.id]: polygonConfig,         // ← add here
}

// Keep the default as Avalanche unless you want Polygon to be default
export const DEFAULT_CHAIN_ID: number = avalancheConfig.chain.id
```

### What this enables

- The wallet dropdown will show both chains and let the user switch.
- When the user is on Polygon, `useDexAggregator` and `useDexSwap` will automatically use Polygon's DEX routers and tokens.
- When the user is on Avalanche, everything stays the same as before.

---

## Scenario 3: Add a New DEX to an Existing Chain

You want to add, say, a third DEX (e.g., a new AMM) to Avalanche.

### Only one file to edit: `lib/chain-registry/chains/avalanche.ts`

Open it and add an entry to the `dexRouters` array:

```typescript
dexRouters: [
  {
    id: 'traderjoe_v2',
    name: 'Trader Joe',
    type: 'traderJoeV2',
    routerAddress: '0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30' as Address,
    quoterAddress: '0xd76019A16606FDa4651f636D9751f500Ed776250' as Address,
  },
  {
    id: 'traderjoe',
    name: 'Trader Joe V1',
    type: 'uniswapV2',
    routerAddress: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4' as Address,
  },
  {
    id: 'pangolin',
    name: 'Pangolin',
    type: 'uniswapV2',
    routerAddress: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106' as Address,
  },
  // ↓ NEW DEX — just add an entry here
  {
    id: 'new_dex',
    name: 'New DEX',
    type: 'uniswapV2',                        // ← use 'uniswapV2' for standard AMM
    routerAddress: '0xYourNewDexRouter...' as Address,
  },
],
```

### What updates automatically

- `useDexAggregator` picks up the new router — it queries `v1DexConfig = chainConfig.dexRouters.filter(r => r.type === 'uniswapV2')`. Your new DEX will be included in quotes.
- `SwapCardDex` DEX selector dropdown shows the new DEX (it reads `getDexRouters(getDefaultChainId())`).
- Agent builder `SwapNode` and `DEXPriceNode` config dropdowns include the new DEX.

### For a non-standard DEX (not UniswapV2 style)

If the DEX uses a different quote/swap interface (not `getAmountsOut` + `swapExactTokensForTokens`):
1. Add it with `type: 'custom'` in the registry.
2. In `hooks/use-dex-aggregator.tsx`, add a branch for `r.type === 'custom'` that calls the DEX-specific quote method.
3. The router address is still in the registry — you are only adding custom quote logic in the hook.

---

## Scenario 4: Remove a DEX

### Only one file to edit: `lib/chain-registry/chains/avalanche.ts`

Delete or comment out the DEX entry from the `dexRouters` array. It immediately disappears from all swap UIs, agent nodes, and quote logic.

Example — removing Pangolin:
```typescript
dexRouters: [
  {
    id: 'traderjoe_v2',
    // ...
  },
  {
    id: 'traderjoe',
    // ...
  },
  // ← Pangolin entry removed
],
```

Also remove the fallback address in `contracts/config.ts` if you want to keep it clean (the `_pangolin?.routerAddress ?? '0xE54Ca...'` line). This is optional — the fallback address is never used if the DEX is not in the registry.

---

## Scenario 5: Change a Token Address or Add New Tokens

### Only one file to edit: `lib/chain-registry/chains/avalanche.ts`

#### Edit an existing token

Find the token in the `tokens` object and update the address:

```typescript
tokens: {
  USDC: {
    address: '0xNewAddress...' as Address,   // ← change this
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
  },
  // ...
}
```

#### Add a new token

Add a new entry to the `tokens` object:

```typescript
tokens: {
  // ... existing tokens ...
  MYTOKEN: {
    address: '0xNewTokenAddress...' as Address,
    name: 'My Token',
    symbol: 'MYTOKEN',
    decimals: 18,
    coingeckoId: 'my-token',               // optional
  },
},
```

The token immediately appears in:
- `useDexAggregator` token routing (if it has liquidity on a registered DEX)
- Agent builder `SwapNode`, `DEXPriceNode`, `WalletBalanceNode`, and `LimitOrderNode` config dropdowns
- `contracts/config.ts` token list (re-exported via the shim)

#### Change the routing hub token (intermediate swap hop)

The `hubTokens` array is used by `useDexAggregator` to find multi-hop paths when there's no direct pool. The first entry should be the deepest-liquidity token (usually the wrapped native). Change it here:

```typescript
hubTokens: [
  '0xNewWrappedNativeAddress...' as Address,  // deepest liquidity
  '0xNewStablecoinAddress...' as Address,     // secondary hub
],
```

---

## Scenario 6: Deploy OmeSwap Contracts and Update Addresses

Once the OmeSwap pools/router contracts are deployed on a chain, update these fields in the chain's config file:

```typescript
// In lib/chain-registry/chains/avalanche.ts (or whichever chain)
omeswapPools: '0xYourDeployedPoolsAddress...' as Address,
omeswapRouter: '0xYourDeployedRouterAddress...' as Address,
```

These values flow through to `contracts/config.ts` → `CONTRACT_ADDRESSES.POOLS` and `CONTRACT_ADDRESSES.ROUTER`, which are used by `useDexSwap` and `useLiquidity`.

---

## Quick Reference Table

| What you want to do | File(s) to edit |
|---|---|
| Switch to a different chain entirely | Create `lib/chain-registry/chains/<chain>.ts`, update `lib/chain-registry/index.ts` |
| Add a second chain | Create `lib/chain-registry/chains/<chain>.ts`, add to registry in `lib/chain-registry/index.ts` |
| Add a new DEX (UniswapV2-compatible) | `lib/chain-registry/chains/<chain>.ts` — add entry to `dexRouters` |
| Add a new DEX (custom interface) | `lib/chain-registry/chains/<chain>.ts` + add quote logic branch in `hooks/use-dex-aggregator.tsx` |
| Remove a DEX | `lib/chain-registry/chains/<chain>.ts` — remove entry from `dexRouters` |
| Add/edit a token | `lib/chain-registry/chains/<chain>.ts` — add/edit entry in `tokens` |
| Change the routing hub (multi-hop) | `lib/chain-registry/chains/<chain>.ts` — edit `hubTokens` array |
| Change block explorer URL | `lib/chain-registry/chains/<chain>.ts` — edit `explorerUrl` / `explorerTxPath` / `explorerAddressPath` |
| Update OmeSwap contract address | `lib/chain-registry/chains/<chain>.ts` — edit `omeswapPools` or `omeswapRouter` |
| Change default chain | `lib/chain-registry/index.ts` — change `DEFAULT_CHAIN_ID` |

---

## Files You Should NEVER Need to Edit for Chain/DEX Changes

These files read from the registry and should not need changes when switching chains or DEXes:

- `hooks/use-dex-aggregator.tsx`
- `hooks/use-dex-swap.tsx`
- `hooks/use-liquidity.tsx`
- `hooks/use-dex-pools.tsx`
- `hooks/use-pool-details.tsx`
- `hooks/use-token-balances.tsx`
- `hooks/use-token-mint.tsx`
- `components/trade/SwapCardDex.tsx`
- `components/trade/AddLiquidityCard.tsx`
- `components/providers/wallet-provider.tsx`
- `store/transaction-store.ts`
- `contracts/config.ts`
- Any agent builder node file

If you find yourself editing those files just to change a chain or DEX, something is wrong — the data should come from the registry instead.

---

## Checklist for Adding a New Chain

- [ ] Create `lib/chain-registry/chains/<chain>.ts` with a full `ChainConfig` export
- [ ] Import it in `lib/chain-registry/index.ts` and add it to `REGISTRY`
- [ ] (Optional) Update `DEFAULT_CHAIN_ID` in `lib/chain-registry/index.ts` if this is the new primary chain
- [ ] Verify the app runs: `npm run dev`
- [ ] Connect wallet — the new chain should appear in the RainbowKit chain selector
- [ ] Test a swap — quotes should come from the DEXes you configured
- [ ] Test explorer links — clicking "View on Explorer" should go to the correct block explorer
