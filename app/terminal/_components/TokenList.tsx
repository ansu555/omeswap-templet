"use client";

import { useEffect, useMemo, useState } from "react";
import { TokenIcon } from "./Icon";

type Market = {
  symbol: string;
  pair: string;
  leverage: number;
  color: string;
};

type Ticker = {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  quoteVolume: number;
};

type BinanceTicker = {
  s?: string;
  symbol?: string;
  c?: string;
  lastPrice?: string;
  P?: string;
  priceChangePercent?: string;
  q?: string;
  quoteVolume?: string;
};

type CombinedTickerMessage = {
  data: BinanceTicker;
};

const markets: Market[] = [
  { symbol: "BTC", pair: "BTCUSDT", leverage: 40, color: "bg-orange-500" },
  { symbol: "ETH", pair: "ETHUSDT", leverage: 25, color: "bg-slate-400" },
  { symbol: "SOL", pair: "SOLUSDT", leverage: 20, color: "bg-purple-500" },
  { symbol: "BNB", pair: "BNBUSDT", leverage: 20, color: "bg-yellow-500" },
  { symbol: "XRP", pair: "XRPUSDT", leverage: 10, color: "bg-blue-500" },
  { symbol: "DOGE", pair: "DOGEUSDT", leverage: 10, color: "bg-amber-500" },
  { symbol: "ADA", pair: "ADAUSDT", leverage: 10, color: "bg-cyan-500" },
  { symbol: "AVAX", pair: "AVAXUSDT", leverage: 10, color: "bg-red-500" },
  { symbol: "LINK", pair: "LINKUSDT", leverage: 10, color: "bg-blue-600" },
  { symbol: "ZEC", pair: "ZECUSDT", leverage: 10, color: "bg-yellow-600" },
];

export function TokenList({ active = "BTC" }: { active?: string }) {
  const [tickers, setTickers] = useState<Record<string, Ticker>>({});
  const [status, setStatus] = useState<"loading" | "live" | "offline">("loading");

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;
    const aborter = new AbortController();
    const pairs = markets.map((market) => market.pair);

    async function loadTickers() {
      setStatus("loading");

      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(pairs))}`,
          { signal: aborter.signal },
        );

        if (!response.ok) throw new Error("Market ticker snapshot failed");

        const snapshot = (await response.json()) as BinanceTicker[];
        if (disposed) return;

        setTickers((current) => mergeTickers(current, snapshot));
        setStatus("live");

        const streams = pairs.map((pair) => `${pair.toLowerCase()}@ticker`).join("/");
        socket = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
        socket.onopen = () => {
          if (!disposed) setStatus("live");
        };
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data as string) as CombinedTickerMessage;
          if (!disposed && message.data) {
            setTickers((current) => mergeTickers(current, [message.data]));
          }
        };
        socket.onerror = () => {
          if (!disposed) setStatus("offline");
        };
        socket.onclose = () => {
          if (!disposed) setStatus("offline");
        };
      } catch {
        if (!disposed && !aborter.signal.aborted) setStatus("offline");
      }
    }

    loadTickers();

    return () => {
      disposed = true;
      aborter.abort();
      socket?.close();
    };
  }, []);

  const totalVolume = useMemo(
    () => markets.reduce((sum, market) => sum + (tickers[market.pair]?.quoteVolume ?? 0), 0),
    [tickers],
  );

  return (
    <aside className="w-[300px] shrink-0 border-r border-border bg-background flex flex-col">
      <div className="grid grid-cols-3 text-sm border-b border-border">
        {["Tokens", "Perps", "Follows"].map((tab) => (
          <button
            key={tab}
            className={`py-3 font-medium ${
              tab === "Perps" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-b border-border text-[11px] text-muted-foreground">
        <span>USDT perps</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "live" ? "bg-bull animate-pulse" : status === "loading" ? "bg-primary" : "bg-bear"
            }`}
          />
          {status === "live" ? "Live" : status === "loading" ? "Loading" : "Offline"}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {markets.map((market) => {
          const ticker = tickers[market.pair];
          const isActive = market.symbol === active;
          const change = ticker?.changePercent ?? 0;
          const positive = change >= 0;

          return (
            <button
              key={market.pair}
              className={`w-full grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 px-3 py-2.5 text-sm hover:bg-panel-hover transition-colors ${
                isActive ? "bg-panel" : ""
              }`}
            >
              <TokenIcon symbol={market.symbol} color={market.color} />
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium truncate">{market.symbol}</span>
                <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                  {market.leverage}x
                </span>
              </div>
              <span className="tabular text-foreground">{ticker ? formatPrice(ticker.lastPrice) : "..."}</span>
              <span className={`tabular text-xs w-16 text-right ${positive ? "text-bull" : "text-bear"}`}>
                {ticker ? `${positive ? "+" : ""}${change.toFixed(2)}%` : "..."}
              </span>
            </button>
          );
        })}
      </div>
      <div className="px-3 py-2 border-t border-border text-xs tabular text-muted-foreground">
        24h quote volume {totalVolume ? formatCompactUsd(totalVolume) : "..."}
      </div>
    </aside>
  );
}

function mergeTickers(current: Record<string, Ticker>, rows: BinanceTicker[]) {
  const next = { ...current };

  rows.forEach((row) => {
    const symbol = row.s ?? row.symbol;

    if (!symbol) return;

    next[symbol] = {
      symbol,
      lastPrice: Number(row.c ?? row.lastPrice ?? 0),
      changePercent: Number(row.P ?? row.priceChangePercent ?? 0),
      quoteVolume: Number(row.q ?? row.quoteVolume ?? 0),
    };
  });

  return next;
}

function formatPrice(value: number) {
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1 ? 2 : 4,
  }).format(value);
}

function formatCompactUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
