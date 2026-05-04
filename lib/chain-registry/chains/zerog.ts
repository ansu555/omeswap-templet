/**
 * 0G Chain configuration — single source of truth for all 0G-specific
 * addresses, tokens, and DEX routers in the app.
 *
 * Supports both current 0G networks:
 * - Mainnet  (chainId 16661)
 * - Testnet  (Galileo, chainId 16602)
 *
 * Select the active network with:
 * NEXT_PUBLIC_0G_NETWORK=mainnet|testnet
 */

import { defineChain } from "viem";
import type { Address } from "viem";
import type { ChainConfig } from "../types";

type ZeroGNetwork = "mainnet" | "testnet";

type ZeroGNetworkConfig = {
  chainId: number;
  chainName: string;
  rpcUrl: string;
  wssUrl: string;
  explorerName: string;
  explorerUrl: string;
  storageIndexerUrl: string;
  daRpcUrl: string;
  isTestnet: boolean;
};

const ZERO_G_NETWORKS: Record<ZeroGNetwork, ZeroGNetworkConfig> = {
  mainnet: {
    chainId: 16661,
    chainName: "0G Mainnet",
    rpcUrl: "https://evmrpc.0g.ai",
    wssUrl: "wss://evmws.0g.ai",
    explorerName: "0G Chain Scan",
    explorerUrl: "https://chainscan.0g.ai",
    storageIndexerUrl: "https://indexer-storage-turbo.0g.ai",
    daRpcUrl: "https://da-client.0g.ai",
    isTestnet: false,
  },
  testnet: {
    chainId: 16602,
    chainName: "0G Galileo Testnet",
    rpcUrl: "https://evmrpc-testnet.0g.ai",
    wssUrl: "wss://evmws-testnet.0g.ai",
    explorerName: "0G Galileo Chain Scan",
    explorerUrl: "https://chainscan-galileo.0g.ai",
    storageIndexerUrl: "https://indexer-storage-turbo-testnet.0g.ai",
    daRpcUrl: "https://da-client-testnet.0g.ai",
    isTestnet: true,
  },
};

const NETWORK_ENV = (process.env.NEXT_PUBLIC_0G_NETWORK ?? "mainnet").toLowerCase();
export const ZEROG_NETWORK: ZeroGNetwork = NETWORK_ENV === "testnet" ? "testnet" : "mainnet";
const ACTIVE = ZERO_G_NETWORKS[ZEROG_NETWORK];

// ── Chain definition ─────────────────────────────────────────────────────────

export const ZEROG_CHAIN_ID = ACTIVE.chainId;
export const ZEROG_RPC = process.env.NEXT_PUBLIC_0G_RPC ?? ACTIVE.rpcUrl;
export const ZEROG_WSS = process.env.NEXT_PUBLIC_0G_WSS ?? ACTIVE.wssUrl;

export const zeroGChain = defineChain({
  id: ZEROG_CHAIN_ID,
  name: ACTIVE.chainName,
  nativeCurrency: {
    name: "0G",
    symbol: "0G",
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
      name: ACTIVE.explorerName,
      url: ACTIVE.explorerUrl,
    },
  },
  testnet: ACTIVE.isTestnet,
});

/** EIP-3085 `wallet_addEthereumChain` params for MetaMask */
export const ZEROG_CHAIN_PARAMS = {
  chainId: `0x${ZEROG_CHAIN_ID.toString(16)}` as const,
  chainName: ACTIVE.chainName,
  nativeCurrency: { name: "0G", symbol: "0G", decimals: 18 },
  rpcUrls: [ZEROG_RPC],
  blockExplorerUrls: [`${ACTIVE.explorerUrl}/`],
} as const;

// ── 0G Protocol endpoints ────────────────────────────────────────────────────

/** 0G Storage indexer — KV store for real-time agent state */
export const ZEROG_STORAGE_RPC =
  process.env.NEXT_PUBLIC_0G_STORAGE_RPC ?? ACTIVE.storageIndexerUrl;

/** 0G DA RPC — data availability layer for high-throughput blobs */
export const ZEROG_DA_RPC = process.env.NEXT_PUBLIC_0G_DA_RPC ?? ACTIVE.daRpcUrl;

/** 0G Compute gateway — AI inference via qwen3-8b, GLM-5-FP8, etc. */
export const ZEROG_COMPUTE_ENDPOINT =
  process.env.NEXT_PUBLIC_0G_COMPUTE_ENDPOINT ?? "https://compute-api.0g.ai/v1";

// ── Full ChainConfig ─────────────────────────────────────────────────────────

export const zeroGConfig: ChainConfig = {
  chain: zeroGChain,

  // TODO: Replace with official wrapped token address for the selected network.
  nativeWrapped: "0x0000000000000000000000000000000000000001" as Address,

  // Routing hubs: W0G first (deepest liquidity), USDC second (stablecoin hub).
  // TODO: Replace with verified token addresses from official 0G/Jaine docs.
  hubTokens: [
    "0x0000000000000000000000000000000000000001" as Address, // W0G
    "0x0000000000000000000000000000000000000002" as Address, // USDC
  ],

  explorerUrl: ACTIVE.explorerUrl,
  explorerTxPath: "/tx/",
  explorerAddressPath: "/address/",

  // TODO: Replace placeholder router addresses with verified Jaine contracts.
  dexRouters: [
    {
      id: "zerog_dex",
      name: "Jaine Hub",
      type: "uniswapV2",
      routerAddress: "0x0000000000000000000000000000000000000010" as Address,
    },
    {
      id: "zerog_dex_v2",
      name: "Jaine Hub V2",
      type: "uniswapV2",
      routerAddress: "0x0000000000000000000000000000000000000011" as Address,
    },
  ],

  // TODO: Replace token placeholders with verified 0G token addresses.
  tokens: {
    W0G: {
      address: "0x0000000000000000000000000000000000000001" as Address,
      name: "Wrapped 0G",
      symbol: "W0G",
      decimals: 18,
    },
    USDC: {
      address: "0x0000000000000000000000000000000000000002" as Address,
      name: "USD Coin",
      symbol: "USDC",
      decimals: 6,
      coingeckoId: "usd-coin",
    },
    USDT: {
      address: "0x0000000000000000000000000000000000000003" as Address,
      name: "Tether USD",
      symbol: "USDT",
      decimals: 6,
      coingeckoId: "tether",
    },
    WETH: {
      address: "0x0000000000000000000000000000000000000004" as Address,
      name: "Wrapped Ether",
      symbol: "WETH",
      decimals: 18,
      coingeckoId: "ethereum",
    },
    WBTC: {
      address: "0x0000000000000000000000000000000000000005" as Address,
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
      decimals: 8,
      coingeckoId: "bitcoin",
    },
  },

  // TODO: Deploy OmeSwap contracts on 0G and update these addresses.
  omeswapPools: "0x0000000000000000000000000000000000000000" as Address,
  omeswapRouter: "0x0000000000000000000000000000000000000000" as Address,
};
