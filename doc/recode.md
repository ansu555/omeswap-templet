# Recode Log — Modular Chain and DEX Abstraction

This document records every file that was **added**, **modified**, or had its **role changed** as part of the modular chain/DEX abstraction refactor. It exists so that, if something breaks, you know exactly what changed and can revert file-by-file.

---

## Summary of the Change

**Before:** Avalanche chain ID (43114), DEX router addresses, token addresses, and explorer URLs were hardcoded in 6–10 different files. Adding or switching a chain required editing 30+ places.

**After:** All chain/DEX/token data lives in a single chain registry (`lib/chain-registry/`). Every other file reads from the registry. Adding a new chain now requires creating one file and registering it in one place.

---

## New Files Added

### `lib/chain-registry/types.ts`
**Purpose:** Shared TypeScript interfaces for the chain registry.

**Exports:**
- `TokenInfo` — address, name, symbol, decimals, logoUrl?, coingeckoId?
- `DexRouter` — id, name, type (`uniswapV2` | `traderJoeV2` | `custom`), routerAddress, quoterAddress?
- `ChainConfig` — full chain configuration object (chain, nativeWrapped, hubTokens, explorerUrl, explorerTxPath, explorerAddressPath, dexRouters, tokens, omeswapPools?, omeswapRouter?)

**Before this file existed:** These types were implicit/scattered — no single definition for what a "chain config" or "DEX router" meant.

---

### `lib/chain-registry/chains/avalanche.ts`
**Purpose:** The single source of truth for all Avalanche C-Chain addresses and config.

**Exports:**
- `AVALANCHE_RPC` — `'https://api.avax.network/ext/bc/C/rpc'`
- `AVALANCHE_CHAIN_PARAMS` — EIP-3085 MetaMask `wallet_addEthereumChain` params
- `avalancheConfig` — full `ChainConfig` object containing:
  - `chain`: viem `avalanche` object (chain ID 43114)
  - `nativeWrapped`: `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` (WAVAX)
  - `hubTokens`: WAVAX + USDC.e (intermediate hop addresses for V1 routing)
  - `explorerUrl`: `https://snowtrace.io`
  - `explorerTxPath`: `/tx/`
  - `explorerAddressPath`: `/address/`
  - `dexRouters`: Trader Joe V2 (LBRouter V2.2), Trader Joe V1 (JoeRouter02), Pangolin
  - `tokens`: WAVAX, USDC, USDC.e, USDT.e, DAI.e, WETH.e, WBTC.e, LINK.e, JOE, PNG, AAVE.e
  - `omeswapPools` / `omeswapRouter`: zero address (TODO: update when deployed)

**Addresses consolidated from the old scattered locations:**

| Address | Old location(s) |
|---|---|
| WAVAX `0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7` | `contracts/config.ts`, `hooks/use-dex-aggregator.tsx`, `lib/agent-builder/nodes/action/SwapNode.ts` |
| TJ V1 router `0x60aE616a...310933d4` | `contracts/config.ts`, `lib/agent-builder/nodes/action/SwapNode.ts` |
| TJ V2 router `0xb4315e87...c20fB30` | `contracts/config.ts`, `hooks/use-dex-aggregator.tsx` |
| TJ V2 quoter `0xd76019A1...776250` | `contracts/config.ts`, `hooks/use-dex-aggregator.tsx` |
| Pangolin router `0xE54Ca865...89106` | `contracts/config.ts`, `lib/agent-builder/nodes/action/SwapNode.ts` |
| Token list (USDC, USDTe, DAIe, …) | `contracts/config.ts`, `lib/agent-builder/nodes/data/WalletBalanceNode.ts`, `lib/agent-builder/nodes/action/LimitOrderNode.ts` |
| Snowtrace URL | `store/transaction-store.ts`, multiple component files |

---

### `lib/chain-registry/index.ts`
**Purpose:** Registry lookup and helper functions. The single import point for all chain-related utilities.

**Exports:**
- `DEFAULT_CHAIN_ID` — `43114` (Avalanche mainnet)
- `getChainConfig(chainId)` — returns `ChainConfig`, throws if not registered
- `getSupportedChains()` — returns all registered configs as array
- `getDefaultChainId()` — returns `DEFAULT_CHAIN_ID`
- `getTokens(chainId)` — shortcut for `getChainConfig(chainId).tokens`
- `getDexRouters(chainId)` — shortcut for `getChainConfig(chainId).dexRouters`
- `getExplorerLink(chainId, type, hash)` — builds `https://snowtrace.io/tx/0x...` style URLs

