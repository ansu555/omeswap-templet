"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";
import { useTerminalStore } from "@/store/terminal";
import { cn } from "@/lib/utils";

type HolderRow = {
  address: string;
  quantity: string;
  share: number;
};

type AuditScores = {
  overall?: number;
  financial?: number;
  social?: number;
  security?: number;
};

type HolderData = {
  holderCount: number | null;
  marketCap: number | null;
  circulatingSupply: number | null;
  auditScores: AuditScores;
  topHolders: HolderRow[];
};

function fmtNum(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function fmtSupply(n: number | null): string {
  if (n === null) return "—";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

function ScoreBar({ label, score }: { label: string; score?: number }) {
  const pct = score ?? 0;
  const color =
    pct >= 80 ? "bg-green-500" :
    pct >= 60 ? "bg-yellow-500" :
    pct >= 40 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[10px] text-muted-foreground">{label}</span>
      <div className="h-1 flex-1 bg-border overflow-hidden">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-[10px] text-foreground/70">
        {score !== undefined ? score : "—"}
      </span>
    </div>
  );
}

function HolderBar({ share, max }: { share: number; max: number }) {
  return (
    <div className="h-1 flex-1 bg-border overflow-hidden">
      <div
        className="h-full bg-primary/60 transition-all"
        style={{ width: `${max > 0 ? (share / max) * 100 : 0}%` }}
      />
    </div>
  );
}

export function HoldersTile() {
  const activeSymbol = useTerminalStore((s) => s.activeSymbol);
  const [data, setData] = useState<HolderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const addr = activeSymbol.address;
    const cgId = activeSymbol.coingeckoId;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setData(null);

    const snowtraceBase = "https://api.snowtrace.io/api";
    const holderCountUrl = `${snowtraceBase}?module=token&action=tokenholdercount&contractaddress=${addr}`;
    const holderListUrl = `${snowtraceBase}?module=token&action=tokenholderlist&contractaddress=${addr}&page=1&offset=15`;
    const cgUrl = cgId ? `/api/token/${cgId}` : null;

    Promise.all([
      fetch(holderCountUrl).then((r) => r.json()).catch(() => null),
      fetch(holderListUrl).then((r) => r.json()).catch(() => null),
      cgUrl ? fetch(cgUrl).then((r) => r.json()).catch(() => null) : Promise.resolve(null),
    ]).then(([countData, listData, cgData]) => {
      if (cancelled) return;

      const holderCount = countData?.result ? parseInt(countData.result, 10) : null;

      const rawHolders: { TokenHolderAddress: string; TokenHolderQuantity: string }[] =
        Array.isArray(listData?.result) ? listData.result : [];

      const totalQty = rawHolders.reduce((s, h) => s + parseFloat(h.TokenHolderQuantity), 0);
      const topHolders: HolderRow[] = rawHolders.slice(0, 15).map((h) => ({
        address: h.TokenHolderAddress,
        quantity: h.TokenHolderQuantity,
        share: totalQty > 0 ? (parseFloat(h.TokenHolderQuantity) / totalQty) * 100 : 0,
      }));

      const marketCap = cgData?.market?.marketCap ?? cgData?.fundamental?.marketCap ?? null;
      const circulatingSupply = cgData?.market?.circulatingSupply ?? cgData?.fundamental?.circulatingSupply ?? null;
      const auditScores: AuditScores = cgData?.fundamental?.auditScores ?? {};

      setData({ holderCount, marketCap, circulatingSupply, auditScores, topHolders });
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setError("Failed to load holder data");
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [activeSymbol.address, activeSymbol.coingeckoId]);

  const maxShare = data?.topHolders?.length ? data.topHolders[0].share : 1;

  return (
    <div className="flex h-full w-full flex-col text-xs">
      {/* sub-header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-[5px]">
        <span className="font-mono text-[10px] text-muted-foreground">{activeSymbol.symbol}</span>
        {data?.holderCount && (
          <span className="font-mono text-[10px] text-muted-foreground/50">
            {data.holderCount.toLocaleString()} holders
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw size={11} className="animate-spin" />
            <span className="text-[11px]">Loading…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex h-full items-center justify-center text-[11px] text-red-400/70">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="divide-y divide-border/40">
            {/* market stats */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3 py-2.5">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60">Market Cap</span>
                <span className="font-mono text-[11px]">{fmtNum(data.marketCap)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60">Circulating</span>
                <span className="font-mono text-[11px]">{fmtSupply(data.circulatingSupply)}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60">Holders</span>
                <span className="font-mono text-[11px]">{data.holderCount?.toLocaleString() ?? "—"}</span>
              </div>
            </div>

            {/* audit scores */}
            {Object.values(data.auditScores).some((v) => v !== undefined) && (
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-2">Audit Scores</div>
                <ScoreBar label="Overall"   score={data.auditScores.overall} />
                <ScoreBar label="Financial" score={data.auditScores.financial} />
                <ScoreBar label="Social"    score={data.auditScores.social} />
                <ScoreBar label="Security"  score={data.auditScores.security} />
              </div>
            )}

            {/* top holders */}
            {data.topHolders.length > 0 && (
              <div className="px-3 py-2.5">
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mb-2">Top Holders</div>
                <div className="space-y-1.5">
                  {data.topHolders.slice(0, 10).map((h, i) => (
                    <div key={h.address} className="flex items-center gap-2">
                      <span className="w-4 shrink-0 font-mono text-[9px] text-muted-foreground/40">{i + 1}</span>
                      <span className="w-[76px] shrink-0 font-mono text-[10px] text-muted-foreground">
                        {h.address.slice(0, 6)}…{h.address.slice(-4)}
                      </span>
                      <HolderBar share={h.share} max={maxShare} />
                      <span className="w-10 shrink-0 text-right font-mono text-[10px] text-foreground/70">
                        {h.share.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.topHolders.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-1 py-6 text-muted-foreground">
                <Users size={18} className="opacity-30" />
                <span className="text-[11px]">No holder data</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
