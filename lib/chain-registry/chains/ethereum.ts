import { mainnet } from 'viem/chains'
import type { ChainConfig } from '../types'

export const ethereumConfig: ChainConfig = {
  chain: mainnet,
  nativeWrapped: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  hubTokens: [
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  ],
  explorerUrl: 'https://etherscan.io',
  explorerTxPath: '/tx/',
  explorerAddressPath: '/address/',
  dexRouters: [
    {
      id: 'uniswap_v3',
      name: 'Uniswap v3',
      type: 'custom',
      routerAddress: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45', // SwapRouter02
      quoterAddress: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e', // QuoterV2
    },
  ],
  tokens: {
    WETH: {
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      name: 'Wrapped Ether',
      symbol: 'WETH',
      decimals: 18,
    },
    USDC: {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
    },
    USDT: {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      name: 'Tether USD',
      symbol: 'USDT',
      decimals: 6,
    },
    UNI: {
      address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      name: 'Uniswap',
      symbol: 'UNI',
      decimals: 18,
    },
    LINK: {
      address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      name: 'Chainlink',
      symbol: 'LINK',
      decimals: 18,
    },
    AAVE: {
      address: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      name: 'Aave',
      symbol: 'AAVE',
      decimals: 18,
    },
    PEPE: {
      address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      name: 'Pepe',
      symbol: 'PEPE',
      decimals: 18,
    },
  },
}
