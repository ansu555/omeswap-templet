"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useChartStore } from "@/store/chart";
import { useTerminalStore } from "@/store/terminal";

const STEPS = 20;
const FEE_BPS = 30;

type DepthRow = {
  price: number;
  depth: number;
  side: "bid" | "ask";
};

function buildRows(midPrice: number, rIn: number, rOut: number): DepthRow[] {
  if (!midPrice || !rIn || !rOut) return [];
  const fee = 1 - FEE_BPS / 10_000;
  const bids: DepthRow[] = [];
  const asks: DepthRow[] = [];

  for (let i = 1; i <= STEPS; i++) {
    // asks: sell token → receive USDC
    const inAmt = (rIn * i) / (STEPS * 10);
    const outAmt = (rOut * inAmt * fee) / (rIn + inAmt * fee);
    asks.push({ price: inAmt / outAmt, depth: inAmt * midPrice, side: "ask" });
    // bids: buy token → spend USDC
    const outAmt2 = (rOut * i) / (STEPS * 10);
    const inAmt2 = (rIn * outAmt2) / ((rOut - outAmt2) * fee);
    bids.push({ price: inAmt2 / outAmt2, depth: outAmt2 * midPrice, side: "bid" });
  }

  return [
    ...bids.sort((a, b) => b.price - a.price),
    ...asks.sort((a, b) => a.price - b.price),
  ];
}

function fmtUsd(v: number): string {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(1)}K`;
  return `$${v.toFixed(0)}`;
}

function fmtPrice(v: number): string {
  if (v >= 1000) return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  if (v >= 1) return v.toFixed(3);
  return v.toFixed(6);
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: DepthRow }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="border border-border bg-card px-2 py-1.5 text-[10px] font-mono shadow-md">
      <div className="text-muted-foreground">Price</div>
      <div className="text-foreground">${fmtPrice(d.price)}</div>
      <div className="mt-0.5 text-muted-foreground">Depth</div>
      <div className={d.side === "bid" ? "text-green-400" : "text-red-400"}>
        {fmtUsd(d.depth)}
      </div>
    </div>
  );
};

export function LiquidityTile() {
  const reserves = useChartStore((s) => s.reserves);
  const candles = useChartStore((s) => s.candles);
  const activeSymbol = useTerminalStore((s) => s.activeSymbol);

  const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 0;

  const { rows, midPrice, isLive } = useMemo(() => {
    if (reserves) {
      const r0 = Number(reserves.reserve0) / 10 ** reserves.decimals0;
      const r1 = Number(reserves.reserve1) / 10 ** reserves.decimals1;
      return { rows: buildRows(reserves.midPrice, r0, r1), midPrice: reserves.midPrice, isLive: true };
    }
    if (lastClose > 0) {
      const rIn = 500_000 / lastClose;
      const rOut = 500_000;
      return { rows: buildRows(lastClose, rIn, rOut), midPrice: lastClose, isLive: false };
    }
    return { rows: [] as DepthRow[], midPrice: 0, isLive: false };
  }, [reserves, lastClose]);

  return (
    <div className="flex h-full w-full flex-col text-xs">
      {/* sub-header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-[5px]">
        <span className="font-mono text-[10px] text-muted-foreground">{activeSymbol.symbol}/USDC</span>
        <span className={`text-[10px] font-mono ${isLive ? "text-green-400/70" : "text-muted-foreground/40"}`}>
          {isLive ? "live" : "synthetic"}
        </span>
      </div>

      {/* mid price + legend */}
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-[4px]">
        <span className="font-mono text-[11px] text-foreground/80">
          {midPrice > 0 ? `$${fmtPrice(midPrice)}` : "—"}
        </span>
        <div className="flex items-center gap-3 text-[9px]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 bg-green-500/60" /> Bid
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-1.5 w-3 bg-red-500/60" /> Ask
          </span>
        </div>
      </div>

      {/* chart */}
      <div className="flex-1 px-1 pb-1">
        {rows.length === 0 ? (
          <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
            Waiting for data…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={rows}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
              barCategoryGap={1}
            >
              <XAxis
                type="number"
                hide
                domain={[0, "dataMax"]}
              />
              <YAxis
                type="category"
                dataKey="price"
                width={54}
                tick={{ fontSize: 9, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `$${fmtPrice(v)}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted)/0.15)" }} />
              {midPrice > 0 && (
                <ReferenceLine
                  x={0}
                  stroke="hsl(var(--primary))"
                  strokeDasharray="0"
                  strokeOpacity={0.4}
                />
              )}
              <Bar dataKey="depth" radius={0} maxBarSize={12}>
                {rows.map((row, i) => (
                  <Cell
                    key={i}
                    fill={row.side === "bid" ? "rgb(34 197 94 / 0.55)" : "rgb(239 68 68 / 0.55)"}
                    stroke={row.side === "bid" ? "rgb(34 197 94 / 0.8)" : "rgb(239 68 68 / 0.8)"}
                    strokeWidth={0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
