/**
 * @deprecated Chain has migrated from Avalanche to 0G.
 * Import from '@/lib/agent-builder/zerog/provider' instead.
 * This file is kept for backward compatibility only.
 */
export { getPublicProvider, connectWallet as connectMetaMask } from '../evm-provider'
export {
  ZEROG_RPC as AVALANCHE_RPC,
  ZEROG_CHAIN_PARAMS as AVALANCHE_CHAIN_PARAMS,
} from '@/lib/chain-registry/chains/zerog'

/** @deprecated Use getDefaultChainId() from '@/lib/chain-registry' (now returns 16600 for 0G) */
export const AVALANCHE_CHAIN_ID = 16600