**Before:** No equivalent existed. Explorer URLs were hardcoded as template literals in each file.

---

### `lib/agent-builder/evm-provider.ts`
**Purpose:** Generic EVM wallet connection via ethers.js + MetaMask for any registered chain.

**Exports:**
- `getPublicProvider(chainId?)` — read-only `JsonRpcProvider` for any chain
- `connectWallet(chainId?)` — prompts MetaMask, switches chain (adds chain via EIP-3085 if needed), returns `{ provider, signer, address }`

**Before:** This was `lib/agent-builder/avalanche/provider.ts` — it hardcoded `0xa86a` (Avalanche chain ID), `https://api.avax.network/ext/bc/C/rpc`, and the Avalanche `wallet_addEthereumChain` params. Now it derives all of that from the registry.

---

### `components/providers/wallet-provider.tsx`
**Purpose:** New, generic `WalletProvider` (wagmi + RainbowKit) that supports any registered chain.

**Key changes:**
- `chains:` is now `getSupportedChains().map(c => c.chain)` instead of `chains: [avalanche]`.
- `getDefaultConfig()` and `new QueryClient()` are created inside `useState` lazy initializers (not at module level), so they never execute during SSR — preventing WalletConnect from trying to access `localStorage` on the server.

**Before:** The equivalent was `components/providers/avalanche-wallet-provider.tsx`, which hardcoded `chains: [avalanche]`. Module-level `getDefaultConfig()` caused WalletConnect to crash during SSR on Node.js v25.

---

### `components/features/wallet/wallet-connect.tsx`
**Purpose:** New, generic `WalletConnect` dropdown component. Identical UI to the old Avalanche version but uses `getExplorerLink(chain.id, 'address', account.address)` from the registry instead of a hardcoded Snowtrace URL.

**Before:** The old equivalent was `components/features/avalanche/AvalancheWalletConnect` which used `https://snowtrace.io/address/${account.address}`.

---

### `components/features/wallet/index.ts`
**Purpose:** Barrel export for the new wallet feature directory.

**Exports:**
- `WalletConnect` (default export from `wallet-connect.tsx`)
- `AvalancheWalletConnect` (alias, for backward compatibility)

---

### `hooks/use-wallet.tsx`
**Purpose:** Generic `useWallet` hook using wagmi's `useAccount`, `useBalance`, `useDisconnect`, `useSwitchChain`. No chain-specific code.

**Before:** `hooks/use-avalanche-wallet.tsx` was already generic wagmi code but named after Avalanche. This file is the clean rename.

---

## Modified Files (changed in place)

### `contracts/config.ts`
**Change:** Rewritten from a file with hardcoded constants to a **thin re-export shim** that reads from the registry.

**What it does now:** Calls `getChainConfig(getDefaultChainId())` and re-exports the same symbol names (`CONTRACT_ADDRESSES`, `DEX_ROUTERS`, `TRADER_JOE_V2`, `WAVAX_ADDRESS`, `TOKEN_ADDRESSES`, `TOKENS`, `MAINNET_TOKENS`, `TOKEN_LIST`) so all existing `import { TOKENS } from '@/contracts/config'` statements continue to work without changes.

**Before (hardcoded constants, now replaced):**
```typescript
// OLD — everything was hardcoded here
export const WAVAX_ADDRESS = '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7'
export const DEX_ROUTERS = {
  TRADER_JOE: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
  PANGOLIN: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106',
}
// ... and all token addresses inline
```

**After (registry-driven):**
```typescript
// NEW — reads from registry, re-exports for backward compat
import { getChainConfig, getDefaultChainId } from '@/lib/chain-registry'
const _cfg = getChainConfig(getDefaultChainId())
export const WAVAX_ADDRESS = _cfg.nativeWrapped
export const DEX_ROUTERS = { TRADER_JOE: _tjV1?.routerAddress, PANGOLIN: _pangolin?.routerAddress }
```

---

### `components/providers/avalanche-wallet-provider.tsx`
**Change:** Reduced to a 4-line backward-compat re-export file.

**Before:** Full wagmi + RainbowKit provider implementation with `chains: [avalanche]` hardcoded.

**After:**
```typescript
export { WalletProvider, WalletProvider as AvalancheWalletProvider } from './wallet-provider'
```

All imports like `import { AvalancheWalletProvider } from '@/components/providers'` continue to work.

---

