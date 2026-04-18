/**
 * Avalanche C-Chain configuration — the single source of truth for all
 * Avalanche-specific addresses, tokens, and DEX routers in the app.
 *
 * Previously these constants were scattered across:
 *   - contracts/config.ts
 *   - lib/agent-builder/avalanche/provider.ts
 *   - avax-agent/lib/avalanche/provider.ts
 *   - lib/agent-builder/nodes/action/SwapNode.ts
 *   - lib/agent-builder/nodes/data/DEXPriceNode.ts
 *   - lib/agent-builder/nodes/data/WalletBalanceNode.ts
 */

import { avalanche } from 'viem/chains'
import type { Address } from 'viem'
import type { ChainConfig } from '../types'

// ── RPC / chain params (used by ethers.js providers) ─────────────────────────

export const AVALANCHE_RPC = 'https://api.avax.network/ext/bc/C/rpc'

/** EIP-3085 `wallet_addEthereumChain` params for MetaMask */
export const AVALANCHE_CHAIN_PARAMS = {
  chainId: `0x${avalanche.id.toString(16)}` as const,
  chainName: 'Avalanche C-Chain',
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  rpcUrls: [AVALANCHE_RPC],
  blockExplorerUrls: ['https://snowtrace.io/'],
} as const

// ── Full ChainConfig ──────────────────────────────────────────────────────────

export const avalancheConfig: ChainConfig = {
  chain: avalanche,

  // WAVAX — the wrapped native token used as an intermediate hop
  nativeWrapped: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as Address,

  // Intermediate hop addresses for V1 multi-hop routing.
  // WAVAX first (deepest liquidity), USDC.e second (best stablecoin hub).
  hubTokens: [
    '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as Address, // WAVAX
    '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' as Address, // USDC.e
  ],

  explorerUrl: 'https://snowtrace.io',
  explorerTxPath: '/tx/',
  explorerAddressPath: '/address/',

  // DEX routers — ordered by default preference (V2 first)
  dexRouters: [
    {
      id: 'traderjoe_v2',
      name: 'Trader Joe',
      type: 'traderJoeV2',
      routerAddress: '0xb4315e873dBcf96Ffd0acd8EA43f689D8c20fB30' as Address, // LBRouter V2.2
      quoterAddress: '0xd76019A16606FDa4651f636D9751f500Ed776250' as Address, // LBQuoter V2.2
    },
    {
      id: 'traderjoe',
      name: 'Trader Joe V1',
      type: 'uniswapV2',
      routerAddress: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4' as Address, // JoeRouter02
    },
    {
      id: 'pangolin',
      name: 'Pangolin',
      type: 'uniswapV2',
      routerAddress: '0xE54Ca86531e17Ef3616d22Ca28b0D458b6C89106' as Address,
    },
  ],

  // Token list — keys are canonical symbols used throughout the app.
  // Note on bridged tokens: USDC.e / USDT.e / DAI.e etc. are Avalanche Bridge
  // (legacy) tokens; native USDC is listed separately.
  tokens: {
    WAVAX: {
      address: '0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7' as Address,
      name: 'Wrapped AVAX',
      symbol: 'WAVAX',
      decimals: 18,
      coingeckoId: 'wrapped-avax',
    },
    USDC: {
      address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6C' as Address,
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      coingeckoId: 'usd-coin',
    },
    // USDC.e (Avalanche Bridge) — deepest V1 AMM pools; used as routing hub
    'USDC.e': {
      address: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' as Address,
      name: 'USD Coin.e',
      symbol: 'USDC.e',
      decimals: 6,
    },
    'USDT.e': {
      address: '0xc7198437980c041c805A1EDcbA50c1Ce5db95118' as Address,
      name: 'Tether USD.e',
      symbol: 'USDT.e',
      decimals: 6,
    },
    'DAI.e': {
      address: '0xd586E7F844cEa2F87f50152665BCbc2C279D8d70' as Address,
      name: 'Dai Stablecoin.e',
      symbol: 'DAI.e',
      decimals: 18,
      coingeckoId: 'dai',
    },
    'WETH.e': {
      address: '0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB' as Address,
      name: 'Wrapped Ether.e',
      symbol: 'WETH.e',
      decimals: 18,
      coingeckoId: 'ethereum',
    },
    'WBTC.e': {
      address: '0x50b7545627a5162F82A992c33b87aDc75187B218' as Address,
      name: 'Wrapped Bitcoin.e',
      symbol: 'WBTC.e',
      decimals: 8,
      coingeckoId: 'bitcoin',
    },
    'LINK.e': {
      address: '0x5947BB275c521040051D82396192181b413227A3' as Address,
      name: 'Chainlink.e',
      symbol: 'LINK.e',
      decimals: 18,
      coingeckoId: 'chainlink',
    },
    JOE: {
      address: '0x6e84a6216eA6daCC71eE8E6b0a5B7322EEbC0fDd' as Address,
      name: 'JoeToken',
      symbol: 'JOE',
      decimals: 18,
      coingeckoId: 'joe',
    },
    PNG: {
      address: '0x60781C2586D68229fde47564546784ab3fACA982' as Address,
      name: 'Pangolin',
      symbol: 'PNG',
      decimals: 18,
      coingeckoId: 'pangolin',
    },
    'AAVE.e': {
      address: '0x63a72806098Bd3D9520cC43356dD78afe5D386D9' as Address,
      name: 'Aave Token.e',
      symbol: 'AAVE.e',
      decimals: 18,
      coingeckoId: 'aave',
    },
  },

  // TODO: Deploy OmeSwap contracts to Avalanche mainnet and update these addresses
  omeswapPools: '0x0000000000000000000000000000000000000000' as Address,
  omeswapRouter: '0x0000000000000000000000000000000000000000' as Address,
}
