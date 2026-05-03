import type { DexDisplayToken, DexMarketKind, DexToken } from "./types";

export type DexMarketConfig = {
  id: string;
  symbol: string;
  pairLabel: string;
  name: string;
  kind: DexMarketKind;
  network: string;
  networkName: string;
  chainId: number | null;
  dex: string;
  poolAddress: string;
  displayToken: DexDisplayToken;
  baseToken: DexToken;
  quoteToken: DexToken;
  chartSymbol?: string;
  leverage: number | null;
  color: string;
  executionVenue: string;
  externalUrl?: string;
  fallback: {
    priceUsd: number;
    change24h: number;
    volume24hUsd: number;
    liquidityUsd: number;
    transactions24h: number;
  };
};

export const DEFAULT_DEX_MARKET_ID = "0g-w0g-usdce";

export const DEX_MARKETS: DexMarketConfig[] = [
  {
    id: "0g-w0g-usdce",
    symbol: "W0G",
    pairLabel: "W0G/USDC.e",
    name: "Wrapped 0G",
    kind: "spot",
    network: "0g",
    networkName: "0G",
    chainId: 16661,
    dex: "Jaine",
    poolAddress: "0x961da9b2fd03e04b088a90843a93e66f13112d0a",
    displayToken: "quote",
    baseToken: {
      symbol: "USDC.e",
      name: "Bridged USDC",
      address: "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e",
    },
    quoteToken: {
      symbol: "W0G",
      name: "Wrapped 0G",
      address: "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c",
    },
    leverage: null,
    color: "bg-violet-500",
    executionVenue: "Jaine DEX adapter",
    fallback: {
      priceUsd: 0.531342,
      change24h: 0.153,
      volume24hUsd: 9334,
      liquidityUsd: 508553,
      transactions24h: 60,
    },
  },
  {
    id: "gmx-btc-usd",
    symbol: "BTC",
    pairLabel: "BTC/USD",
    name: "Bitcoin Perp",
    kind: "perp",
    network: "arbitrum",
    networkName: "Arbitrum",
    chainId: 42161,
    dex: "EVM Perps",
    poolAddress: "gmx:btc-usd",
    displayToken: "base",
    baseToken: {
      symbol: "BTC",
      name: "Bitcoin",
      address: "gmx:btc",
    },
    quoteToken: {
      symbol: "USD",
      name: "US Dollar",
      address: "gmx:usd",
    },
    chartSymbol: "BTCUSDT",
    leverage: 50,
    color: "bg-orange-500",
    executionVenue: "Coming soon",
    externalUrl: "https://app.gmx.io/#/trade?market=BTC",
    fallback: {
      priceUsd: 78465.81,
      change24h: 0.23,
      volume24hUsd: 28125000,
      liquidityUsd: 18400000,
      transactions24h: 4210,
    },
  },
  {
    id: "gmx-eth-usd",
    symbol: "ETH",
    pairLabel: "ETH/USD",
    name: "Ethereum Perp",
    kind: "perp",
    network: "arbitrum",
    networkName: "Arbitrum",
    chainId: 42161,
    dex: "EVM Perps",
    poolAddress: "gmx:eth-usd",
    displayToken: "base",
    baseToken: {
      symbol: "ETH",
      name: "Ethereum",
      address: "gmx:eth",
    },
    quoteToken: {
      symbol: "USD",
      name: "US Dollar",
      address: "gmx:usd",
    },
    chartSymbol: "ETHUSDT",
    leverage: 50,
    color: "bg-blue-500",
    executionVenue: "Coming soon",
    externalUrl: "https://app.gmx.io/#/trade?market=ETH",
    fallback: {
      priceUsd: 2312.64,
      change24h: 0.37,
      volume24hUsd: 19860000,
      liquidityUsd: 12600000,
      transactions24h: 3820,
    },
  },
  {
    id: "gmx-avax-usd",
    symbol: "AVAX",
    pairLabel: "AVAX/USD",
    name: "Avalanche Perp",
    kind: "perp",
    network: "arbitrum",
    networkName: "Arbitrum",
    chainId: 42161,
    dex: "EVM Perps",
    poolAddress: "gmx:avax-usd",
    displayToken: "base",
    baseToken: {
      symbol: "AVAX",
      name: "Avalanche",
      address: "gmx:avax",
    },
    quoteToken: {
      symbol: "USD",
      name: "US Dollar",
      address: "gmx:usd",
    },
    chartSymbol: "AVAXUSDT",
    leverage: 30,
    color: "bg-red-500",
    executionVenue: "Coming soon",
    externalUrl: "https://app.gmx.io/#/trade?market=AVAX",
    fallback: {
      priceUsd: 9.07,
      change24h: -0.6,
      volume24hUsd: 2640000,
      liquidityUsd: 3850000,
      transactions24h: 1260,
    },
  },
];

export function getDexMarketConfig(id: string | null | undefined) {
  return DEX_MARKETS.find((market) => market.id === id) ?? DEX_MARKETS[0];
}
