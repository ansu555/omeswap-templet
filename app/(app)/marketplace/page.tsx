"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StrategyCard, type MarketplaceStrategyRow } from "@/components/marketplace/strategy-card";
import { IndicatorCard, type MarketplaceIndicatorRow } from "@/components/marketplace/indicator-card";

async function fetchStrategies(params: URLSearchParams) {
  const res = await fetch(`/api/marketplace/strategies?${params.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ strategies: MarketplaceStrategyRow[] }>;
}

async function fetchIndicators(params: URLSearchParams) {
  const res = await fetch(`/api/marketplace/indicators?${params.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{ indicators: MarketplaceIndicatorRow[] }>;
}

export default function MarketplacePage() {
  const [tab, setTab] = useState<"strategies" | "indicators">("strategies");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  const strategyParams = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    p.set("sort", sort);
    return p;
  }, [search, sort]);

  const indicatorParams = useMemo(() => {
    const p = new URLSearchParams();
    if (search) p.set("search", search);
    return p;
  }, [search]);

  const { data: stratData, isLoading: stratLoading, error: stratErr } =
    useQuery({
      queryKey: ["marketplace-strategies", strategyParams.toString()],
      queryFn: () => fetchStrategies(strategyParams),
    });

  const { data: indData, isLoading: indLoading, error: indErr } = useQuery({
    queryKey: ["marketplace-indicators", indicatorParams.toString()],
    queryFn: () => fetchIndicators(indicatorParams),
  });

  return (
    <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-100">
          Marketplace
        </h1>
        <p className="mt-2 text-zinc-400">
          Discover published strategies and reusable indicators from the
          community.
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md border-zinc-700 bg-zinc-900/50"
        />
        {tab === "strategies" && (
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[200px] border-zinc-700 bg-zinc-900/50">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="activated">Most activated</SelectItem>
              <SelectItem value="live_pnl">Live PnL</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="indicators">Indicators</TabsTrigger>
        </TabsList>
        <TabsContent value="strategies" className="mt-6">
          {stratLoading && (
            <p className="text-zinc-500 text-sm">Loading strategies…</p>
          )}
          {stratErr && (
            <p className="text-red-400 text-sm">
              {(stratErr as Error).message}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {(stratData?.strategies ?? []).map((s) => (
              <StrategyCard key={s.id} s={s} />
            ))}
          </div>
          {!stratLoading &&
            (stratData?.strategies?.length ?? 0) === 0 && (
              <p className="text-zinc-500 text-sm mt-4">
                No published strategies yet. Publish from the Agent builder.
              </p>
            )}
        </TabsContent>
        <TabsContent value="indicators" className="mt-6">
          {indLoading && (
            <p className="text-zinc-500 text-sm">Loading indicators…</p>
          )}
          {indErr && (
            <p className="text-red-400 text-sm">{(indErr as Error).message}</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {(indData?.indicators ?? []).map((i) => (
              <IndicatorCard key={i.id} i={i} />
            ))}
          </div>
          {!indLoading && (indData?.indicators?.length ?? 0) === 0 && (
            <p className="text-zinc-500 text-sm mt-4">
              No published indicators yet.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
