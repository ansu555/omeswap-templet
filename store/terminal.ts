"use client";

import { create } from "zustand";
import type { Address } from "viem";
import { avalancheConfig } from "@/lib/chain-registry/chains/avalanche";

export type ActiveSymbol = {
  chain: "avalanche";
  address: Address;
  symbol: string;
  name: string;
  coingeckoId?: string;
  binancePair?: string;
  poolAddress?: Address;
};

export type WatchlistEntry = {
  address: Address;
  symbol: string;
  name: string;
  coingeckoId?: string;
};

export type TileId =
  | "chart"
  | "watchlist"
  | "trades"
  | "depth"
  | "info"
  | "order"
  | "copilot";

export type TileLayoutItem = {
  i: TileId;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

// Maps Avalanche tokens to a Binance USDT pair when one exists.
// Tokens without a Binance pair fall back to CoinGecko historical + on-chain mid.
const BINANCE_PAIR_MAP: Record<string, string> = {
  WAVAX: "AVAXUSDT",
  "WETH.e": "ETHUSDT",
  "WBTC.e": "BTCUSDT",
  "LINK.e": "LINKUSDT",
  JOE: "JOEUSDT",
  "AAVE.e": "AAVEUSDT",
};

function tokenToWatchlistEntry(symbol: string): WatchlistEntry | null {
  const t = avalancheConfig.tokens[symbol];
  if (!t) return null;
  return {
    address: t.address,
    symbol: t.symbol,
    name: t.name,
    coingeckoId: t.coingeckoId,
  };
}

const DEFAULT_WATCHLIST: WatchlistEntry[] = [
  "WAVAX",
  "WETH.e",
  "WBTC.e",
  "JOE",
  "LINK.e",
  "USDC",
]
  .map(tokenToWatchlistEntry)
  .filter((e): e is WatchlistEntry => e !== null);

function entryToActiveSymbol(e: WatchlistEntry): ActiveSymbol {
  return {
    chain: "avalanche",
    address: e.address,
    symbol: e.symbol,
    name: e.name,
    coingeckoId: e.coingeckoId,
    binancePair: BINANCE_PAIR_MAP[e.symbol],
  };
}

export const DEFAULT_LAYOUT: TileLayoutItem[] = [
  { i: "watchlist", x: 0, y: 0, w: 2, h: 14, minW: 2, minH: 6 },
  { i: "chart", x: 2, y: 0, w: 7, h: 10, minW: 5, minH: 7 },
  { i: "trades", x: 9, y: 0, w: 3, h: 10, minW: 3, minH: 6 },
  { i: "order", x: 9, y: 10, w: 3, h: 7, minW: 3, minH: 6 },
  { i: "depth", x: 2, y: 10, w: 4, h: 7, minW: 3, minH: 5 },
  { i: "info", x: 6, y: 10, w: 3, h: 7, minW: 3, minH: 4 },
  { i: "copilot", x: 0, y: 17, w: 12, h: 4, minW: 6, minH: 3 },
];

type TerminalState = {
  activeSymbol: ActiveSymbol;
  watchlist: WatchlistEntry[];
  layout: TileLayoutItem[];
  mountedTiles: Set<TileId>;
  setActiveSymbol: (entry: WatchlistEntry) => void;
  addToWatchlist: (entry: WatchlistEntry) => void;
  removeFromWatchlist: (address: Address) => void;
  setLayout: (layout: TileLayoutItem[]) => void;
  resetLayout: () => void;
  mountTile: (id: TileId) => void;
  unmountTile: (id: TileId) => void;
};

const DEFAULT_ACTIVE = entryToActiveSymbol(DEFAULT_WATCHLIST[0]);

export const useTerminalStore = create<TerminalState>((set, get) => ({
  activeSymbol: DEFAULT_ACTIVE,
  watchlist: DEFAULT_WATCHLIST,
  layout: DEFAULT_LAYOUT,
  mountedTiles: new Set(DEFAULT_LAYOUT.map((l) => l.i)),

  setActiveSymbol: (entry) => set({ activeSymbol: entryToActiveSymbol(entry) }),

  addToWatchlist: (entry) =>
    set((s) =>
      s.watchlist.some((w) => w.address === entry.address)
        ? s
        : { watchlist: [...s.watchlist, entry] },
    ),

  removeFromWatchlist: (address) =>
    set((s) => ({ watchlist: s.watchlist.filter((w) => w.address !== address) })),

  setLayout: (layout) => set({ layout }),

  resetLayout: () =>
    set({
      layout: DEFAULT_LAYOUT,
      mountedTiles: new Set(DEFAULT_LAYOUT.map((l) => l.i)),
    }),

  mountTile: (id) => {
    const s = get();
    if (s.mountedTiles.has(id)) return;
    const next = new Set(s.mountedTiles);
    next.add(id);
    const fallback = DEFAULT_LAYOUT.find((l) => l.i === id);
    const newItem: TileLayoutItem = fallback
      ? { ...fallback, x: 0, y: Infinity }
      : { i: id, x: 0, y: Infinity, w: 4, h: 6, minW: 2, minH: 3 };
    set({ mountedTiles: next, layout: [...s.layout, newItem] });
  },

  unmountTile: (id) => {
    const s = get();
    if (!s.mountedTiles.has(id)) return;
    const next = new Set(s.mountedTiles);
    next.delete(id);
    set({
      mountedTiles: next,
      layout: s.layout.filter((l) => l.i !== id),
    });
  },
}));

export const ALL_TILE_IDS: TileId[] = [
  "chart",
  "watchlist",
  "trades",
  "depth",
  "info",
  "order",
  "copilot",
];

export const TILE_LABELS: Record<TileId, string> = {
  chart: "Chart",
  watchlist: "Watchlist",
  trades: "Trades",
  depth: "Pool Depth",
  info: "Token Info",
  order: "Order Panel",
  copilot: "Agent Co-pilot",
};