### `hooks/use-avalanche-wallet.tsx`
**Change:** Reduced to a 4-line backward-compat re-export file.

**Before:** Full wagmi hook implementation with the name `useAvalancheWallet`.

**After:**
```typescript
export { useWallet, useWallet as useAvalancheWallet } from './use-wallet'
```

All imports of `useAvalancheWallet` continue to work.

---

### `components/features/avalanche/avalanche-wallet-connect.tsx`
**Change:** Reduced to a 4-line backward-compat re-export file.

**Before:** Full `AvalancheWalletConnect` component (~200 lines) with hardcoded `https://snowtrace.io/address/` link.

**After:**
```typescript
export { default, default as AvalancheWalletConnect } from '@/components/features/wallet/wallet-connect'
```

---

### `components/features/avalanche/index.ts`
**Change:** Updated to re-export from the new `components/features/wallet` directory.

**Before:** Exported `AvalancheWalletConnect` from the local avalanche component.

**After:** Re-exports `WalletConnect` and `AvalancheWalletConnect` from `@/components/features/wallet`.

---

### `components/layout/header.tsx`
**Change:** Updated import from `@/components/features/avalanche` to `@/components/features/wallet`.

**Before:** `import { AvalancheWalletConnect } from '@/components/features/avalanche'`

**After:** `import { WalletConnect } from '@/components/features/wallet'`

---

### `hooks/index.ts`
**Change:** Added `useWallet` export from `./use-wallet` alongside the existing `useAvalancheWallet` re-export.

---

### `components/providers/index.ts`
**Change:** No code change. Still re-exports `WalletProvider` and `AvalancheWalletProvider` from `./avalanche-wallet-provider` (which itself now re-exports from `./wallet-provider`). The re-export chain ensures all existing imports continue to work.

---

### `store/transaction-store.ts`
**Change:** Replaced hardcoded `https://snowtrace.io/tx/${txHash}` with `getExplorerLink(getDefaultChainId(), 'tx', tx.txHash)` from `@/lib/chain-registry`.

**Before:**
```typescript
explorerUrl: `https://snowtrace.io/tx/${tx.txHash}`
```

**After:**
```typescript
import { getExplorerLink, getDefaultChainId } from '@/lib/chain-registry'
// ...
explorerUrl: getExplorerLink(getDefaultChainId(), 'tx', tx.txHash)
```

---

### `constants/index.ts`
**Change:** Removed `CHAIN_IDS` object (which contained `AVALANCHE_MAINNET: 43114` and `AVALANCHE_FUJI: 43113`). Added a comment pointing to the registry.

**Before:**
```typescript
export const CHAIN_IDS = { AVALANCHE_MAINNET: 43114, AVALANCHE_FUJI: 43113 }
```

**After:**
```typescript
// Chain IDs live in the registry — see lib/chain-registry/index.ts (DEFAULT_CHAIN_ID)
```

---

### `hooks/use-dex-aggregator.tsx`
**Change:** Added `getChainConfig`, `getDefaultChainId` imports from `@/lib/chain-registry`. Added dynamic chain config resolution using `useChainId()` — falls back to default if the connected chain is not registered. `getExplorerLink` is now used for success links.

**What still comes from `@/contracts/config`:** `MAINNET_TOKENS` (for the token list displayed in the UI — still a backward-compat shim, no behaviour change).

---

### `hooks/use-dex-swap.tsx`
**Change:** Same pattern as `use-dex-aggregator` — uses `getChainConfig(connectedChainId)` with fallback. Derives `poolsAddress` from `chainConfig.omeswapPools`. Imports `getExplorerLink` for success links.

**What still comes from `@/contracts/config`:** `TOKENS` (token list for UI display — backward-compat shim).

---

### `components/trade/SwapCardDex.tsx`
**Change:** Replaced hardcoded `DEX_LABELS` map with one built dynamically from `getDexRouters(getDefaultChainId())`. Replaced hardcoded Snowtrace explorer URL with `getExplorerLink(chain?.id ?? getDefaultChainId(), 'tx', hash)`.

---

### `components/trade/AddLiquidityCard.tsx`
**Change:** Added `getExplorerLink`, `getDefaultChainId` imports. Replaced hardcoded `https://snowtrace.io/tx/` with `getExplorerLink(chain?.id ?? getDefaultChainId(), 'tx', hash)`.

---

### `components/trade/MintTokensCard.tsx`
**Change:** Same — explorer link replaced with `getExplorerLink(...)`.

---

