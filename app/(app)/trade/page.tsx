"use client";

import { PoolComparisonPanel } from "@/components/trade/PoolComparisonPanel";
import { SwapCardDex } from "@/components/trade/SwapCardDex";

export default function TradePage() {
  return (
    <div className="min-h-screen bg-transparent relative z-10">
      <main className="container mx-auto px-4 py-8 pt-28">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,520px)_minmax(320px,420px)] lg:items-start lg:justify-center">
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">Trade</h1>
              <p className="text-sm text-muted-foreground">Jaine on 0G</p>
            </div>
            <SwapCardDex />
          </section>
          <PoolComparisonPanel />
        </div>
      </main>
    </div>
  );
}
