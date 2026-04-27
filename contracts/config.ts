/**
 * contracts/config.ts — thin re-export shim.
 *
 * All values are now sourced from the chain registry so that this file stays
 * as the single backward-compatible import point for the rest of the codebase.
 * To change addresses, update lib/chain-registry/chains/<chain>.ts.
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

const _tjV1 = _cfg.dexRouters.find(r => r.id === 'traderjoe')
const _pangolin = _cfg.dexRouters.find(r => r.id === 'pangolin')
const _tjV2 = _cfg.dexRouters.find(r => r.id === 'traderjoe_v2')

export const DEX_ROUTERS = {
  TRADER_JOE: (_tjV1?.routerAddress ?? '0x60aE616a2155Ee3d9A68541Ba4544862310933d4') as Address,
  PANGOLIN: (_pangolin?.routerAddress ?? '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106') as Address,
} as const

export const TRADER_JOE_V2 = {
  ROUTER: (_tjV2?.routerAddress ?? '0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30') as Address,
  QUOTER: (_tjV2?.quoterAddress ?? '0xd76019A16606FDa4651f636D9751f500Ed776250') as Address,
} as const

export const WAVAX_ADDRESS = _cfg.nativeWrapped

// ── Token addresses ───────────────────────────────────────────────────────────
// Keys match the legacy format (USDTe, WETHe, etc.) so that existing
// component code using TOKEN_ADDRESSES["WETHe"] continues to work unchanged.

export const TOKEN_ADDRESSES: { [key: string]: { address: Address; name: string; symbol: string; decimals: number } } = {
  WAVAX: _rt.WAVAX,
  USDC: _rt.USDC,
  'USDC.e': _rt['USDC.e'],
  USDTe: _rt['USDT.e'],
  DAIe: _rt['DAI.e'],
  WETHe: _rt['WETH.e'],
  WBTCe: _rt['WBTC.e'],
  LINKe: _rt['LINK.e'],
  JOE: _rt.JOE,
  PNG: _rt.PNG,
  AAVEe: _rt['AAVE.e'],
  // Legacy aliases
  tUSDC: _rt.USDC,
  tUSDT: _rt['USDT.e'],
}

export const TOKENS = TOKEN_ADDRESSES
export const MAINNET_TOKENS = TOKEN_ADDRESSES

export const TOKEN_LIST = Object.values(TOKEN_ADDRESSES)
