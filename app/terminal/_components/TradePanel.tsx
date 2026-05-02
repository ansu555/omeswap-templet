"use client";

import Image from "next/image";
import { ChevronDown, Infinity as InfinityIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Side = "long" | "short";
type OrderType = "Market" | "Limit";

type TickerMessage = {
  c: string;
  P: string;
  q: string;
};

const BTC_FALLBACK_PRICE = 78100;

export function TradePanel() {
  const [side, setSide] = useState<Side>("long");
  const [orderType, setOrderType] = useState<OrderType>("Market");
  const [margin, setMargin] = useState("250");
  const [limitPrice, setLimitPrice] = useState("");
  const [percent, setPercent] = useState(0);
  const [leverage, setLeverage] = useState(5);
  const [autoClose, setAutoClose] = useState(false);
  const [markPrice, setMarkPrice] = useState(BTC_FALLBACK_PRICE);
  const [changePercent, setChangePercent] = useState(0);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    let disposed = false;
    const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@ticker");

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data as string) as TickerMessage;
      if (disposed) return;

      setMarkPrice(Number(message.c));
      setChangePercent(Number(message.P));
      setVolume(Number(message.q));
    };

    return () => {
      disposed = true;
      socket.close();
    };
  }, []);

  const preview = useMemo(() => {
    const marginValue = Math.max(0, Number(margin) || 0);
    const entry = orderType === "Limit" && Number(limitPrice) > 0 ? Number(limitPrice) : markPrice;
    const orderValue = marginValue * leverage;
    const size = entry > 0 ? orderValue / entry : 0;
    const liquidation =
      side === "long" ? entry * (1 - 0.9 / leverage) : entry * (1 + 0.9 / leverage);

    return {
      entry,
      marginValue,
      orderValue,
      size,
      liquidation,
    };
  }, [leverage, limitPrice, margin, markPrice, orderType, side]);

  return (
    <aside className="w-[340px] shrink-0 bg-background flex flex-col">
      <div className="grid grid-cols-2 border-b border-border">
        <button
          onClick={() => setSide("long")}
          className={`py-3 text-sm font-semibold ${
            side === "long"
              ? "text-bull border-b-2 border-bull bg-bull/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Long
        </button>
        <button
          onClick={() => setSide("short")}
          className={`py-3 text-sm font-semibold ${
            side === "short"
              ? "text-bear border-b-2 border-bear bg-bear/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Short
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <Row label="Available to Trade" value="$0.00" />
        <Row label="BTC Mark" value={formatUsd(markPrice)} valueClass={changePercent >= 0 ? "text-bull" : "text-bear"} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Order Type</span>
            <button
              onClick={() => setOrderType((current) => (current === "Market" ? "Limit" : "Market"))}
              className="text-xs text-foreground flex items-center gap-1"
            >
              {orderType} <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center bg-panel rounded-lg border border-border h-10 px-3">
            <span className="text-muted-foreground">$</span>
            <input
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
              inputMode="decimal"
              className="flex-1 min-w-0 bg-transparent outline-none px-2 tabular text-foreground"
            />
            <button className="flex items-center gap-1 text-muted-foreground text-xs">
              <InfinityIcon className="h-4 w-4" />
              USDC
            </button>
          </div>
        </div>

        {orderType === "Limit" ? (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Limit Price</div>
            <div className="flex items-center bg-panel rounded-lg border border-border h-10 px-3">
              <span className="text-muted-foreground">$</span>
              <input
                value={limitPrice}
                onChange={(event) => setLimitPrice(event.target.value)}
                placeholder={markPrice.toFixed(1)}
                inputMode="decimal"
                className="flex-1 min-w-0 bg-transparent outline-none px-2 tabular text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        ) : null}

        <SliderField value={percent} min={0} max={100} suffix="%" onChange={setPercent} />

        <div>
          <div className="text-xs text-muted-foreground mb-2">Leverage</div>
          <SliderField value={leverage} min={1} max={40} suffix="x" onChange={setLeverage} />
        </div>

        <Row label="Entry Price" value={formatUsd(preview.entry)} />
        <Row label="Position Size" value={`${preview.size.toFixed(5)} BTC`} />
        <Row label="Liquidation Price Est." value={formatUsd(preview.liquidation)} muted />
        <Row label="Order Value" value={formatUsd(preview.orderValue)} />
        <Row label="24h BTC Volume" value={volume ? formatCompactUsd(volume) : "..."} muted />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Auto Close</span>
          <button
            onClick={() => setAutoClose((current) => !current)}
            className={`relative h-5 w-9 rounded-full transition-colors ${autoClose ? "bg-primary" : "bg-secondary"}`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground/90 transition-all ${
                autoClose ? "left-[18px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3 border-t border-border">
        <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center gap-2 font-semibold hover:opacity-90 shadow-[0_0_30px_-6px_hsl(var(--primary)/0.7)]">
          <Image src="/logo.png" alt="" width={18} height={18} className="rounded-full" /> Connect Wallet
        </button>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Balance</span>
          <span className="tabular">$0.00</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Available Balance</span>
          <span className="tabular">$0.00</span>
        </div>

        <button className="w-full h-10 rounded-lg bg-primary/30 text-foreground font-medium hover:bg-primary/40">
          Deposit
        </button>
        <button className="w-full h-10 rounded-lg bg-panel text-muted-foreground font-medium" disabled>
          Withdraw
        </button>
      </div>
    </aside>
  );
}

function Row({
  label,
  value,
  muted,
  valueClass = "",
}: {
  label: string;
  value: string;
  muted?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular text-right ${muted ? "text-muted-foreground" : "text-foreground"} ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}

function SliderField({
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 relative h-5 flex items-center">
        <div className="absolute left-0 right-0 h-1.5 bg-secondary rounded-full" />
        <div className="absolute left-0 h-1.5 bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="relative z-10 w-full opacity-0 cursor-pointer"
        />
        <div
          className="pointer-events-none absolute h-3 w-3 rounded-full bg-foreground border border-border"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
      <div className="bg-panel rounded-md border border-border px-2 h-7 flex items-center tabular text-sm w-16 justify-center">
        {value} {suffix}
      </div>
    </div>
  );
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 1 : 2,
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
