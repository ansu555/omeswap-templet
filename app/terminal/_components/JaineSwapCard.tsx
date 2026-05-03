"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { ZEROG_CHAIN_ID } from "@/lib/chain-registry/chains/zerog";
import { getExplorerLink, getDefaultChainId } from "@/lib/chain-registry";
import { useJaineSwap, type JaineToken } from "@/hooks/use-jaine-swap";

const W0G_ADDRESS = "0x1cd0690ff9a693f5ef2dd976660a8dafc81a109c";

type Side = "buy" | "sell";

export interface JaineSwapCardProps {
  side: Side;
  /** Amount in tokenIn units (string, sourced from the TradePanel input) */
  amount: string;
  /** Slippage tolerance in basis points (50 = 0.50 %) */
  slippageBps: number;
  /** Spot pair: base = the asset you trade (e.g. W0G) */
  baseSymbol: string;
  baseAddress: string;
  baseDecimals: number;
  /** Quote = the pricing currency (e.g. USDC.e) */
  quoteSymbol: string;
  quoteAddress: string;
  quoteDecimals: number;
  /** Current mark price — kept for potential future USD display */
  markPrice: number;
}

/**
 * JaineSwapCard — footer action section of the TradePanel for 0G spot markets.
 *
 * Accepts buy/sell intent and token parameters from the parent TradePanel and
 * renders a single smart button that progresses through:
 *   not-connected → RainbowKit connect
 *   wrong-chain   → Switch to 0G Mainnet
 *   unconfigured  → "Jaine router not configured"
 *   needs-approve → Approve <token>
 *   ready         → Buy / Sell <token>
 *   pending       → Approving… / Swapping…
 *   success       → tx hash + explorer link
 */
