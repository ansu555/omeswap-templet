"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Newspaper, RefreshCw } from "lucide-react";
import { useTerminalStore } from "@/store/terminal";
import { cn } from "@/lib/utils";

type NewsItem = {
  title: string;
  url: string;
  source: string;
  sentiment?: "positive" | "negative" | "neutral";
  publishedAt?: string;
};

type Filter = "all" | "positive" | "negative";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

const SENTIMENT_STYLE: Record<string, string> = {
  positive: "bg-green-500/10 text-green-400 border border-green-500/20",
  negative: "bg-red-500/10 text-red-400 border border-red-500/20",
  neutral:  "bg-muted/40 text-muted-foreground border border-border",
};

export function NewsTile() {
  const activeSymbol = useTerminalStore((s) => s.activeSymbol);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const id = activeSymbol.coingeckoId;
    if (!id) {
      setItems([]);
      setError(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/token/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const news: NewsItem[] = data?.fundamental?.news ?? [];
        setItems(news);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load news");
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [activeSymbol.coingeckoId]);

  const filtered = filter === "all"
    ? items
    : items.filter((n) => (n.sentiment ?? "neutral") === filter);

  return (
    <div className="flex h-full w-full flex-col text-xs">
      {/* sub-header with filter tabs */}
      <div className="flex items-center justify-between border-b border-border px-3 py-[5px]">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
          {activeSymbol.symbol}
        </span>
        <div className="flex items-center gap-0">
          {(["all", "positive", "negative"] as Filter[]).map((f) => (
            <button
              key={f}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2 py-0.5 text-[10px] uppercase tracking-wide border-b-2 transition-colors",
                filter === f
                  ? f === "all"
                    ? "border-primary text-foreground"
                    : f === "positive"
                    ? "border-green-400 text-green-400"
                    : "border-red-400 text-red-400"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
            <RefreshCw size={12} className="animate-spin" />
            <span className="text-[11px]">Loading news…</span>
          </div>
        )}

        {!loading && error && (
          <div className="flex h-full items-center justify-center text-[11px] text-red-400/70">
            {error}
          </div>
        )}

        {!loading && !error && !activeSymbol.coingeckoId && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <Newspaper size={18} className="opacity-30" />
            <span className="text-[11px]">No CoinGecko ID for this token</span>
          </div>
        )}

        {!loading && !error && activeSymbol.coingeckoId && filtered.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-muted-foreground">
            <Newspaper size={18} className="opacity-30" />
            <span className="text-[11px]">No news available</span>
          </div>
        )}

        {!loading && filtered.map((item, i) => (
          <a
            key={i}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseDown={(e) => e.stopPropagation()}
            className="group flex flex-col gap-1 border-b border-border/40 px-3 py-2.5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="flex-1 text-[11px] leading-snug text-foreground/90 group-hover:text-foreground line-clamp-2">
                {item.title}
              </span>
              <ExternalLink size={10} className="mt-0.5 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              {item.sentiment && item.sentiment !== "neutral" && (
                <span className={cn("px-1.5 py-px text-[9px] font-semibold uppercase tracking-wider", SENTIMENT_STYLE[item.sentiment ?? "neutral"])}>
                  {item.sentiment}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground/60">{item.source}</span>
              {item.publishedAt && (
                <span className="ml-auto text-[10px] font-mono text-muted-foreground/40">
                  {timeAgo(item.publishedAt)}
                </span>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
