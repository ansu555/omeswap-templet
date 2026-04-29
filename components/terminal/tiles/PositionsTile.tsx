"use client";

import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import type { Address } from "viem";
import { Wallet, BarChart2 } from "lucide-react";
import { useTerminalStore } from "@/store/terminal";
import { MultiTokenLiquidityPoolsABI } from "@/contracts/abis";
import { TOKENS } from "@/contracts/config";
import { getChainConfig, getDefaultChainId } from "@/lib/chain-registry";
import { useChainId } from "wagmi";

function fmt(n: bigint | undefined, dp = 4): string {
  if (n === undefined) return "—";
  const v = parseFloat(formatEther(n));
  if (v === 0) return "0";
  if (v < 0.0001) return "<0.0001";
  return v.toLocaleString(undefined, { maximumFractionDigits: dp });
}

function ShareBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 bg-border overflow-hidden">
        <div
          className="h-full bg-primary/70 transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="w-14 text-right font-mono text-[10px] text-muted-foreground">
        {pct < 0.01 ? "<0.01" : pct.toFixed(3)}%
      </span>
    </div>
  );
}

export function PositionsTile() {
  const { address, isConnected } = useAccount();
  const activeSymbol = useTerminalStore((s) => s.activeSymbol);
  const connectedChainId = useChainId();

  let chainConfig;
  try { chainConfig = getChainConfig(connectedChainId); }
  catch { chainConfig = getChainConfig(getDefaultChainId()); }

  const poolsAddress = (chainConfig.omeswapPools ?? "0x0000000000000000000000000000000000000000") as Address;
  const chainId = chainConfig.chain.id;
  const usdcAddr = TOKENS.USDC?.address as Address | undefined;

  // Sort token addresses deterministically (same as use-liquidity.tsx)
  const tokenAddr = activeSymbol.address;
  const [t0, t1] = usdcAddr && tokenAddr.toLowerCase() < usdcAddr.toLowerCase()
    ? [tokenAddr, usdcAddr]
    : [usdcAddr ?? tokenAddr, tokenAddr];

  const { data: poolId } = useReadContract({
    address: poolsAddress,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolId",
    args: [t0, t1],
    chainId,
  });

  const { data: poolInfo } = useReadContract({
    address: poolsAddress,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolInfo",
    args: [poolId as bigint],
    chainId,
    query: { enabled: !!poolId },
  });

  const { data: position } = useReadContract({
    address: poolsAddress,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getUserPosition",
    args: [poolId as bigint, address as Address],
    chainId,
    query: { enabled: !!poolId && !!address },
  });

  const [lpTokens, tok0Deposited, tok1Deposited] = (position as [bigint, bigint, bigint] | undefined) ?? [];
  const totalLP = poolInfo ? (poolInfo as readonly [Address, Address, bigint, bigint, bigint])[4] : undefined;
  const sharePct = lpTokens && totalLP && totalLP > 0n
    ? (Number(lpTokens) / Number(totalLP)) * 100
    : 0;

  const hasPosition = lpTokens !== undefined && lpTokens > 0n;

  // Determine display labels — token0 vs token1 relative to active symbol
  const isToken0 = usdcAddr && tokenAddr.toLowerCase() < usdcAddr.toLowerCase();
  const symbolLabel = activeSymbol.symbol;
  const usdcLabel = "USDC";
  const [label0, label1] = isToken0 ? [symbolLabel, usdcLabel] : [usdcLabel, symbolLabel];

  return (
    <div className="flex h-full w-full flex-col text-xs">
      {/* pair sub-header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-[5px]">
        <span className="font-mono text-[10px] text-muted-foreground">{activeSymbol.symbol}/USDC</span>
        {isConnected && address && (
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3">
        {!isConnected && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <Wallet size={20} className="opacity-30" />
            <span className="text-[11px]">Connect wallet to view positions</span>
          </div>
        )}

        {isConnected && !hasPosition && position !== undefined && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <BarChart2 size={20} className="opacity-30" />
            <span className="text-[11px]">No position in this pool</span>
          </div>
        )}

        {isConnected && hasPosition && (
          <div className="space-y-3">
            {/* LP Token row */}
            <div className="border border-border p-3 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                LP Position
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                <span className="text-muted-foreground text-[10px]">LP Tokens</span>
                <span className="font-mono text-[11px] text-right">{fmt(lpTokens, 6)}</span>
                <span className="text-muted-foreground text-[10px]">{label0} Deposited</span>
                <span className="font-mono text-[11px] text-right text-green-400">{fmt(tok0Deposited)}</span>
                <span className="text-muted-foreground text-[10px]">{label1} Deposited</span>
                <span className="font-mono text-[11px] text-right text-green-400">{fmt(tok1Deposited)}</span>
              </div>
            </div>

            {/* Pool share */}
            <div className="border border-border p-3 space-y-2">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Pool Share
              </div>
              <ShareBar pct={sharePct} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