### `components/trade/PoolLiquidity.tsx`
**Change:** Explorer links updated to use `getExplorerLink(...)`.

---

### `components/trade/SelectedPoolInfo.tsx`
**Change:** Explorer links updated to use `getExplorerLink(...)`.

---

### `app/(app)/pool/[id]/page.tsx`
**Change:** Three hardcoded `https://snowtrace.io/tx/` and `/address/` links replaced with `getExplorerLink(chainId, 'tx'/'address', hash)` calls.

---

### `lib/agent-builder/avalanche/provider.ts`
**Change:** Reduced to a re-export shim. Real logic now lives in `lib/agent-builder/evm-provider.ts`.

**Before:** Full MetaMask + Avalanche connection logic (90+ lines) with hardcoded chain ID, RPC URL, and chain params.

**After:**
```typescript
export { getPublicProvider, connectWallet as connectMetaMask } from '../evm-provider'
export { AVALANCHE_RPC, AVALANCHE_CHAIN_PARAMS } from '@/lib/chain-registry/chains/avalanche'
export const AVALANCHE_CHAIN_ID = 43114  // @deprecated
```

---

### `avax-agent/lib/avalanche/provider.ts`
**Change:** Reduced to a re-export shim pointing to the main `lib/agent-builder/evm-provider.ts`. No logic duplication.

**Before:** Exact duplicate of `lib/agent-builder/avalanche/provider.ts` (~90 lines).

**After:**
```typescript
export { getPublicProvider, connectWallet as connectMetaMask } from '../../../lib/agent-builder/evm-provider'
export { AVALANCHE_RPC, AVALANCHE_CHAIN_PARAMS } from '../../../lib/chain-registry/chains/avalanche'
export const AVALANCHE_CHAIN_ID = 43114  // @deprecated
```

---

### `lib/agent-builder/nodes/action/SwapNode.ts`
**Change:** Removed inline `DEX_ROUTERS`, `TOKEN_ADDRESSES`, `WAVAX_ADDRESS` constants. Now calls `getChainConfig(getDefaultChainId())` at module load to derive DEX names, router addresses, and token list dynamically.

---

### `lib/agent-builder/nodes/data/DEXPriceNode.ts`
**Change:** Same as `SwapNode.ts` — inline constants removed, registry lookup added.

---

### `lib/agent-builder/nodes/data/WalletBalanceNode.ts`
**Change:** Token list and native symbol now derived from `getChainConfig(getDefaultChainId())`.

---

### `lib/agent-builder/nodes/action/LimitOrderNode.ts`
**Change:** Token list derived from `getChainConfig(getDefaultChainId()).tokens`.

---

### `avax-agent/lib/nodes/action/SwapNode.ts`
**Change:** Same as `lib/agent-builder/nodes/action/SwapNode.ts` — inline constants removed, registry imported from `../../../../lib/chain-registry`.

---

### `avax-agent/lib/nodes/data/DEXPriceNode.ts`
**Change:** Same pattern — registry import added.

---

### `avax-agent/lib/nodes/data/WalletBalanceNode.ts`
**Change:** Same pattern — registry import added.

---

### `avax-agent/lib/nodes/action/LimitOrderNode.ts`
**Change:** Same pattern — registry import added.

---

## SSR / Node.js v25 localStorage Fix

### Problem
Node.js v25 ships a built-in `localStorage` global, but it only works when the `--localstorage-file=<path>` flag is set at process start. Without the flag, `localStorage` exists as an object but none of its methods (`getItem`, `setItem`, …) are functions. `@walletconnect/keyvaluestorage` captures `globalThis.localStorage` inside a module-level IIFE when the webpack bundle is first evaluated, so the broken reference was stored before any application code could patch it. This caused every SSR render to throw `TypeError: localStorage.getItem is not a function` and return HTTP 500.

### Files changed

#### `instrumentation.ts` *(new file)*
**Purpose:** Server startup hook (Next.js 15 built-in). Unconditionally replaces `globalThis.localStorage` with a no-op shim that has working `getItem`/`setItem` methods.

