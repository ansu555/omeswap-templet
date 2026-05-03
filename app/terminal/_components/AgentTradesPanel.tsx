"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Bot, TrendingUp, TrendingDown, Repeat2 } from "lucide-react";
import {
  useTransactionStore,
  useHydrateTransactionStore,
  type StoredTransaction,
} from "@/store/transaction-store";

/**
 * AgentTradesPanel — terminal-side feed of agent-initiated trades.
 *
 * Surfaces both:
 *   - real swaps recorded by the SwapNode / Jaine swap card (source: dex-swap | agent-builder)
 *   - simulated perp opens from LongShortNode (source: agent-perp-sim, simulated: true)
 *
 * When `marketId` is provided, perp rows are filtered to that market and spot
 * rows are filtered by the swap's symbol heuristic so each terminal view shows
 * only the trades relevant to the current chart.
 */
export function AgentTradesPanel({
  marketId,
  baseSymbol,
}: {
  marketId?: string;
  baseSymbol?: string;
}) {
  useHydrateTransactionStore();
  const transactions = useTransactionStore((s) => s.transactions);

  const filtered = useMemo(() => {
    if (!marketId && !baseSymbol) return transactions;
    return transactions.filter((tx) => {
      if (tx.marketId && marketId) return tx.marketId === marketId;
      if (baseSymbol) {
        const sym = baseSymbol.toUpperCase();
        return (
          tx.fromToken?.toUpperCase() === sym ||
          tx.toToken?.toUpperCase() === sym
        );
      }
      return true;
    });
  }, [transactions, marketId, baseSymbol]);

  if (filtered.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4 py-8 text-center">
        <Bot size={20} className="text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground max-w-[220px] leading-relaxed">
          No agent trades for this market yet. Run a strategy from the
          {" "}
          <Link href="/research" className="text-primary hover:underline">research page</Link>
          {" "}or build one in the
          {" "}
          <Link href="/agent-builder" className="text-primary hover:underline">agent builder</Link>.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {filtered.map((tx) => (
        <AgentTradeRow key={tx.id} tx={tx} />
      ))}
    </div>
  );
}

function AgentTradeRow({ tx }: { tx: StoredTransaction }) {
  const isPerp = tx.type === "PERP_OPEN" || tx.type === "PERP_CLOSE";
  const isLong = tx.direction === "long";

  const Icon = isPerp ? (isLong ? TrendingUp : TrendingDown) : Repeat2;
  const tone = isPerp
    ? isLong
      ? "text-bull"
      : "text-bear"
    : "text-foreground";

  const label = isPerp
    ? `${isLong ? "LONG" : "SHORT"} ${tx.toToken}`
    : `${tx.fromToken} → ${tx.toToken}`;

  const sub = isPerp
    ? `$${tx.fromAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}` +
      (tx.leverage && tx.leverage > 1 ? ` · ${tx.leverage}x` : "")
    : `${formatTokenAmount(tx.fromAmount)} ${tx.fromToken} → ${formatTokenAmount(tx.toAmount)} ${tx.toToken}`;

  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/40 hover:bg-panel/40 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <Icon size={12} className={`shrink-0 ${tone}`} />
        <div className="flex flex-col min-w-0">
          <span className={`text-[11px] font-semibold ${tone} truncate`}>{label}</span>
          <span className="text-[10px] text-muted-foreground truncate tabular">
            {sub}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <div className="flex items-center gap-1">
          {tx.simulated ? (
            <span className="text-[9px] uppercase font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1 rounded">
              Sim
            </span>
          ) : null}
          {tx.dex ? (
            <span className="text-[9px] text-muted-foreground">{tx.dex}</span>
          ) : null}
        </div>
        <a
          href={tx.explorerUrl}
          target={tx.simulated ? undefined : "_blank"}
          rel={tx.simulated ? undefined : "noopener noreferrer"}
          className="text-[9px] text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5 tabular"
        >
          {timeAgo(tx.timestamp)}
          {tx.simulated ? null : <ExternalLink size={9} />}
        </a>
      </div>
    </div>
  );
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function formatTokenAmount(value: number): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (Math.abs(value) >= 1) {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);
}
