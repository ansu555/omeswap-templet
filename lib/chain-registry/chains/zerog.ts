/**
 * 0G Chain configuration — single source of truth for all 0G-specific
 * addresses, tokens, and DEX routers in the app.
 *
 * 0G is an EVM-compatible Layer-1 built for AI and decentralized agent
 * infrastructure. It ships four core primitives:
 *   - 0G Chain      — EVM-compatible execution layer (chainId 16661)
 *   - 0G Storage    — decentralized KV + Log storage for persistent agent memory
 *   - 0G DA         — infinitely scalable data availability layer
 *   - 0G Compute    — decentralized AI inference & training network
 *
 * Targeting 0G Mainnet (chainId 16661).
 */

import { defineChain } from 'viem'
import type { Address } from 'viem'
import type { ChainConfig } from '../types'

// ── Chain definition ─────────────────────────────────────────────────────────

export const ZEROG_CHAIN_ID = 16661 // 0G Mainnet

export const ZEROG_RPC = 'https://evmrpc.0g.ai'
export const ZEROG_WSS = 'wss://evmws.0g.ai'

export const zeroGChain = defineChain({
  id: ZEROG_CHAIN_ID,
  name: '0G Mainnet',
  nativeCurrency: {
    name: '0G',
    symbol: '0G',
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
      url: 'https://chainscan.0g.ai',
    },
  },
  testnet: false,
})

/** EIP-3085 `wallet_addEthereumChain` params for MetaMask */
export const ZEROG_CHAIN_PARAMS = {
  chainId: `0x${ZEROG_CHAIN_ID.toString(16)}` as const,
  chainName: '0G Mainnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: [ZEROG_RPC],
  blockExplorerUrls: ['https://chainscan.0g.ai/'],
} as const

// ── 0G Protocol endpoints ─────────────────────────────────────────────────────

/** 0G Storage indexer — KV store for real-time agent state */
export const ZEROG_STORAGE_RPC = 'https://indexer-storage-mainnet-standard.0g.ai'

/** 0G DA RPC — data availability layer for high-throughput blobs */
export const ZEROG_DA_RPC = 'https://da-client-mainnet.0g.ai'

/** 0G Compute gateway — AI inference via qwen3-8b, GLM-5-FP8, etc. */
export const ZEROG_COMPUTE_ENDPOINT = 'https://compute-api.0g.ai/v1'

// ── Jaine DEX addresses ───────────────────────────────────────────────────────
// Sourced from environment variables — never hardcoded. When unset, the swap
// UI renders a disabled button with "Jaine router not configured" and the
// agent execution layer returns `pending_deployment` instead of attempting a
// transaction against the zero address.
//
// Set in .env.local (or your deployment env):
//   NEXT_PUBLIC_JAINE_ROUTER_ADDRESS=0x...
//   NEXT_PUBLIC_JAINE_FACTORY_ADDRESS=0x...   # optional, only for dynamic pool discovery
//
// These are NEXT_PUBLIC_* so the wallet-side hook can read them in the
// browser; the agent execution path on the server reads the same vars.

const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000'

function readEnvAddress(value: string | undefined): Address {
  if (!value) return ZERO_ADDRESS
  const trimmed = value.trim()
  if (!/^0x[0-9a-fA-F]{40}$/.test(trimmed)) return ZERO_ADDRESS
  return trimmed as Address
}

/** Jaine UniswapV2-style router on 0G Mainnet — set NEXT_PUBLIC_JAINE_ROUTER_ADDRESS to enable */
export const JAINE_ROUTER_ADDRESS: Address = readEnvAddress(
  process.env.NEXT_PUBLIC_JAINE_ROUTER_ADDRESS,
)

/** Jaine factory — only needed for dynamic pool discovery */
export const JAINE_FACTORY_ADDRESS: Address = readEnvAddress(
  process.env.NEXT_PUBLIC_JAINE_FACTORY_ADDRESS,
)

/** True only when both addresses look syntactically valid AND non-zero */
export const JAINE_ROUTER_CONFIGURED: boolean = JAINE_ROUTER_ADDRESS !== ZERO_ADDRESS

// ── Full ChainConfig ──────────────────────────────────────────────────────────

export const zeroGConfig: ChainConfig = {
  chain: zeroGChain,

  // W0G — wrapped native 0G token; used as intermediate hop in multi-hop swaps
  nativeWrapped: '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c' as Address,

  // Routing hubs: W0G first (deepest liquidity), USDC.e second (stablecoin hub)
  hubTokens: [
    '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c' as Address, // W0G
    '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e' as Address, // USDC.e
  ],

  explorerUrl: 'https://chainscan.0g.ai',
  explorerTxPath: '/tx/',
  explorerAddressPath: '/address/',

  // DEX routers — Jaine (UniswapV2-compatible) on 0G Mainnet
  dexRouters: [
    {
      id: 'jaine',
      name: 'Jaine',
      type: 'uniswapV2',
      routerAddress: JAINE_ROUTER_ADDRESS,
      factoryAddress: JAINE_FACTORY_ADDRESS,
    },
  ],

  // Token list
  tokens: {
    W0G: {
      address: '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c' as Address,
      name: 'Wrapped 0G',
      symbol: 'W0G',
      decimals: 18,
    },
    'USDC.e': {
      address: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e' as Address,
      name: 'Bridged USDC',
      symbol: 'USDC.e',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
  },

  // TODO: Deploy OmeSwap contracts on 0G Mainnet and update these addresses
  omeswapPools: '0x0000000000000000000000000000000000000000' as Address,
  omeswapRouter: '0x0000000000000000000000000000000000000000' as Address,
}
