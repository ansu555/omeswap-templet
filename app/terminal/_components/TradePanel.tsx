"use client";

import Image from "next/image";
import { ChevronDown, Infinity as InfinityIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DexMarket } from "@/lib/dex/types";
import { UniswapSwapCard } from "@/components/trade/UniswapSwapCard";
import type { SwapToken } from "@/hooks/use-uniswap-swap";
import { ethereumConfig } from "@/lib/chain-registry/chains/ethereum";

function getEthDecimals(address: string): number {
  const match = Object.values(ethereumConfig.tokens).find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  return match?.decimals ?? 18;
}

type Side = "buy" | "sell";
type OrderType = "Swap" | "Limit Intent";

type MarketResponse = {
  market: DexMarket;
};

const FALLBACK_PRICE = 0.531342;

export function TradePanel({ marketId }: { marketId: string }) {
  const [side, setSide] = useState<Side>("buy");
  const [orderType, setOrderType] = useState<OrderType>("Swap");
  const [amount, setAmount] = useState("250");
  const [limitPrice, setLimitPrice] = useState("");
  const [percent, setPercent] = useState(0);
  const [slippageBps, setSlippageBps] = useState(50);
  const [autoClose, setAutoClose] = useState(false);
  const [market, setMarket] = useState<DexMarket | null>(null);

  useEffect(() => {
    let disposed = false;
    const aborter = new AbortController();

    async function loadMarket() {
      try {
        const response = await fetch(`/api/dex/markets?id=${encodeURIComponent(marketId)}`, {
          signal: aborter.signal,
        });

        if (!response.ok) throw new Error("Market request failed");

        const snapshot = (await response.json()) as MarketResponse;
        if (!disposed) setMarket(snapshot.market);
      } catch {
        if (!disposed && !aborter.signal.aborted) setMarket(null);
      }
    }

    loadMarket();
    const timer = window.setInterval(loadMarket, 30000);

    return () => {
      disposed = true;
      aborter.abort();
      window.clearInterval(timer);
    };
  }, [marketId]);

  const markPrice = market?.priceUsd ?? FALLBACK_PRICE;
  const baseSymbol = market?.symbol ?? "W0G";
  const route = market?.executionVenue ?? "Swap adapter";
  const liquidity = market?.liquidityUsd ?? 0;
  const isPerp = market?.kind === "perp";
  const isEthSpot = market?.network === "eth" && market?.kind === "spot";

  const swapTokenBase = useMemo<SwapToken | null>(() => {
    if (!market || !isEthSpot) return null;
    return {
      address: market.baseToken.address as `0x${string}`,
      symbol: market.baseToken.symbol,
      name: market.baseToken.name,
      decimals: getEthDecimals(market.baseToken.address),
    };
  }, [market, isEthSpot]);

  const swapTokenQuote = useMemo<SwapToken | null>(() => {
    if (!market || !isEthSpot) return null;
    return {
      address: market.quoteToken.address as `0x${string}`,
      symbol: market.quoteToken.symbol,
      name: market.quoteToken.name,
      decimals: getEthDecimals(market.quoteToken.address),
    };
  }, [market, isEthSpot]);

  const fundingSymbol = isPerp
    ? market?.quoteToken.symbol ?? "USD"
    : market?.symbol === "USDC"
      ? market.quoteToken.symbol
      : market?.chainId === 16601
        ? "USDC.e"
        : "USDC";

  const preview = useMemo(() => {
    const amountValue = Math.max(0, Number(amount) || 0);
    const entry = orderType === "Limit Intent" && Number(limitPrice) > 0 ? Number(limitPrice) : markPrice;
    const notionalUsd = side === "buy" || isPerp ? amountValue : amountValue * entry;
    const priceImpact = liquidity > 0 ? Math.min(8, (notionalUsd / liquidity) * 100) : 0;
    const impactMultiplier = Math.max(0, 1 - priceImpact / 100);
    const receive = side === "buy" && entry > 0 ? (amountValue / entry) * impactMultiplier : notionalUsd * impactMultiplier;

    return {
      entry,
      amountValue,
      notionalUsd,
      receive,
      priceImpact,
    };
  }, [amount, isPerp, limitPrice, liquidity, markPrice, orderType, side]);

  return (
    <aside className="w-[340px] shrink-0 bg-background flex flex-col">
      <div className="grid grid-cols-2 border-b border-border">
        <button
          onClick={() => setSide("buy")}
          className={`py-3 text-sm font-semibold ${
            side === "buy"
              ? "text-bull border-b-2 border-bull bg-bull/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isPerp ? "Long" : "Buy"}
        </button>
        <button
          onClick={() => setSide("sell")}
          className={`py-3 text-sm font-semibold ${
            side === "sell"
              ? "text-bear border-b-2 border-bear bg-bear/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {isPerp ? "Short" : "Sell"}
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto">
        <Row label="Available to Trade" value="$0.00" />
        <Row label={`${baseSymbol} Mark`} value={formatUsd(markPrice)} valueClass={(market?.change24h ?? 0) >= 0 ? "text-bull" : "text-bear"} />

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Order Type</span>
            <button
              onClick={() =>
                setOrderType((current) => (current === "Swap" ? "Limit Intent" : "Swap"))
              }
              className="text-xs text-foreground flex items-center gap-1"
            >
              {isPerp && orderType === "Swap" ? "Market" : orderType} <ChevronDown className="h-3 w-3" />
            </button>
          </div>
          <div className="flex items-center bg-panel rounded-lg border border-border h-10 px-3">
            <span className="text-muted-foreground">{side === "buy" ? "$" : ""}</span>
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              className="flex-1 min-w-0 bg-transparent outline-none px-2 tabular text-foreground"
            />
            <button className="flex items-center gap-1 text-muted-foreground text-xs">
              <InfinityIcon className="h-4 w-4" />
              {isPerp || side === "buy" ? fundingSymbol : baseSymbol}
            </button>
          </div>
        </div>

        {orderType === "Limit Intent" ? (
          <div>
            <div className="text-xs text-muted-foreground mb-2">Limit Price</div>
            <div className="flex items-center bg-panel rounded-lg border border-border h-10 px-3">
              <span className="text-muted-foreground">$</span>
              <input
                value={limitPrice}
                onChange={(event) => setLimitPrice(event.target.value)}
                placeholder={markPrice.toFixed(fractionDigitsForPrice(markPrice))}
                inputMode="decimal"
                className="flex-1 min-w-0 bg-transparent outline-none px-2 tabular text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        ) : null}

        <SliderField value={percent} min={0} max={100} suffix="%" onChange={setPercent} />

        <div>
          <div className="text-xs text-muted-foreground mb-2">Max Slippage</div>
          <SliderField value={slippageBps} min={5} max={300} suffix="bps" onChange={setSlippageBps} />
        </div>

        <Row label="Route" value={route} />
        <Row label="Entry Price" value={formatUsd(preview.entry)} />
        <Row
          label={isPerp ? "Position Notional" : "Est. Receive"}
          value={
            isPerp
              ? formatUsd(preview.notionalUsd)
              : side === "buy"
              ? `${formatTokenAmount(preview.receive)} ${baseSymbol}`
              : formatUsd(preview.receive)
          }
        />
        <Row label={isPerp ? "Liquidity Impact Est." : "Price Impact Est."} value={`${preview.priceImpact.toFixed(2)}%`} muted />
        <Row label="Order Value" value={formatUsd(preview.notionalUsd)} />
        <Row label={isPerp ? "Market Liquidity" : "Pool Liquidity"} value={market?.liquidityUsd ? formatCompactUsd(market.liquidityUsd) : "..."} muted />
        <Row label={isPerp ? "24h Perp Volume" : "24h Spot Volume"} value={market?.volume24hUsd ? formatCompactUsd(market.volume24hUsd) : "..."} muted />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Write Receipt</span>
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

      {isEthSpot && swapTokenBase && swapTokenQuote ? (
        <div className="p-3 border-t border-border">
          <UniswapSwapCard
            tokenIn={side === "buy" ? swapTokenQuote : swapTokenBase}
            tokenOut={side === "buy" ? swapTokenBase : swapTokenQuote}
            marketId={marketId}
          />
        </div>
      ) : (
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
      )}
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
      <div className="bg-panel rounded-md border border-border px-2 h-7 flex items-center tabular text-sm w-20 justify-center">
        {value} {suffix}
      </div>
    </div>
  );
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: fractionDigitsForPrice(value),
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

function formatTokenAmount(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: value >= 100 ? 2 : 5,
  }).format(value);
}

function fractionDigitsForPrice(value: number) {
  const absolute = Math.abs(value);

  if (absolute >= 1000) return 1;
  if (absolute >= 1) return 2;
  if (absolute >= 0.01) return 4;
  if (absolute >= 0.0001) return 6;
  return 8;
}
