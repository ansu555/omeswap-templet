"use client";

import { AddLiquidityCard } from "@/components/trade/AddLiquidityCard";
import { PoolComparisonPanel } from "@/components/trade/PoolComparisonPanel";

export default function LiquidityPage() {
  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <main className="container mx-auto px-4 py-8 pt-28">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_minmax(320px,420px)] lg:items-start lg:justify-center">
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">Add Liquidity</h1>
              <p className="text-sm text-muted-foreground">Provide liquidity to Omega pools on 0G</p>
            </div>
            <AddLiquidityCard />
          </section>
          <PoolComparisonPanel />
        </div>
      </main>
    </div>
  );
}
