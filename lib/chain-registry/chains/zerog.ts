/**
 * 0G Chain configuration — single source of truth for all 0G-specific
 * addresses, tokens, and DEX routers in the app.
 *
 * 0G is an EVM-compatible Layer-1 built for AI and decentralized agent
 * infrastructure. It ships four core primitives:
 *   - 0G Chain      — EVM-compatible execution layer (chainId 16600)
 *   - 0G Storage    — decentralized KV + Log storage for persistent agent memory
 *   - 0G DA         — infinitely scalable data availability layer
 *   - 0G Compute    — decentralized AI inference & training network
 *
 * Newton Testnet is currently the canonical deployment target.
 * Update RPC_URL and token addresses once 0G Mainnet launches.
 */

import { defineChain } from 'viem'
import type { Address } from 'viem'
import type { ChainConfig } from '../types'

// ── Chain definition ─────────────────────────────────────────────────────────

export const ZEROG_CHAIN_ID = 16600 // 0G Newton Testnet

export const ZEROG_RPC = 'https://evmrpc-testnet.0g.ai'
export const ZEROG_WSS = 'wss://evmws-testnet.0g.ai'

export const zeroGChain = defineChain({
  id: ZEROG_CHAIN_ID,
  name: '0G Newton Testnet',
  nativeCurrency: {
    name: 'Autonomy',
    symbol: 'A0GI',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [ZEROG_RPC],
      webSocket: [ZEROG_WSS],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Chain Scan',
      url: 'https://chainscan-newton.0g.ai',
    },
  },
  testnet: true,
})

/** EIP-3085 `wallet_addEthereumChain` params for MetaMask */
export const ZEROG_CHAIN_PARAMS = {
  chainId: `0x${ZEROG_CHAIN_ID.toString(16)}` as const,
  chainName: '0G Newton Testnet',
  nativeCurrency: { name: 'Autonomy', symbol: 'A0GI', decimals: 18 },
  rpcUrls: [ZEROG_RPC],
  blockExplorerUrls: ['https://chainscan-newton.0g.ai/'],
} as const

// ── 0G Protocol endpoints ────────────────────────────────────────────────────

/** 0G Storage indexer — KV store for real-time agent state */
export const ZEROG_STORAGE_RPC = 'https://indexer-storage-testnet-standard.0g.ai'

/** 0G DA RPC — data availability layer for high-throughput blobs */
export const ZEROG_DA_RPC = 'https://da-client-testnet.0g.ai'

/** 0G Compute gateway — AI inference via qwen3-8b, GLM-5-FP8, etc. */
export const ZEROG_COMPUTE_ENDPOINT = 'https://compute-api.0g.ai/v1'

// ── Full ChainConfig ─────────────────────────────────────────────────────────

export const zeroGConfig: ChainConfig = {
  chain: zeroGChain,

  // W0G — wrapped native token used as intermediate hop in multi-hop swaps
  // TODO: Replace with official W0G deployment address once 0G DEX launches on mainnet
  nativeWrapped: '0x0000000000000000000000000000000000000001' as Address,

  // Routing hubs: W0G first (deepest liquidity), USDC second (stablecoin hub)
  // TODO: Update with live 0G DEX pool addresses
  hubTokens: [
    '0x0000000000000000000000000000000000000001' as Address, // W0G
    '0x0000000000000000000000000000000000000002' as Address, // USDC on 0G
  ],

  explorerUrl: 'https://chainscan-newton.0g.ai',
  explorerTxPath: '/tx/',
  explorerAddressPath: '/address/',

  // DEX routers — 0G native DEX (UniswapV2-compatible)
  // TODO: Replace placeholder addresses with official 0G DEX deployments
  dexRouters: [
    {
      id: 'zerog_dex',
      name: '0G DEX',
      type: 'uniswapV2',
      routerAddress: '0x0000000000000000000000000000000000000010' as Address,
    },
    {
      id: 'zerog_dex_v2',
      name: '0G DEX V2',
      type: 'uniswapV2',
      routerAddress: '0x0000000000000000000000000000000000000011' as Address,
    },
  ],

  // Token list — update with live 0G token addresses
  tokens: {
    W0G: {
      address: '0x0000000000000000000000000000000000000001' as Address,
      name: 'Wrapped 0G',
      symbol: 'W0G',
      decimals: 18,
    },
    USDC: {
      address: '0x0000000000000000000000000000000000000002' as Address,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    USDT: {
      address: '0x0000000000000000000000000000000000000003' as Address,
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
      coingeckoId: 'tether',
    },
    WETH: {
      address: '0x0000000000000000000000000000000000000004' as Address,
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
    WBTC: {
      address: '0x0000000000000000000000000000000000000005' as Address,
      name: 'Wrapped Bitcoin',
      symbol: 'WBTC',
      decimals: 8,
      coingeckoId: 'bitcoin',
    },
  },

  // TODO: Deploy OmeSwap contracts on 0G Chain and update these addresses
  omeswapPools: '0x0000000000000000000000000000000000000000' as Address,
  omeswapRouter: '0x0000000000000000000000000000000000000000' as Address,
}
