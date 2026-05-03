import Link from "next/link";
import { ExternalLink, TrendingUp, TrendingDown, Droplet, BarChart3, ArrowRight } from "lucide-react";
import { getDexMarket } from "@/lib/dex/geckoterminal";
import { DEX_MARKETS, type DexMarketConfig } from "@/lib/dex/markets";
import type { DexMarket } from "@/lib/dex/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 15;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: number, opts?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("en-US", opts).format(value);
}

function fmtUsd(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${fmt(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPrice(value: number) {
  if (value >= 1_000) return fmt(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value >= 1) return fmt(value, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  if (value >= 0.0001) return fmt(value, { minimumFractionDigits: 6, maximumFractionDigits: 6 });
  return fmt(value, { minimumFractionDigits: 8, maximumFractionDigits: 8 });
}

function TokenAvatar({ symbol, gradient }: { symbol: string; gradient: string }) {
  return (
    <div
      className={`w-10 h-10 rounded-full ${gradient} border-2 border-background flex items-center justify-center text-sm font-bold text-white select-none shrink-0`}
    >
      {symbol.slice(0, 2).toUpperCase()}
    </div>
  );
}

function ChangeChip({ change }: { change: number }) {
  const positive = change >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        positive
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      }`}
    >
      <Icon size={11} />
      {positive ? "+" : ""}
      {change.toFixed(2)}%
    </span>
  );
}

// ── Pool Card ─────────────────────────────────────────────────────────────────

function PoolCard({ config, market }: { config: DexMarketConfig; market: DexMarket }) {
  const isLive = market.source !== "fallback";
  const baseReservePct = 50; // constant-product AMM: each side ≈ 50% by value

  return (
    <div className="group relative flex flex-col gap-5 rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-6 hover:border-primary/30 hover:bg-card/80 transition-all duration-200">
      {/* Live indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${isLive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground/40"}`}
        />
        <span className="text-[10px] text-muted-foreground font-medium">
          {isLive ? "Live" : "Fallback"}
        </span>
      </div>

      {/* Header — token pair */}
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2.5">
          <TokenAvatar symbol={config.baseToken.symbol} gradient="bg-gradient-to-br from-violet-500 to-indigo-600" />
          <TokenAvatar symbol={config.quoteToken.symbol} gradient="bg-gradient-to-br from-sky-400 to-cyan-600" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-foreground">{config.pairLabel}</span>
            <Badge variant="outline" className="text-[10px] py-0 h-5 font-medium">
              Jaine
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{config.networkName} · {config.executionVenue}</div>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-2xl font-bold tabular-nums text-foreground">
            ${fmtPrice(market.priceUsd)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{config.quoteToken.symbol} price</div>
        </div>
        <ChangeChip change={market.change24h} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">TVL</span>
          <span className="font-semibold tabular-nums">{fmtUsd(market.liquidityUsd)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">24h Vol</span>
          <span className="font-semibold tabular-nums">{fmtUsd(market.volume24hUsd)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">24h Txns</span>
          <span className="font-semibold tabular-nums">{market.transactions24h.toLocaleString()}</span>
        </div>
      </div>

      {/* Reserve split bar */}
      <div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
            {config.baseToken.symbol} {baseReservePct}%
          </span>
          <span className="flex items-center gap-1">
            {100 - baseReservePct}% {config.quoteToken.symbol}
            <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" />
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-l-full transition-all duration-500"
            style={{ width: `${baseReservePct}%` }}
          />
          <div
            className="h-full bg-gradient-to-r from-sky-400 to-cyan-500 rounded-r-full transition-all duration-500"
            style={{ width: `${100 - baseReservePct}%` }}
          />
        </div>
        <div className="text-[10px] text-muted-foreground/60 mt-1">
          Constant-product AMM · equal value per side
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-2 pt-1">
        <Button asChild size="sm" className="flex-1 gap-1.5 font-semibold">
          <Link href={`/terminal?market=${config.id}`}>
            Trade
            <ArrowRight size={13} />
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="flex-1 gap-1.5">
          <a href="https://jaine.app/" target="_blank" rel="noopener noreferrer">
            Jaine
            <ExternalLink size={12} />
          </a>
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PoolsPage() {
  const jaineMarkets = DEX_MARKETS.filter((m) => m.network === "0g" && m.kind === "spot");

  const markets = await Promise.all(
    jaineMarkets.map((m) => getDexMarket(m.id))
  );

  const totalTvl = markets.reduce((sum, m) => sum + m.liquidityUsd, 0);
  const totalVolume24h = markets.reduce((sum, m) => sum + m.volume24hUsd, 0);

  return (
    <div className="min-h-screen bg-transparent">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-28">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Droplet size={20} className="text-primary" />
            <h1 className="text-2xl font-bold">Liquidity Pools</h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">
            Jaine DEX pools on <span className="text-foreground font-medium">0G Mainnet</span>.
            Provide liquidity or swap directly via the terminal.
          </p>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm px-5 py-4">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1">Total TVL</div>
            <div className="text-xl font-bold tabular-nums">{fmtUsd(totalTvl)}</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm px-5 py-4">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1">24h Volume</div>
            <div className="text-xl font-bold tabular-nums">{fmtUsd(totalVolume24h)}</div>
          </div>
          <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm px-5 py-4 col-span-2 sm:col-span-1">
            <div className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium mb-1">Pools</div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">{jaineMarkets.length}</span>
              <Badge variant="secondary" className="text-[10px]">
                Jaine · 0G Mainnet
              </Badge>
            </div>
          </div>
        </div>

        {/* Pool grid */}
        {jaineMarkets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-muted-foreground">
            <BarChart3 size={40} className="opacity-40" />
            <p className="text-sm">No pools available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {jaineMarkets.map((config, i) => (
              <PoolCard key={config.id} config={config} market={markets[i]} />
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="text-[11px] text-muted-foreground/60 mt-10 text-center">
          Data sourced from GeckoTerminal · refreshes every 15 s · reserve split is a constant-product estimate
        </p>
      </main>
    </div>
  );
}
