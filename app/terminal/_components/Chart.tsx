"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bitcoin,
  Camera,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ListFilter,
} from "lucide-react";
import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  type CandlestickData,
  type HistogramData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";

type BtcCandle = CandlestickData<UTCTimestamp> & {
  volume: number;
};

type BtcStats = {
  mark: number;
  index: number;
  changeAmount: number;
  changePercent: number;
  volume: number;
  fundingRate: number;
  nextFundingTime: number;
};

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string,
];

type BinanceTicker = {
  lastPrice: string;
  priceChange: string;
  priceChangePercent: string;
  quoteVolume: string;
};

type BinancePremiumIndex = {
  markPrice: string;
  indexPrice: string;
  lastFundingRate: string;
  nextFundingTime: number;
};

type BinanceKlineMessage = {
  k: {
    t: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
  };
};

const SYMBOL = "BTCUSDT";
const HISTORY_LIMIT = 240;
const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;
const INDICATORS = ["EMA 20", "SMA 50", "VWAP"] as const;

type ChartInterval = (typeof INTERVALS)[number];
type IndicatorName = (typeof INDICATORS)[number];

const chartColors = {
  background: "hsl(270 40% 4%)",
  foreground: "hsl(0 0% 98%)",
  muted: "hsl(220 10% 65%)",
  grid: "hsl(270 30% 18% / 0.7)",
  bull: "hsl(164 80% 54%)",
  bear: "hsl(0 72% 71%)",
  primary: "hsl(262 83% 71%)",
  panel: "hsl(270 40% 9%)",
};

