/**
 * contracts/config.ts — thin re-export shim.
 *
 * All values are now sourced from the chain registry so that this file stays
 * as the single backward-compatible import point for the rest of the codebase.
 * To change addresses, update lib/chain-registry/chains/zerog.ts.
 *
 * Default chain: 0G Mainnet (chainId 16661)
 */

import { getChainConfig, getDefaultChainId } from '@/lib/chain-registry'
import type { Address } from 'viem'

const _cfg = getChainConfig(getDefaultChainId())
const _rt = _cfg.tokens

// ── OmeSwap contracts ─────────────────────────────────────────────────────────

export const CONTRACT_ADDRESSES = {
  POOLS: (_cfg.omeswapPools ?? '0x0000000000000000000000000000000000000000') as Address,
  ROUTER: (_cfg.omeswapRouter ?? '0x0000000000000000000000000000000000000000') as Address,
}

// ── DEX routers ───────────────────────────────────────────────────────────────

const _jaine = _cfg.dexRouters.find(r => r.id === 'jaine')

export const DEX_ROUTERS = {
  JAINE: (_jaine?.routerAddress ?? '0x0000000000000000000000000000000000000000') as Address,
} as const

/** Wrapped native 0G token address */
export const W0G_ADDRESS = _cfg.nativeWrapped

// ── Token addresses ───────────────────────────────────────────────────────────

export const TOKEN_ADDRESSES: { [key: string]: { address: Address; name: string; symbol: string; decimals: number } } = {
  W0G:    _rt['W0G']    ?? { address: '0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c' as Address, name: 'Wrapped 0G',   symbol: 'W0G',    decimals: 18 },
  'USDC.e': _rt['USDC.e'] ?? { address: '0x1f3aa82227281ca364bfb3d253b0f1af1da6473e' as Address, name: 'Bridged USDC', symbol: 'USDC.e', decimals: 6  },
}

export const TOKENS = TOKEN_ADDRESSES
export const MAINNET_TOKENS = TOKEN_ADDRESSES
export const TOKEN_LIST = Object.values(TOKEN_ADDRESSES)