**Why unconditional:** An earlier version guarded with `if (typeof global.localStorage === "undefined")`. On Node.js v25 the object exists (it's just broken), so the guard evaluated to `false` and the shim was never applied.

#### `next.config.ts` *(modified)*
**Change:** Added a webpack `BannerPlugin` (server bundles only) that injects the same localStorage shim as the very first line of every SSR bundle. This guarantees the shim runs before the `@walletconnect/keyvaluestorage` IIFE — even during lazy route compilation, when the module chunk is evaluated for the first time on a request.

Removed the `experimental.instrumentationHook` flag (it is a no-op in Next.js 15.5 — instrumentation is enabled by default).

Also removed the standalone `import webpack from "webpack"` that caused a `Cannot find module 'webpack'` error; the webpack instance is now destructured from the second argument of the webpack config callback: `webpack: (cfg, { isServer, webpack }) => { … }`.

**New shim injected at bundle head:**
```javascript
if (typeof globalThis !== 'undefined' &&
    (typeof globalThis.localStorage === 'undefined' ||
     typeof globalThis.localStorage.getItem !== 'function')) {
  globalThis.localStorage = {
    getItem: function() { return null; },
    setItem: function() {},
    removeItem: function() {},
    clear: function() {},
    key: function() { return null; },
    length: 0,
  };
}
```

---

## Nothing Was Deleted

All renamed/replaced files were kept as backward-compat re-export stubs. No files were hard-deleted. This means:
- All existing `import` statements throughout the codebase continue to work without changes.
- Any code that imports `useAvalancheWallet`, `AvalancheWalletProvider`, `AvalancheWalletConnect`, or `connectMetaMask` still works.

---

## How to Roll Back to the Previous Version

### Roll back a single file
Every file that was changed is tracked above. The "Before" code blocks show what to restore.

### Roll back with git
All changes are unstaged. Use `git diff` to see exactly what changed in each file. To revert a specific file:
```bash
git checkout -- <file-path>
```

To revert everything:
```bash
git checkout -- .
```

To see only the new files that were added (not tracked before):
```bash
git status --short | grep "^??"
```

New files to delete if rolling back completely:
- `lib/chain-registry/types.ts`
- `lib/chain-registry/index.ts`
- `lib/chain-registry/chains/avalanche.ts`
- `lib/agent-builder/evm-provider.ts`
- `components/providers/wallet-provider.tsx`
- `components/features/wallet/wallet-connect.tsx`
- `components/features/wallet/index.ts`
- `hooks/use-wallet.tsx`
- `instrumentation.ts`

To roll back the SSR localStorage fix without rolling back the rest:
1. Delete `instrumentation.ts`
2. Revert `next.config.ts` to remove the `BannerPlugin` block and the `webpack` import in the callback destructuring
3. Revert `components/providers/wallet-provider.tsx` to move `getDefaultConfig()` and `new QueryClient()` back to module level

### Minimal rollback: just restore contracts/config.ts
If the registry is not the problem but `contracts/config.ts` broke something, restore it to the old hardcoded version and remove the `lib/chain-registry/` imports. All consumer files (hooks, components) import from `@/contracts/config` and will pick up the restored values automatically.

### [2026-04-27 09:22:00 Z] agent=copilot user=ansu555 branch=market_place
- upgrade_paths: app/api/creator/indicators/[id]/publish/route.ts, app/api/creator/strategies/[id]/publish/route.ts, lib/onboarding/risk-score.ts, hooks/use-toast.ts
- upgrade_summary: Fixed strategy/indicator publish version bump when Supabase returns null rows; added `lib/onboarding/risk-score` for onboarding form; fixed `hooks/use-toast` import casing to match `userForm` folder. Ran `graphify update .` after changes.

### [2026-04-27 12:00:00 Z] agent=copilot user=ansu555 branch=market_place
- upgrade_paths: lib/supabase/server.ts, app/api/marketplace/indicators/route.ts, app/api/marketplace/strategies/route.ts, app/api/activations/route.ts, app/api/marketplace/bookmarks/route.ts
- upgrade_summary: Added `tryCreateSupabaseAdminClient` so marketplace list and library GET routes return empty collections when Supabase URL/service key are unset (fixes 500 on `/api/marketplace/indicators?palette=1` in local dev). Mutations still require configured DB.

### [2026-04-27 14:30:00 Z] agent=copilot user=ansu555 branch=market_place
- upgrade_paths: lib/marketplace/supabase-read-fallback.ts, app/api/marketplace/indicators/route.ts, app/api/marketplace/strategies/route.ts, app/api/creator/dashboard/route.ts, app/(app)/creator/page.tsx, components/layout/header.tsx
- upgrade_summary: Return empty marketplace lists when Supabase reports missing relations (migration not applied); hardened indicator dependency counts; `/creator` redirects to `/agent-builder` and Creator nav item removed so publishing stays on Agent builder. Dashboard API degrades gracefully without DB.