export function Chart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const emaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const smaSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const vwapSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const candlesRef = useRef<BtcCandle[]>([]);
  const [interval, setInterval] = useState<ChartInterval>("1m");
  const [enabledIndicators, setEnabledIndicators] = useState<Record<IndicatorName, boolean>>({
    "EMA 20": true,
    "SMA 50": true,
    VWAP: true,
  });
  const [stats, setStats] = useState<BtcStats>({
    mark: 0,
    index: 0,
    changeAmount: 0,
    changePercent: 0,
    volume: 0,
    fundingRate: 0,
    nextFundingTime: 0,
  });
  const [latestCandle, setLatestCandle] = useState<BtcCandle | null>(null);
  const [status, setStatus] = useState<"loading" | "live" | "offline">("loading");
  const [utcTime, setUtcTime] = useState("");
  const [bottomTab, setBottomTab] = useState("Positions (0)");

  const syncIndicatorSeries = (
    candles: BtcCandle[],
    indicators: Record<IndicatorName, boolean>,
  ) => {
    emaSeriesRef.current?.setData(indicators["EMA 20"] ? calculateEma(candles, 20) : []);
    smaSeriesRef.current?.setData(indicators["SMA 50"] ? calculateSma(candles, 50) : []);
    vwapSeriesRef.current?.setData(indicators.VWAP ? calculateVwap(candles) : []);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: chartColors.background },
        textColor: chartColors.muted,
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: "transparent" },
        horzLines: { color: chartColors.grid },
      },
      rightPriceScale: {
        borderColor: "transparent",
        textColor: chartColors.muted,
        scaleMargins: { top: 0.08, bottom: 0.28 },
      },
      timeScale: {
        borderColor: "transparent",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 8,
        barSpacing: 7,
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: "hsl(262 83% 71% / 0.45)",
          labelBackgroundColor: chartColors.primary,
        },
        horzLine: {
          color: "hsl(262 83% 71% / 0.45)",
          labelBackgroundColor: chartColors.primary,
        },
      },
      localization: {
        priceFormatter: (price: number) =>
          new Intl.NumberFormat("en-US", {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }).format(price),
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: chartColors.bull,
      downColor: chartColors.bear,
      borderUpColor: chartColors.bull,
      borderDownColor: chartColors.bear,
      wickUpColor: chartColors.bull,
      wickDownColor: chartColors.bear,
      priceLineColor: chartColors.primary,
      priceLineWidth: 1,
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "",
    });
    const emaSeries = chart.addSeries(LineSeries, {
      color: "hsl(43 96% 56%)",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const smaSeries = chart.addSeries(LineSeries, {
      color: "hsl(203 90% 62%)",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });
    const vwapSeries = chart.addSeries(LineSeries, {
      color: "hsl(326 90% 70%)",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chart.priceScale("").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
      borderColor: "transparent",
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    emaSeriesRef.current = emaSeries;
    smaSeriesRef.current = smaSeries;
    vwapSeriesRef.current = vwapSeries;

    return () => {
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      emaSeriesRef.current = null;
      smaSeriesRef.current = null;
      vwapSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const updateClock = () => {
      setUtcTime(new Date().toLocaleTimeString("en-GB", { timeZone: "UTC" }));
    };

    updateClock();
    const timer = window.setInterval(updateClock, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let disposed = false;
    let socket: WebSocket | null = null;
    const aborter = new AbortController();

    async function loadInitialChart() {
      setStatus("loading");

      try {
        const [klinesResponse, tickerResponse] = await Promise.all([
          fetch(
            `https://api.binance.com/api/v3/klines?symbol=${SYMBOL}&interval=${interval}&limit=${HISTORY_LIMIT}`,
            { signal: aborter.signal },
          ),
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${SYMBOL}`, {
            signal: aborter.signal,
          }),
        ]);

        if (!klinesResponse.ok || !tickerResponse.ok) {
          throw new Error("BTC market feed request failed");
        }

        const klines = (await klinesResponse.json()) as BinanceKline[];
        const ticker = (await tickerResponse.json()) as BinanceTicker;
        let premium: BinancePremiumIndex | null = null;

        try {
          const premiumResponse = await fetch(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${SYMBOL}`, {
            signal: aborter.signal,
          });

          premium = premiumResponse.ok ? ((await premiumResponse.json()) as BinancePremiumIndex) : null;
        } catch {
          premium = null;
        }

        if (disposed) return;

        const candles = klines.map(toCandle);
        const volumes = candles.map(toVolume);
        const last = candles[candles.length - 1] ?? null;

        candlesRef.current = candles;
        candleSeriesRef.current?.setData(candles);
        volumeSeriesRef.current?.setData(volumes);
        syncIndicatorSeries(candles, enabledIndicators);
        chartRef.current?.timeScale().fitContent();

        setLatestCandle(last);
        setStats({
          mark: premium ? Number(premium.markPrice) : Number(ticker.lastPrice),
          index: premium ? Number(premium.indexPrice) : Number(ticker.lastPrice),
          changeAmount: Number(ticker.priceChange),
          changePercent: Number(ticker.priceChangePercent),
          volume: Number(ticker.quoteVolume),
          fundingRate: premium ? Number(premium.lastFundingRate) : 0,
          nextFundingTime: premium?.nextFundingTime ?? 0,
        });
        setStatus("live");

        socket = new WebSocket(`wss://stream.binance.com:9443/ws/btcusdt@kline_${interval}`);
        socket.onopen = () => {
          if (!disposed) setStatus("live");
        };
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data as string) as BinanceKlineMessage;
          const liveCandle = toLiveCandle(message);

          candlesRef.current = upsertCandle(candlesRef.current, liveCandle);
          candleSeriesRef.current?.update(liveCandle);
          volumeSeriesRef.current?.update(toVolume(liveCandle));
          syncIndicatorSeries(candlesRef.current, enabledIndicators);
          setLatestCandle(liveCandle);
          setStats((current) => ({
            ...current,
            mark: liveCandle.close,
          }));
        };
        socket.onerror = () => {
          if (!disposed) setStatus("offline");
        };
        socket.onclose = () => {
          if (!disposed) setStatus("offline");
        };
      } catch {
        if (!disposed && !aborter.signal.aborted) {
          setStatus("offline");
        }
      }
    }

    loadInitialChart();

    return () => {
      disposed = true;
      aborter.abort();
      socket?.close();
    };
  }, [enabledIndicators, interval]);

  const ohlcText = useMemo(() => {
    if (!latestCandle) return "Waiting for BTC feed";

    const delta = latestCandle.close - latestCandle.open;
    const percent = latestCandle.open ? (delta / latestCandle.open) * 100 : 0;
    const tone = delta >= 0 ? "text-bull" : "text-bear";

    return (
      <>
        O<span className={tone}>{formatCompactNumber(latestCandle.open)} </span>
        H<span className={tone}>{formatCompactNumber(latestCandle.high)} </span>
        L<span className={tone}>{formatCompactNumber(latestCandle.low)} </span>
        C<span className={tone}>{formatCompactNumber(latestCandle.close)} </span>
        <span className={tone}>
          {delta >= 0 ? "+" : ""}
          {formatCompactNumber(delta)} ({delta >= 0 ? "+" : ""}
          {percent.toFixed(2)}%)
        </span>
      </>
    );
  }, [latestCandle]);

  return (
    <div className="flex-1 flex flex-col bg-background border-r border-border min-w-[460px]">
      <div className="flex items-center gap-4 px-4 h-16 border-b border-border overflow-hidden">
        <button className="text-muted-foreground hover:text-foreground" aria-label="Previous market">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
            <Bitcoin className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-semibold">BTC</span>
          <button className="ml-2 text-xs px-2.5 py-1 rounded-md bg-panel text-foreground hover:bg-panel-hover border border-border">
            Follow
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 flex-1 min-w-0">
          <Stat label="Mark" value={stats.mark ? formatUsd(stats.mark) : "..."} />
          <Stat label="Index" value={stats.index ? formatUsd(stats.index) : "..."} />
          <Stat
            label="Funding"
            value={formatPercent(stats.fundingRate)}
            valueClass={stats.fundingRate >= 0 ? "text-bull" : "text-bear"}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 px-3 h-9 border-b border-border text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          {INTERVALS.map((value) => (
            <button
              key={value}
              onClick={() => setInterval(value)}
              className={`h-6 px-2 rounded ${
                interval === value ? "bg-primary/20 text-foreground" : "hover:text-foreground hover:bg-panel"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
        <button className="hover:text-foreground" aria-label="Chart settings">
          <ListFilter className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          {INDICATORS.map((name) => (
            <button
              key={name}
              onClick={() =>
                setEnabledIndicators((current) => ({
                  ...current,
                  [name]: !current[name],
                }))
              }
              className={`h-6 px-2 rounded ${
                enabledIndicators[name]
                  ? "bg-panel text-foreground border border-border"
                  : "hover:text-foreground hover:bg-panel"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <span className="ml-auto flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              status === "live" ? "bg-bull animate-pulse" : status === "loading" ? "bg-primary" : "bg-bear"
            }`}
          />
          {status === "live" ? "Live" : status === "loading" ? "Loading" : "Offline"}
        </span>
        <button className="hover:text-foreground" aria-label="Capture chart">
          <Camera className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 relative min-h-[320px]">
        <div ref={containerRef} className="absolute inset-0" />

        <div className="absolute left-3 top-2 text-xs pointer-events-none">
          <div className="text-foreground">
            BTCUSDT · {interval} · Binance <span className={status === "live" ? "text-bull" : "text-bear"}>●</span>
          </div>
          <div className="tabular mt-1 text-muted-foreground">{ohlcText}</div>
          <div className="mt-1 text-muted-foreground">
            Volume <span className="text-foreground">{latestCandle ? formatVolume(latestCandle.volume) : "..."}</span>
          </div>
        </div>

        <button className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-3 bg-primary/30 rounded-r flex items-center justify-center">
          <ChevronRight className="h-3 w-3 text-primary" />
        </button>
      </div>

      <div className="flex items-center gap-3 px-3 h-10 border-t border-border text-xs text-muted-foreground">
        {["1d", "1w", "1m", "3m", "6m", "1y", "5y"].map((t) => (
          <button key={t} className={t === "1d" ? "text-foreground" : "hover:text-foreground"}>
            {t}
          </button>
        ))}
        <button className="ml-1 hover:text-foreground" aria-label="Date range">
          <CalendarDays className="h-3.5 w-3.5" />
        </button>
        <span className="ml-auto tabular">{utcTime || "--:--:--"} (UTC)</span>
        <button className="hover:text-foreground">%</button>
        <button className="hover:text-foreground">log</button>
        <button className="text-foreground">auto</button>
      </div>

      <div className="border-t border-border">
        <div className="grid grid-cols-4 text-sm">
          {["Positions (0)", "Trades", "Funding", "Order History"].map((t) => (
            <button
              key={t}
              onClick={() => setBottomTab(t)}
              className={`py-3 font-medium ${
                bottomTab === t ? "text-foreground border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <BottomPanel activeTab={bottomTab} stats={stats} />
      </div>
    </div>
  );
}

function Stat({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col shrink-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`text-xs tabular whitespace-nowrap ${valueClass}`}>{value}</span>
    </div>
  );
}

function BottomPanel({ activeTab, stats }: { activeTab: string; stats: BtcStats }) {
  if (activeTab === "Funding") {
    return (
      <div className="h-48 grid grid-cols-3 gap-px bg-border/50 text-sm">
        <FundingCell label="Funding Rate" value={formatPercent(stats.fundingRate)} tone={stats.fundingRate >= 0 ? "text-bull" : "text-bear"} />
        <FundingCell label="Next Funding" value={stats.nextFundingTime ? formatFundingTime(stats.nextFundingTime) : "..."} />
        <FundingCell label="Index Price" value={stats.index ? formatUsd(stats.index) : "..."} />
      </div>
    );
  }

  if (activeTab === "Trades") {
    return (
      <div className="h-48 grid grid-cols-4 text-sm">
        <BottomHeader label="Pair" value="BTCUSDT" />
        <BottomHeader label="Mark" value={stats.mark ? formatUsd(stats.mark) : "..."} />
        <BottomHeader label="24h Change" value={`${stats.changePercent >= 0 ? "+" : ""}${stats.changePercent.toFixed(2)}%`} tone={stats.changePercent >= 0 ? "text-bull" : "text-bear"} />
        <BottomHeader label="24h Volume" value={stats.volume ? formatUsd(stats.volume) : "..."} />
      </div>
    );
  }

  return (
    <div className="h-48 flex flex-col items-center justify-center gap-3">
      <div className="text-sm text-muted-foreground">No wallet detected</div>
      <button className="px-6 h-9 rounded-full bg-primary/15 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/25 transition-colors">
        Connect Wallet
      </button>
    </div>
  );
}

function FundingCell({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-background flex flex-col justify-center px-4">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`mt-2 text-lg tabular ${tone}`}>{value}</span>
    </div>
  );
}

function BottomHeader({ label, value, tone = "text-foreground" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col justify-center px-4 border-r border-border">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`mt-2 tabular ${tone}`}>{value}</span>
    </div>
  );
}

function toCandle(kline: BinanceKline): BtcCandle {
  return {
    time: Math.floor(kline[0] / 1000) as UTCTimestamp,
    open: Number(kline[1]),
    high: Number(kline[2]),
    low: Number(kline[3]),
    close: Number(kline[4]),
    volume: Number(kline[5]),
  };
}

function toLiveCandle(message: BinanceKlineMessage): BtcCandle {
  return {
    time: Math.floor(message.k.t / 1000) as UTCTimestamp,
    open: Number(message.k.o),
    high: Number(message.k.h),
    low: Number(message.k.l),
    close: Number(message.k.c),
    volume: Number(message.k.v),
  };
}

function toVolume(candle: BtcCandle): HistogramData<UTCTimestamp> {
  return {
    time: candle.time,
    value: candle.volume,
    color: candle.close >= candle.open ? "hsl(164 80% 54% / 0.42)" : "hsl(0 72% 71% / 0.42)",
  };
}

function upsertCandle(candles: BtcCandle[], candle: BtcCandle) {
  const next = candles.slice();
  const last = next[next.length - 1];

  if (!last || candle.time > last.time) {
    next.push(candle);
  } else if (candle.time === last.time) {
    next[next.length - 1] = candle;
  }

  return next.slice(-HISTORY_LIMIT);
}

function calculateSma(candles: BtcCandle[], period: number): LineData<UTCTimestamp>[] {
  const data: LineData<UTCTimestamp>[] = [];
  let rolling = 0;

  candles.forEach((candle, index) => {
    rolling += candle.close;
    if (index >= period) rolling -= candles[index - period].close;
    if (index >= period - 1) {
      data.push({ time: candle.time, value: rolling / period });
    }
  });

  return data;
}

function calculateEma(candles: BtcCandle[], period: number): LineData<UTCTimestamp>[] {
  if (candles.length < period) return [];

  const data: LineData<UTCTimestamp>[] = [];
  const multiplier = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((sum, candle) => sum + candle.close, 0) / period;

  data.push({ time: candles[period - 1].time, value: ema });

  for (let index = period; index < candles.length; index += 1) {
    ema = (candles[index].close - ema) * multiplier + ema;
    data.push({ time: candles[index].time, value: ema });
  }

  return data;
}

function calculateVwap(candles: BtcCandle[]): LineData<UTCTimestamp>[] {
  const data: LineData<UTCTimestamp>[] = [];
  let priceVolume = 0;
  let volume = 0;

  candles.forEach((candle) => {
    const typical = (candle.high + candle.low + candle.close) / 3;
    priceVolume += typical * candle.volume;
    volume += candle.volume;
    if (volume > 0) {
      data.push({ time: candle.time, value: priceVolume / volume });
    }
  });

  return data;
}

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Math.abs(value) >= 1000000 ? 0 : 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value >= 0 ? "+" : ""}${(value * 100).toFixed(4)}%`;
}

function formatFundingTime(value: number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function formatVolume(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}
