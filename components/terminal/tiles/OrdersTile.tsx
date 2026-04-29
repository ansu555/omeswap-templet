"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import type { Address } from "viem";
import { ExternalLink, RefreshCw, ClipboardList } from "lucide-react";
import { useTerminalStore } from "@/store/terminal";
import { usePoolDetails, type PoolTransaction } from "@/hooks/use-pool-details";
import { MultiTokenLiquidityPoolsABI } from "@/contracts/abis";
import { TOKENS } from "@/contracts/config";
import { getChainConfig, getDefaultChainId, getExplorerLink } from "@/lib/chain-registry";
import { cn } from "@/lib/utils";

type Tab = "all" | "swap" | "add" | "remove";

const TAB_LABELS: Record<Tab, string> = { all: "All", swap: "Swaps", add: "Add", remove: "Remove" };

const TYPE_COLOR: Record<PoolTransaction["type"], string> = {
  Swap:   "text-primary",
  Add:    "text-green-400",
  Remove: "text-red-400",
};
const TYPE_BADGE: Record<PoolTransaction["type"], string> = {
  Swap:   "bg-primary/10 text-primary border border-primary/20",
  Add:    "bg-green-500/10 text-green-400 border border-green-500/20",
  Remove: "bg-red-500/10 text-red-400 border border-red-500/20",
};

function fmtAmt(s: string): string {
  const n = parseFloat(s);
  if (!n) return "0";
  if (n < 0.001) return "<0.001";
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

function fmtAge(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}


function OrdersInner({ poolId, chainId }: { poolId: number; chainId: number }) {
  const { address } = useAccount();
  const activeSymbol = useTerminalStore((s) => s.activeSymbol);
  const [tab, setTab] = useState<Tab>("all");

  const { transactions, isLoadingTxs } = usePoolDetails(poolId, activeSymbol.symbol, "USDC");

  const filtered = transactions.filter((tx) => {
    if (tab !== "all" && tx.type.toLowerCase() !== tab) return false;
    if (address && tx.wallet.toLowerCase() !== address.toLowerCase()) return false;
    return true;
  });

  const allFiltered = !address
    ? transactions.filter((tx) => tab === "all" || tx.type.toLowerCase() === tab)
    : filtered;

  return (
    <div className="flex h-full flex-col">
      {/* tabs */}
      <div className="flex border-b border-border">
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <button
            key={t}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-[5px] text-[10px] uppercase tracking-wide font-semibold border-b-2 transition-colors",
              tab === t
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* wallet hint */}
      {!address && (
        <div className="border-b border-border/40 px-3 py-1 text-[10px] text-muted-foreground/50">
          Connect wallet to filter by your address
        </div>
      )}

      {/* column headers */}
      <div className="grid grid-cols-[52px_1fr_1fr_36px] border-b border-border/40 px-3 py-[4px] text-[9px] uppercase tracking-wider text-muted-foreground/60">
        <span>Type</span>
        <span>{activeSymbol.symbol}</span>
        <span>USDC</span>
        <span className="text-right">Age</span>
      </div>

      {/* rows */}
      <div className="flex-1 overflow-y-auto font-mono text-[10px]">
        {isLoadingTxs && (
          <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw size={11} className="animate-spin" />
            <span>Loading…</span>
          </div>
        )}

        {!isLoadingTxs && allFiltered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <ClipboardList size={18} className="opacity-30" />
            <span className="text-[11px]">No transactions</span>
          </div>
        )}

        {!isLoadingTxs && allFiltered.map((tx, i) => (
          <div
            key={tx.txHash + i}
            className="grid grid-cols-[52px_1fr_1fr_36px] items-center gap-1 border-b border-border/20 px-3 py-[5px] hover:bg-muted/20 transition-colors"
          >
            <span className={cn("px-1.5 py-px text-[9px] font-semibold uppercase text-center", TYPE_BADGE[tx.type])}>
              {tx.type}
            </span>
            <span className={cn(TYPE_COLOR[tx.type])}>
              {fmtAmt(tx.token0Amount)}
            </span>
            <span className="text-foreground/70">
              {fmtAmt(tx.token1Amount)}
            </span>
            <a
              href={getExplorerLink(chainId, "tx", tx.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              onMouseDown={(e) => e.stopPropagation()}
              className="flex justify-end text-muted-foreground/40 hover:text-primary transition-colors"
              title={fmtAge(tx.timestamp)}
            >
              <ExternalLink size={10} />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrdersTile() {
  const activeSymbol = useTerminalStore((s) => s.activeSymbol);
  const connectedChainId = useChainId();

  let chainConfig;
  try { chainConfig = getChainConfig(connectedChainId); }
  catch { chainConfig = getChainConfig(getDefaultChainId()); }

  const poolsAddress = (chainConfig.omeswapPools ?? "0x0000000000000000000000000000000000000000") as Address;
  const chainId = chainConfig.chain.id;
  const usdcAddr = TOKENS.USDC?.address as Address | undefined;

  const tokenAddr = activeSymbol.address;
  const [t0, t1] = usdcAddr && tokenAddr.toLowerCase() < usdcAddr.toLowerCase()
    ? [tokenAddr, usdcAddr]
    : [usdcAddr ?? tokenAddr, tokenAddr];

  const { data: rawPoolId } = useReadContract({
    address: poolsAddress,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolId",
    args: [t0, t1],
    chainId,
  });

  const poolId = rawPoolId !== undefined ? Number(rawPoolId as bigint) : undefined;

  return (
    <div className="flex h-full w-full flex-col text-xs">
      {/* sub-header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-[5px]">
        <span className="font-mono text-[10px] text-muted-foreground">{activeSymbol.symbol}/USDC</span>
        {poolId !== undefined && (
          <span className="text-[10px] text-muted-foreground/40 font-mono">Pool #{poolId}</span>
        )}
      </div>

      {poolId === undefined ? (
        <div className="flex flex-1 items-center justify-center text-[11px] text-muted-foreground">
          Resolving pool…
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <OrdersInner poolId={poolId} chainId={chainId} />
        </div>
      )}
    </div>
  );
}
