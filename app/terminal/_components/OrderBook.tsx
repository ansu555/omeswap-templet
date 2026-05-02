"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

type DepthLevel = [string, string];
type OrderRow = { price: number; size: number; total: number };
type TradeRow = { id: number; price: number; size: number; time: number; side: "buy" | "sell" };
type Tab = "book" | "trades";

type DepthSnapshot = {
  bids: DepthLevel[];
  asks: DepthLevel[];
};

type DepthMessage = {
  bids: DepthLevel[];
  asks: DepthLevel[];
};

type TradeMessage = {
  t: number;
  p: string;
  q: string;
  T: number;
  m: boolean;
};

const SYMBOL = "BTCUSDT";
const ROW_LIMIT = 10;
const TRADE_LIMIT = 36;

export function OrderBook() {
  const [activeTab, setActiveTab] = useState<Tab>("book");
  const [asks, setAsks] = useState<OrderRow[]>([]);
  const [bids, setBids] = useState<OrderRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [status, setStatus] = useState<"loading" | "live" | "offline">("loading");

  useEffect(() => {
    let disposed = false;
    let depthSocket: WebSocket | null = null;
    let tradeSocket: WebSocket | null = null;
    const aborter = new AbortController();

    async function loadDepth() {
      setStatus("loading");

      try {
        const [depthResponse, tradesResponse] = await Promise.all([
          fetch(`https://api.binance.com/api/v3/depth?symbol=${SYMBOL}&limit=20`, {
            signal: aborter.signal,
          }),
          fetch(`https://api.binance.com/api/v3/trades?symbol=${SYMBOL}&limit=${TRADE_LIMIT}`, {
            signal: aborter.signal,
          }),
        ]);

        if (!depthResponse.ok || !tradesResponse.ok) throw new Error("Order book snapshot failed");

        const snapshot = (await depthResponse.json()) as DepthSnapshot;
        const recentTrades = (await tradesResponse.json()) as Array<{
          id: number;
          price: string;
          qty: string;
          time: number;
          isBuyerMaker: boolean;
        }>;

        if (disposed) return;

        setAsks(toOrderRows(snapshot.asks, "ask"));
        setBids(toOrderRows(snapshot.bids, "bid"));
        setTrades(
          recentTrades
            .map((trade) => ({
              id: trade.id,
              price: Number(trade.price),
              size: Number(trade.qty),
              time: trade.time,
              side: trade.isBuyerMaker ? ("sell" as const) : ("buy" as const),
            }))
            .reverse(),
        );
        setStatus("live");

        depthSocket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@depth20@100ms");
        depthSocket.onopen = () => {
          if (!disposed) setStatus("live");
        };
        depthSocket.onmessage = (event) => {
          const message = JSON.parse(event.data as string) as DepthMessage;
          if (disposed) return;

          setAsks(toOrderRows(message.asks, "ask"));
          setBids(toOrderRows(message.bids, "bid"));
        };
        depthSocket.onerror = () => {
          if (!disposed) setStatus("offline");
        };
        depthSocket.onclose = () => {
          if (!disposed) setStatus("offline");
        };

        tradeSocket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");
        tradeSocket.onmessage = (event) => {
          const message = JSON.parse(event.data as string) as TradeMessage;
          if (disposed) return;

          setTrades((current) =>
            [
              {
                id: message.t,
                price: Number(message.p),
                size: Number(message.q),
                time: message.T,
                side: message.m ? ("sell" as const) : ("buy" as const),
              },
              ...current,
            ].slice(0, TRADE_LIMIT),
          );
        };
      } catch {
        if (!disposed && !aborter.signal.aborted) {
          setStatus("offline");
        }
      }
    }

    loadDepth();

    return () => {
      disposed = true;
      aborter.abort();
      depthSocket?.close();
      tradeSocket?.close();
    };
  }, []);

  const maxTotal = useMemo(
    () => Math.max(1, ...asks.map((a) => a.total), ...bids.map((b) => b.total)),
    [asks, bids],
  );
  const bestAsk = asks[asks.length - 1]?.price ?? 0;
  const bestBid = bids[0]?.price ?? 0;
  const spread = bestAsk && bestBid ? bestAsk - bestBid : 0;

  return (
    <div className="w-[340px] shrink-0 border-r border-border bg-background flex flex-col">
      <div className="grid grid-cols-2 border-b border-border text-sm">
        <button
          onClick={() => setActiveTab("book")}
          className={`py-3 font-medium ${
            activeTab === "book" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Order Book
        </button>
        <button
          onClick={() => setActiveTab("trades")}
          className={`py-3 font-medium ${
            activeTab === "trades" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Trades
        </button>
      </div>

      {activeTab === "book" ? (
        <>
          <div className="grid grid-cols-3 px-3 py-2 text-[11px] text-muted-foreground">
            <span>Price</span>
            <span className="text-right">Size (BTC)</span>
            <span className="text-right">Total (BTC)</span>
          </div>

          <div className="flex-1 overflow-hidden">
            {(asks.length ? asks : placeholderRows("ask")).map((row, index) => (
              <BookRow key={`a-${row.price}-${index}`} row={row} side="ask" maxTotal={maxTotal} muted={!asks.length} />
            ))}

            <div className="flex items-center justify-center gap-3 py-1.5 text-[11px] text-muted-foreground border-y border-border bg-panel/40">
              <span className="flex items-center gap-1.5">
                <StatusDot status={status} />
                Spread
              </span>
              <button className="flex items-center gap-1 bg-panel rounded px-1.5 py-0.5">
                0.1 <ChevronDown className="h-3 w-3" />
              </button>
              <span className="tabular text-foreground">{spread ? spread.toFixed(1) : "..."}</span>
            </div>

            {(bids.length ? bids : placeholderRows("bid")).map((row, index) => (
              <BookRow key={`b-${row.price}-${index}`} row={row} side="bid" maxTotal={maxTotal} muted={!bids.length} />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-3 px-3 py-2 text-[11px] text-muted-foreground">
            <span>Price</span>
            <span className="text-right">Size (BTC)</span>
            <span className="text-right">Time</span>
          </div>
          <div className="flex items-center justify-center gap-2 py-1.5 text-[11px] text-muted-foreground border-y border-border bg-panel/40">
            <StatusDot status={status} />
            <span>{status === "live" ? "Live BTC tape" : status === "loading" ? "Loading trades" : "Trades offline"}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            {(trades.length ? trades : placeholderTrades()).map((trade, index) => (
              <TradeRowView key={`${trade.id}-${index}`} trade={trade} muted={!trades.length} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BookRow({
  row,
  side,
  maxTotal,
  muted,
}: {
  row: OrderRow;
  side: "ask" | "bid";
  maxTotal: number;
  muted?: boolean;
}) {
  const pct = Math.max(3, (row.total / maxTotal) * 100);
  const color = side === "ask" ? "text-bear" : "text-bull";
  const bg = side === "ask" ? "bg-bear/15" : "bg-bull/15";

  return (
    <div className={`relative grid grid-cols-3 px-3 py-[3px] text-xs tabular hover:bg-panel/60 ${muted ? "opacity-40" : ""}`}>
      <div className={`absolute right-0 top-0 bottom-0 ${bg}`} style={{ width: `${pct}%` }} />
      <span className={`${color} relative`}>{row.price ? formatPrice(row.price) : "..."}</span>
      <span className="text-right relative">{row.size ? row.size.toFixed(5) : "..."}</span>
      <span className="text-right relative">{row.total ? row.total.toFixed(5) : "..."}</span>
    </div>
  );
}

function TradeRowView({ trade, muted }: { trade: TradeRow; muted?: boolean }) {
  const color = trade.side === "buy" ? "text-bull" : "text-bear";

  return (
    <div className={`grid grid-cols-3 px-3 py-[3px] text-xs tabular hover:bg-panel/60 ${muted ? "opacity-40" : ""}`}>
      <span className={color}>{trade.price ? formatPrice(trade.price) : "..."}</span>
      <span className="text-right">{trade.size ? trade.size.toFixed(5) : "..."}</span>
      <span className="text-right text-muted-foreground">{trade.time ? formatTime(trade.time) : "..."}</span>
    </div>
  );
}

function StatusDot({ status }: { status: "loading" | "live" | "offline" }) {
  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${
        status === "live" ? "bg-bull animate-pulse" : status === "loading" ? "bg-primary" : "bg-bear"
      }`}
    />
  );
}

function toOrderRows(levels: DepthLevel[], side: "ask" | "bid"): OrderRow[] {
  let total = 0;
  const rows = levels
    .map(([price, size]) => ({ price: Number(price), size: Number(size) }))
    .filter((row) => row.size > 0)
    .sort((a, b) => (side === "ask" ? a.price - b.price : b.price - a.price))
    .slice(0, ROW_LIMIT)
    .map((row) => {
      total += row.size;
      return { ...row, total };
    });

  return side === "ask" ? rows.reverse() : rows;
}

function placeholderRows(side: "ask" | "bid"): OrderRow[] {
  return Array.from({ length: ROW_LIMIT }, (_, index) => ({
    price: 0,
    size: 0,
    total: side === "ask" ? ROW_LIMIT - index : index + 1,
  }));
}

function placeholderTrades(): TradeRow[] {
  return Array.from({ length: TRADE_LIMIT }, (_, index) => ({
    id: index,
    price: 0,
    size: 0,
    time: 0,
    side: index % 2 === 0 ? "buy" : "sell",
  }));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatTime(value: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(value);
}
