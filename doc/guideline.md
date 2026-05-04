# Chain, 0G, And Integration Guideline

Last updated: 2026-05-04

This guide explains where to make chain, DEX, and 0G integration changes in the current Omeswap codebase.

## Rule Of Thumb

For chain, token, router, explorer, or 0G endpoint changes, start in:

```text
lib/chain-registry/
```

For 0G protocol behavior, start in:

```text
lib/zerog/
```

Avoid hardcoding chain-specific addresses in pages, components, hooks, or node implementations.

## Current Chains

| Chain | File | Status |
|---|---|---|
| 0G Newton Testnet | `lib/chain-registry/chains/zerog.ts` | Default app chain, chain ID `16600`. |
| Ethereum mainnet | `lib/chain-registry/chains/ethereum.ts` | Registered for swap/token routing. |
| Avalanche C-Chain | `lib/chain-registry/chains/avalanche.ts` | Compatibility config, not registered by default. |

The registry is wired in `lib/chain-registry/index.ts`.

## 0G Components

| Component | Purpose | Local wrapper |
|---|---|---|
| 0G Chain | EVM execution for agent wallet, marketplace payments, and DEX adapters. | `chains/zerog.ts`, `lib/agent-builder/zerog/provider.ts` |
| 0G Storage | Content-addressed storage for encrypted strategies and agent memory. | `lib/zerog/storage.ts` |
| 0G Compute | AI inference, including sealed summaries for private strategies. | `lib/zerog/compute.ts` |
| 0G DA | Data availability for high-volume agent outputs/messages. | `lib/zerog/da.ts` |

## Change The 0G RPC

Edit `lib/chain-registry/chains/zerog.ts`:

```ts
export const ZEROG_RPC = 'https://evmrpc-testnet.0g.ai'
export const ZEROG_WSS = 'wss://evmws-testnet.0g.ai'
```

The wallet provider reads registered chains from `getSupportedChains()`, and backend execution defaults can be overridden with `RPC_URL` in `.env`.

## Change 0G Protocol Endpoints

Edit:

```ts
export const ZEROG_STORAGE_RPC = 'https://indexer-storage-testnet-standard.0g.ai'
export const ZEROG_DA_RPC = 'https://da-client-testnet.0g.ai'
export const ZEROG_COMPUTE_ENDPOINT = 'https://compute-api.0g.ai/v1'
```

The Python ATS also has matching settings in `ats/config.py`.

## Update DEX Routers

Edit `zeroGConfig.dexRouters` in `chains/zerog.ts`.

```ts
dexRouters: [
  {
    id: 'zerog_dex',
    name: '0G DEX',
    type: 'uniswapV2',
    routerAddress: '0x...',
  },
]
```

Also update ATS execution env when the Python execution agent should use the same router:

```bash
DEX_ROUTER_ADDRESS=0x...
DEX_ROUTER_V1_ADDRESS=0x...
```

## Update OmeSwap Contract Addresses

Edit:

```ts
omeswapPools: '0x...' as Address,
omeswapRouter: '0x...' as Address,
```

`contracts/config.ts` re-exports registry values for backward compatibility.

## Add A Token

Add a token entry to `zeroGConfig.tokens`:

```ts
MYTOKEN: {
  address: '0x...' as Address,
  name: 'My Token',
  symbol: 'MYTOKEN',
  decimals: 18,
  coingeckoId: 'my-token',
}
```

If the token should be used as a routing hub, add its address to `hubTokens`.

## Add A New Chain

1. Create `lib/chain-registry/chains/<name>.ts`.
2. Export a `ChainConfig`.
3. Import it in `lib/chain-registry/index.ts`.
4. Add it to `REGISTRY`.
5. Change `DEFAULT_CHAIN_ID` only if the app default should move.

The wallet provider, explorer helpers, swap hooks, and agent nodes should then pick it up through registry helpers.

## Marketplace Purchase Chain

Paid strategy purchases are verified in:

```text
app/api/marketplace/strategies/[id]/purchase/route.ts
```

That route currently verifies the receipt on 0G Chain using:

- `zeroGChain`
- `ZEROG_RPC`
- `ZEROG_CHAIN_ID`
- `NEXT_PUBLIC_TREASURY_WALLET`

Before production monetization, tighten verification to check expected token transfer and amount, not only successful recipient.

## Private Strategy Storage

Publishing a marketplace strategy uses:

```text
lib/zerog/private-strategy.ts
```

Required:

```bash
STRATEGY_ENCRYPTION_KEY=64_hex_chars
```

Flow:

1. Compile graph payload.
2. Encrypt with AES-256-GCM.
3. Upload ciphertext to 0G Storage.
4. Store only `{ encrypted: true, rootHash }` and `zerog_root_hash` in Supabase.
5. Generate a public summary through sealed 0G Compute.

## Files Usually Touched For Chain Work

| Task | File |
|---|---|
| Chain RPC / explorer / tokens / routers | `lib/chain-registry/chains/<chain>.ts` |
| Registry membership / default chain | `lib/chain-registry/index.ts` |
| 0G Storage behavior | `lib/zerog/storage.ts` |
| 0G Compute behavior | `lib/zerog/compute.ts` |
| 0G DA behavior | `lib/zerog/da.ts` |
| Python execution router defaults | `ats/config.py` |
| Marketplace purchase verification | `app/api/marketplace/strategies/[id]/purchase/route.ts` |
| Contract compatibility exports | `contracts/config.ts` |

## Files Usually Not Touched

- UI pages and components should import registry values or hooks rather than hardcoding chain config.
- `components/providers/wallet-provider.tsx` should keep reading `getSupportedChains()`.
- `contracts/abis/*` should only change when contract ABIs change.
- Generated `graphify-out/*` files should be regenerated, not manually patched.

## Checklist

- Registry updated.
- Wallet provider still receives at least one supported chain.
- Backend `.env` values match any router/RPC changes needed by Agent 6.
- Marketplace purchase verification still targets the intended chain and treasury.
- No new hardcoded router/token addresses were added outside the registry.
- Build and relevant tests were run.
