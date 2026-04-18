/**
 * Chain Registry — central lookup for all supported chain configs.
 *
 * To add a new chain:
 *   1. Create lib/chain-registry/chains/<chain>.ts exporting a ChainConfig
 *   2. Import it below and add it to REGISTRY
 *   Done — wallet provider, swap hooks, agent nodes, and explorer links all
 *   pick it up automatically once the downstream phases are complete.
 */

import type { ChainConfig, DexRouter, TokenInfo } from './types'
import { avalancheConfig } from './chains/avalanche'

// ── Registry ─────────────────────────────────────────────────────────────────

const REGISTRY: Record<number, ChainConfig> = {
  [avalancheConfig.chain.id]: avalancheConfig,
}

export const DEFAULT_CHAIN_ID: number = avalancheConfig.chain.id

// ── Lookup helpers ────────────────────────────────────────────────────────────

/**
 * Returns the ChainConfig for the given chainId.
 * Throws if the chain has not been registered.
 */
export function getChainConfig(chainId: number): ChainConfig {
  const config = REGISTRY[chainId]
  if (!config) {
    throw new Error(
      `Chain ${chainId} is not registered. ` +
      `Add its config to lib/chain-registry/chains/ and import it in lib/chain-registry/index.ts.`
    )
  }
  return config
}

/** Returns all registered ChainConfig objects */
export function getSupportedChains(): ChainConfig[] {
  return Object.values(REGISTRY)
}

/** Returns the default chain ID (currently Avalanche mainnet: 43114) */
export function getDefaultChainId(): number {
  return DEFAULT_CHAIN_ID
}

/** Convenience: returns the token map for a given chain */
export function getTokens(chainId: number): Record<string, TokenInfo> {
  return getChainConfig(chainId).tokens
}

/** Convenience: returns the DEX router list for a given chain */
export function getDexRouters(chainId: number): DexRouter[] {
  return getChainConfig(chainId).dexRouters
}

/**
 * Builds a block-explorer URL for the given chain.
 *
 * @example
 *   getExplorerLink(43114, 'tx', '0xabc…')
 *   // → 'https://snowtrace.io/tx/0xabc…'
 */
export function getExplorerLink(
  chainId: number,
  type: 'tx' | 'address',
  hash: string,
): string {
  const config = getChainConfig(chainId)
  const path = type === 'tx' ? config.explorerTxPath : config.explorerAddressPath
  return `${config.explorerUrl}${path}${hash}`
}

// ── Re-exports ────────────────────────────────────────────────────────────────

export type { ChainConfig, DexRouter, TokenInfo } from './types'
