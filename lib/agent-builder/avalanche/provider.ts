/**
 * @deprecated Import from '@/lib/agent-builder/evm-provider' instead.
 * This file is kept for backward compatibility only.
 */
export { getPublicProvider, connectWallet as connectMetaMask } from '../evm-provider'
export { AVALANCHE_RPC, AVALANCHE_CHAIN_PARAMS } from '@/lib/chain-registry/chains/avalanche'

/** @deprecated Use getDefaultChainId() from '@/lib/chain-registry' */
export const AVALANCHE_CHAIN_ID = 43114
