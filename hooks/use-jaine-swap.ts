"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
  useBalance,
} from "wagmi";
import { parseUnits, formatUnits, type Address } from "viem";
import {
  JAINE_ROUTER_ADDRESS,
  JAINE_ROUTER_CONFIGURED,
} from "@/lib/chain-registry/chains/zerog";
import { useTransactionStore } from "@/store/transaction-store";

const CHAIN_ID = 16661 as const;

const W0G_ADDRESS: Address = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";
const USDCE_ADDRESS: Address = "0x1f3aa82227281ca364bfb3d253b0f1af1da6473e";

/** 20-minute swap deadline */
const DEADLINE_SECONDS = 20 * 60;

// ── Minimal ABIs ──────────────────────────────────────────────────────────────

const ERC20_ABI = [
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

/** UniswapV2-compatible router — covers the three swap paths used by Jaine */
const UNIV2_ROUTER_ABI = [
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    name: "getAmountsOut",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactETHForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForTokens",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "amountOutMin", type: "uint256" },
      { name: "path", type: "address[]" },
      { name: "to", type: "address" },
      { name: "deadline", type: "uint256" },
    ],
    name: "swapExactTokensForETH",
    outputs: [{ name: "amounts", type: "uint256[]" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export type JaineToken = {
  symbol: string;
  address: Address | "native";
  decimals: number;
  name: string;
};

type SwapVariant = "eth-for-tokens" | "tokens-for-eth" | "tokens-for-tokens";

/** All tokens tradeable on Jaine — 0G native + W0G + USDC.e */
export const JAINE_TOKENS: JaineToken[] = [
  { symbol: "0G", address: "native", decimals: 18, name: "0G (Native)" },
  { symbol: "W0G", address: W0G_ADDRESS, decimals: 18, name: "Wrapped 0G" },
  { symbol: "USDC.e", address: USDCE_ADDRESS, decimals: 6, name: "Bridged USDC" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isNativeToken(t: JaineToken): boolean {
  return t.address === "native";
}

/** Native 0G wraps to W0G for UniswapV2 path resolution */
function pathAddress(t: JaineToken): Address {
  return isNativeToken(t) ? W0G_ADDRESS : (t.address as Address);
}

function swapVariant(tokenIn: JaineToken, tokenOut: JaineToken): SwapVariant {
  if (isNativeToken(tokenIn)) return "eth-for-tokens";
  if (isNativeToken(tokenOut)) return "tokens-for-eth";
  return "tokens-for-tokens";
}

function safeParsedUnits(amount: string, decimals: number): bigint {
  try {
    const f = parseFloat(amount);
    if (!f || f <= 0) return BigInt(0);
    return parseUnits(amount, decimals);
  } catch {
    return BigInt(0);
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * useJaineSwap — all state + blockchain interactions for swapping tokens on
 * the Jaine DEX (UniswapV2-compatible) on 0G Mainnet (chainId 16661).
 *
 * Supports three paths:
 *   • 0G (native) → ERC-20   : swapExactETHForTokens (ETH value)
 *   • ERC-20 → 0G (native)   : approve + swapExactTokensForETH
 *   • ERC-20 → ERC-20        : approve + swapExactTokensForTokens
 */
export function useJaineSwap() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: CHAIN_ID });
  const addTransaction = useTransactionStore((s) => s.addTransaction);

  // ── Token / amount state ──────────────────────────────────────────────────
  const [tokenIn, setTokenIn] = useState<JaineToken>(JAINE_TOKENS[0]); // 0G native
  const [tokenOut, setTokenOut] = useState<JaineToken>(JAINE_TOKENS[2]); // USDC.e
  const [amountIn, setAmountIn] = useState<string>("");
  const [slippageBps, setSlippageBps] = useState<number>(50); // 0.50%
  const [quote, setQuote] = useState<string>("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);

  const variant = useMemo(() => swapVariant(tokenIn, tokenOut), [tokenIn, tokenOut]);
  const path = useMemo<Address[]>(
    () => [pathAddress(tokenIn), pathAddress(tokenOut)],
    [tokenIn, tokenOut],
  );

  const routerAddress = JAINE_ROUTER_ADDRESS;
  const routerConfigured = JAINE_ROUTER_CONFIGURED;

  // ── ERC-20 allowance ──────────────────────────────────────────────────────
  const tokenInAddr = isNativeToken(tokenIn) ? undefined : (tokenIn.address as Address);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenInAddr,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && tokenInAddr ? [address, routerAddress] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address && !isNativeToken(tokenIn) && routerConfigured },
  });

  // ── Native 0G balance ─────────────────────────────────────────────────────
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address,
    chainId: CHAIN_ID,
    query: { enabled: !!address && isNativeToken(tokenIn) },
  });

  // ── ERC-20 balance ────────────────────────────────────────────────────────
  const { data: erc20Balance, refetch: refetchErc20Balance } = useReadContract({
    address: tokenInAddr,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: CHAIN_ID,
    query: { enabled: !!address && !isNativeToken(tokenIn) },
  });

  // ── Write contract hooks ──────────────────────────────────────────────────
  const { writeContract: writeApprove, data: approveHash, isPending: isApproveSending } =
    useWriteContract();
  const { writeContract: writeSwap, data: swapHash, isPending: isSwapSending } =
    useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } =
    useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isSwapConfirming, isSuccess: isSwapSuccess } =
    useWaitForTransactionReceipt({ hash: swapHash });

  // ── Quote via getAmountsOut (debounced 400ms) ─────────────────────────────
  useEffect(() => {
    const parsed = parseFloat(amountIn);
    if (!parsed || parsed <= 0 || !routerConfigured || !publicClient) {
      setQuote("");
      setQuoteError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const amountInWei = parseUnits(amountIn, tokenIn.decimals);
        const amounts = (await publicClient.readContract({
          address: routerAddress,
          abi: UNIV2_ROUTER_ABI,
          functionName: "getAmountsOut",
          args: [amountInWei, path],
        })) as bigint[];
        setQuote(formatUnits(amounts[amounts.length - 1], tokenOut.decimals));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "";
        // Suppress rate-limit noise; surface actionable errors only
        if (!msg.includes("429")) {
          setQuoteError("No route or insufficient liquidity");
        }
        setQuote("");
      } finally {
        setQuoteLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
    // path/decimals derived from tokenIn/tokenOut — use symbols as dep proxies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountIn, tokenIn.symbol, tokenOut.symbol, routerConfigured]);

  // ── Approval detection ────────────────────────────────────────────────────
  const parsedAmountIn = useMemo(
    () => safeParsedUnits(amountIn, tokenIn.decimals),
    [amountIn, tokenIn.decimals],
  );

  const needsApproval =
    !isNativeToken(tokenIn) &&
    routerConfigured &&
    parsedAmountIn > BigInt(0) &&
    (allowance === undefined || (allowance as bigint) < parsedAmountIn);

  // Re-check allowance after approve tx confirms
  useEffect(() => {
    if (isApproveSuccess) refetchAllowance();
  }, [isApproveSuccess, refetchAllowance]);

  // Record swap in tx store and refresh balance on success
  useEffect(() => {
    if (!isSwapSuccess || !swapHash || !address) return;
    addTransaction({
      type: "SWAP",
      fromToken: tokenIn.symbol,
      toToken: tokenOut.symbol,
      fromAmount: parseFloat(amountIn) || 0,
      toAmount: parseFloat(quote) || 0,
      txHash: swapHash,
      walletAddress: address,
      timestamp: Date.now(),
      source: "dex-swap",
      dex: "Jaine",
    });
    setSwapError(null);
    if (isNativeToken(tokenIn)) refetchNativeBalance();
    else refetchErc20Balance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwapSuccess, swapHash]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const approve = useCallback(() => {
    if (!address || isNativeToken(tokenIn) || !amountIn || !routerConfigured) return;
    setSwapError(null);
    try {
      writeApprove({
        address: tokenIn.address as Address,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [routerAddress, safeParsedUnits(amountIn, tokenIn.decimals)],
        chainId: CHAIN_ID,
      });
    } catch (e: unknown) {
      setSwapError(e instanceof Error ? e.message : "Approval failed");
    }
  }, [address, tokenIn, amountIn, routerAddress, routerConfigured, writeApprove]);

  const executeSwap = useCallback(() => {
    if (!address || !amountIn || !quote || !routerConfigured) return;
    setSwapError(null);

    const deadline = BigInt(Math.floor(Date.now() / 1000) + DEADLINE_SECONDS);
    const amountInWei = parseUnits(amountIn, tokenIn.decimals);
    const quoteWei = parseUnits(quote, tokenOut.decimals);
    const minOut = (quoteWei * BigInt(10000 - slippageBps)) / BigInt(10000);

    try {
      if (variant === "eth-for-tokens") {
        writeSwap({
          address: routerAddress,
          abi: UNIV2_ROUTER_ABI,
          functionName: "swapExactETHForTokens",
          args: [minOut, path, address, deadline],
          value: amountInWei,
          chainId: CHAIN_ID,
        });
      } else if (variant === "tokens-for-eth") {
        writeSwap({
          address: routerAddress,
          abi: UNIV2_ROUTER_ABI,
          functionName: "swapExactTokensForETH",
          args: [amountInWei, minOut, path, address, deadline],
          chainId: CHAIN_ID,
        });
      } else {
        writeSwap({
          address: routerAddress,
          abi: UNIV2_ROUTER_ABI,
          functionName: "swapExactTokensForTokens",
          args: [amountInWei, minOut, path, address, deadline],
          chainId: CHAIN_ID,
        });
      }
    } catch (e: unknown) {
      setSwapError(e instanceof Error ? e.message : "Swap failed");
    }
  }, [
    address, amountIn, quote, routerConfigured, variant,
    path, tokenIn, tokenOut, slippageBps, routerAddress, writeSwap,
  ]);

  /** Flip token direction and reset amounts */
  const swapTokens = useCallback(() => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn("");
    setQuote("");
  }, [tokenIn, tokenOut]);

  // ── Derived balance for tokenIn ───────────────────────────────────────────
  const balance = isNativeToken(tokenIn)
    ? (nativeBalance?.formatted ?? "0")
    : erc20Balance !== undefined
      ? formatUnits(erc20Balance as bigint, tokenIn.decimals)
      : "0";

  return {
    // token selection
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    swapTokens,
    tokens: JAINE_TOKENS,
    // amounts
    amountIn,
    setAmountIn,
    quote,
    quoteLoading,
    quoteError,
    // slippage
    slippageBps,
    setSlippageBps,
    // wallet
    balance,
    needsApproval,
    routerConfigured,
    // actions
    approve,
    executeSwap,
    // status
    isApproving: isApproveSending || isApproveConfirming,
    isSwapping: isSwapSending || isSwapConfirming,
    isLoading: isApproveSending || isApproveConfirming || isSwapSending || isSwapConfirming,
    isSuccess: isSwapSuccess,
    txHash: swapHash,
    error: swapError,
  };
}
