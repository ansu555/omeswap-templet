// Application constants

export const APP_NAME = 'Omeswap';

// Chain IDs live in the registry — see lib/chain-registry/index.ts (DEFAULT_CHAIN_ID)
// and lib/chain-registry/chains/ for per-chain configuration.

export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  TRADE: '/trade',
  PORTFOLIO: '/portfolio',
  TOKENS: '/cryptocurrencies',
  TRANSACTIONS: '/transactions',
} as const;

export const EXTERNAL_LINKS = {
  DOCS: 'https://docs.avax.network',
  GITHUB: 'https://github.com/ava-labs',
} as const;
