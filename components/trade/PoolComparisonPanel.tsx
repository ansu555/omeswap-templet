"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Droplets, ExternalLink, Layers } from "lucide-react";
import { useReadContract } from "wagmi";
import { Address, formatUnits } from "viem";
import { MultiTokenLiquidityPoolsABI } from "@/contracts/abis";
import { CONTRACT_ADDRESSES, TOKENS } from "@/contracts/config";
import { getDefaultChainId, getExplorerLink } from "@/lib/chain-registry";
import { DEFAULT_DEX_MARKET_ID } from "@/lib/dex/markets";
import type { DexMarket } from "@/lib/dex/types";

type MarketResponse = {
  market?: DexMarket;
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const REFRESH_MS = 30_000;

function formatUsd(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function shortAddress(value: string) {
  if (!value || value.length < 10) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function zeroGExplorerBase(chainId: number | null | undefined) {
  if (chainId === 16661) return "https://chainscan.0g.ai";
  if (chainId === 16602) return "https://chainscan-galileo.0g.ai";
  return null;
}

export function PoolComparisonPanel() {
  const [jaineMarket, setJaineMarket] = useState<DexMarket | null>(null);
  const [isLoadingMarket, setIsLoadingMarket] = useState(true);
  const [marketError, setMarketError] = useState<string | null>(null);

  const poolsAddress = CONTRACT_ADDRESSES.POOLS as Address;
  const isOmeSwapConfigured = poolsAddress.toLowerCase() !== ZERO_ADDRESS;
  const usdcAddress = TOKENS.USDC.address as Address;
  const w0gAddress = TOKENS.W0G.address as Address;

  const [token0Address, token1Address] = useMemo(() => {
    return usdcAddress.toLowerCase() < w0gAddress.toLowerCase()
      ? [usdcAddress, w0gAddress]
      : [w0gAddress, usdcAddress];
  }, [usdcAddress, w0gAddress]);

  const token0 =
    token0Address.toLowerCase() === usdcAddress.toLowerCase() ? TOKENS.USDC : TOKENS.W0G;
  const token1 = token0.symbol === TOKENS.USDC.symbol ? TOKENS.W0G : TOKENS.USDC;

  const { data: poolId } = useReadContract({
    address: poolsAddress,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolId",
    args: [token0Address, token1Address],
    chainId: getDefaultChainId(),
    query: {
      enabled: isOmeSwapConfigured,
    },
  });

  const { data: poolInfo } = useReadContract({
    address: poolsAddress,
    abi: MultiTokenLiquidityPoolsABI,
    functionName: "getPoolInfo",
    args: [poolId as bigint],
    chainId: getDefaultChainId(),
    query: {
      enabled: isOmeSwapConfigured && poolId != null,
    },
  });

  useEffect(() => {
    let disposed = false;
    const aborter = new AbortController();

    async function loadMarket() {
      try {
        const response = await fetch(
          `/api/dex/markets?id=${encodeURIComponent(DEFAULT_DEX_MARKET_ID)}`,
          { signal: aborter.signal },
        );
        if (!response.ok) throw new Error("Unable to load Jaine market");

        const payload = (await response.json()) as MarketResponse;
        if (!disposed) {
          setJaineMarket(payload.market ?? null);
          setMarketError(null);
        }
      } catch {
        if (!disposed && !aborter.signal.aborted) {
          setMarketError("Jaine market feed is temporarily unavailable.");
        }
      } finally {
        if (!disposed) setIsLoadingMarket(false);
      }
    }

    loadMarket();
    const timer = window.setInterval(loadMarket, REFRESH_MS);

    return () => {
      disposed = true;
      aborter.abort();
      window.clearInterval(timer);
    };
  }, []);

  const poolTuple = poolInfo as readonly [Address, Address, bigint, bigint, bigint] | undefined;
  const reserve0 = Number.parseFloat(formatUnits(poolTuple?.[2] ?? 0n, token0.decimals));
  const reserve1 = Number.parseFloat(formatUnits(poolTuple?.[3] ?? 0n, token1.decimals));
  const totalSupply = Number.parseFloat(formatUnits(poolTuple?.[4] ?? 0n, 18));
  const zeroGPoolExplorer =
    jaineMarket && zeroGExplorerBase(jaineMarket.chainId)
      ? `${zeroGExplorerBase(jaineMarket.chainId)}/address/${jaineMarket.poolAddress}`
      : null;

  return (
    <div className="glass-card rounded-2xl border border-border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pool Details</h3>
          <p className="text-sm text-muted-foreground">Jaine Hub vs OmeSwap</p>
        </div>
        <span className="text-[11px] px-2 py-1 rounded-full border border-primary/30 text-primary">
          0G
        </span>
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/25 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Activity className="w-4 h-4 text-primary" />
          <span>Jaine Pool Snapshot</span>
        </div>

        {isLoadingMarket && !jaineMarket ? (
          <p className="text-sm text-muted-foreground">Loading Jaine pool data...</p>
        ) : jaineMarket ? (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pair</span>
              <span className="font-medium">{jaineMarket.pairLabel}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">{formatUsd(jaineMarket.priceUsd)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Liquidity</span>
              <span className="font-medium">{formatUsd(jaineMarket.liquidityUsd)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">24h Volume</span>
              <span className="font-medium">{formatUsd(jaineMarket.volume24hUsd)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">24h Trades</span>
              <span className="font-medium">{jaineMarket.transactions24h.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Execution Venue</span>
              <span className="font-medium">{jaineMarket.executionVenue}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pool</span>
              {zeroGPoolExplorer ? (
                <a
                  href={zeroGPoolExplorer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  {shortAddress(jaineMarket.poolAddress)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <span className="font-mono">{shortAddress(jaineMarket.poolAddress)}</span>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">{marketError ?? "No Jaine pool data yet."}</p>
        )}
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/25 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Droplets className="w-4 h-4 text-primary" />
          <span>Your OmeSwap Pool</span>
        </div>

        {!isOmeSwapConfigured ? (
          <p className="text-sm text-muted-foreground">
            OmeSwap pool contract is not deployed on this network yet.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pair</span>
              <span className="font-medium">
                {token0.symbol}/{token1.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pool ID</span>
              <span className="font-mono">{poolId != null ? poolId.toString() : "-"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reserve ({token0.symbol})</span>
              <span className="font-medium">{reserve0.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Reserve ({token1.symbol})</span>
              <span className="font-medium">{reserve1.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">LP Supply</span>
              <span className="font-medium">{totalSupply.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pools Contract</span>
              <a
                href={getExplorerLink(getDefaultChainId(), "address", poolsAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary hover:underline"
              >
                <span className="font-mono">{shortAddress(poolsAddress)}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Layers className="w-3.5 h-3.5" />
        <span>Refreshes every {REFRESH_MS / 1000}s while chart panel is open.</span>
      </div>
    </div>
  );
}