export function JaineSwapCard({
  side,
  amount,
  slippageBps,
  baseSymbol,
  baseAddress,
  baseDecimals,
  quoteSymbol,
  quoteAddress,
  quoteDecimals,
  markPrice: _markPrice,
}: JaineSwapCardProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const isWrongChain = isConnected && chainId !== ZEROG_CHAIN_ID;

  const {
    setTokenIn,
    setTokenOut,
    setAmountIn,
    setSlippageBps,
    quote,
    quoteLoading,
    quoteError,
    balance,
    needsApproval,
    routerConfigured,
    approve,
    executeSwap,
    isApproving,
    isSwapping,
    isSuccess,
    txHash,
    error,
    tokenIn,
    tokenOut,
  } = useJaineSwap();

  // ── Sync props → hook state ───────────────────────────────────────────────
  useEffect(() => {
    const baseIsWrappedNative = baseAddress.toLowerCase() === W0G_ADDRESS;
    const baseToken: JaineToken = baseIsWrappedNative
      ? { symbol: "0G", address: "native", decimals: 18, name: "0G (Native)" }
      : { symbol: baseSymbol, address: baseAddress as `0x${string}`, decimals: baseDecimals, name: baseSymbol };
    const quoteToken: JaineToken = {
      symbol: quoteSymbol,
      address: quoteAddress as `0x${string}`,
      decimals: quoteDecimals,
      name: quoteSymbol,
    };
    if (side === "buy") {
      setTokenIn(quoteToken);
      setTokenOut(baseToken);
    } else {
      setTokenIn(baseToken);
      setTokenOut(quoteToken);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side, baseSymbol, baseAddress, baseDecimals, quoteSymbol, quoteAddress, quoteDecimals]);

  useEffect(() => {
    setAmountIn(amount);
  }, [amount, setAmountIn]);

  useEffect(() => {
    setSlippageBps(slippageBps);
  }, [slippageBps, setSlippageBps]);

  // ── Success state with auto-hide ─────────────────────────────────────────
  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true);
      const t = setTimeout(() => setShowSuccess(false), 12_000);
      return () => clearTimeout(t);
    }
  }, [isSuccess]);

  // ── Derived values ────────────────────────────────────────────────────────
  const insufficientFunds = useMemo(() => {
    const n = Number(amount || 0);
    const bal = Number(balance || 0);
    return n > 0 && bal > 0 && n > bal;
  }, [amount, balance]);

  const explorerUrl = txHash
    ? getExplorerLink(getDefaultChainId(), "tx", txHash)
    : null;

  const minReceived = quote && parseFloat(quote) > 0
    ? ((parseFloat(quote) * (10000 - slippageBps)) / 10000).toFixed(6)
    : null;

  const label = needsApproval
    ? `Approve ${tokenIn.symbol}`
    : side === "buy"
      ? `Buy ${baseSymbol}`
      : `Sell ${baseSymbol}`;

  // ── Button logic ──────────────────────────────────────────────────────────
  const button = useMemo(() => {
    if (!isConnected) {
      return (
        <ConnectButton.Custom>
          {({ openConnectModal, mounted }) => (
            <button
              onClick={openConnectModal}
              disabled={!mounted}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2 font-semibold hover:opacity-90 shadow-[0_0_30px_-6px_hsl(var(--primary)/0.7)] disabled:opacity-50"
            >
              <Image src="/logo.png" alt="" width={18} height={18} className="rounded-full" />
              Connect Wallet
            </button>
          )}
        </ConnectButton.Custom>
      );
    }

    if (isWrongChain) {
      return (
        <ButtonShell
          tone="primary"
          onClick={() => switchChain({ chainId: ZEROG_CHAIN_ID })}
          disabled={isSwitching}
        >
          {isSwitching ? <Loader2 size={14} className="animate-spin" /> : null}
          Switch to 0G Mainnet
        </ButtonShell>
      );
    }

    if (!routerConfigured) {
      return (
        <ButtonShell tone="warn" disabled>
          <AlertTriangle size={14} className="shrink-0" />
          Jaine router not configured
        </ButtonShell>
      );
    }

    if (Number(amount || 0) <= 0) {
      return (
        <ButtonShell tone="muted" disabled>
          Enter an amount
        </ButtonShell>
      );
    }

    if (quoteError && !quoteLoading) {
      return (
        <ButtonShell tone="warn" disabled>
          <AlertTriangle size={14} className="shrink-0" />
          {quoteError}
        </ButtonShell>
      );
    }

    if (quoteLoading || !quote) {
      return (
        <ButtonShell tone="muted" disabled>
          <Loader2 size={14} className="animate-spin" />
          Pricing route…
        </ButtonShell>
      );
    }

    if (insufficientFunds) {
      return (
        <ButtonShell tone="warn" disabled>
          Insufficient {tokenIn.symbol}
        </ButtonShell>
      );
    }

    const isLoading = isApproving || isSwapping;

    return (
      <ButtonShell
        tone={side === "buy" ? "bull" : "bear"}
        onClick={needsApproval ? approve : executeSwap}
        disabled={isLoading}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : null}
        {isApproving ? `Approving ${tokenIn.symbol}…` : isSwapping ? "Swapping…" : label}
      </ButtonShell>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isConnected, isWrongChain, isSwitching, routerConfigured, amount,
    quoteError, quoteLoading, quote, insufficientFunds, isApproving, isSwapping,
    needsApproval, side, tokenIn.symbol, label,
  ]);

  return (
    <div className="p-4 space-y-3 border-t border-border">
      {button}

      {/* Status & balance rows */}
      {isConnected && !isWrongChain && routerConfigured && (
        <>
          <Row
            label={`${tokenIn.symbol} Balance`}
            value={`${formatToken(Number(balance) || 0)} ${tokenIn.symbol}`}
          />
          {minReceived && (
            <Row
              label={`Min ${tokenOut.symbol} (${(slippageBps / 100).toFixed(2)}% slip)`}
              value={`${minReceived} ${tokenOut.symbol}`}
              muted
            />
          )}
        </>
      )}

      {/* Success row */}
      {showSuccess && explorerUrl && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-bull bg-bull/10 border border-bull/30 rounded-md px-3 py-2 hover:bg-bull/15 transition-colors"
        >
          <CheckCircle2 size={14} className="shrink-0" />
          Swap confirmed
          <ExternalLink size={12} className="ml-auto" />
        </a>
      )}

      {/* Error row */}
      {error && !showSuccess && (
        <p className="text-[11px] text-bear bg-bear/10 border border-bear/30 rounded-md px-3 py-2 leading-snug">
          {error}
        </p>
      )}

      {/* Env-var hint for operators */}
      {!routerConfigured && (
        <p className="text-[10px] text-muted-foreground/80 leading-snug">
          Set{" "}
          <code className="text-foreground font-mono">NEXT_PUBLIC_JAINE_ROUTER_ADDRESS</code>{" "}
          in <code className="text-foreground font-mono">.env</code> to enable on-chain swaps.
        </p>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ButtonShell({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tone: "bull" | "bear" | "primary" | "warn" | "muted";
}) {
  const toneClass: Record<string, string> = {
    bull: "bg-bull text-background hover:bg-bull/90 shadow-[0_0_30px_-6px_hsl(var(--bull)/0.7)]",
    bear: "bg-bear text-background hover:bg-bear/90 shadow-[0_0_30px_-6px_hsl(var(--bear)/0.7)]",
    primary: "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_30px_-6px_hsl(var(--primary)/0.7)]",
    warn: "bg-amber-500/15 text-amber-300 border border-amber-500/30 cursor-not-allowed",
    muted: "bg-panel text-muted-foreground border border-border cursor-not-allowed",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-11 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-70 ${toneClass[tone] ?? ""}`}
    >
      {children}
    </button>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular text-right ${muted ? "text-muted-foreground" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}

function formatToken(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 1 ? 4 : 6,
    minimumFractionDigits: value >= 1 ? 2 : 0,
  }).format(value);
}
