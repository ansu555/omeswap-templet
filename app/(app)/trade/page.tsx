"use client";

import { useState } from "react";
import { SwapCardDex } from "@/components/trade/SwapCardDex";
import { UniswapSwapCard } from "@/components/trade/UniswapSwapCard";
import { PoolLiquidity } from "@/components/trade/PoolLiquidity";
import { SwapHistory } from "@/components/trade/SwapHistory";
import { ToggleSection } from "@/components/trade/ToggleSection";
import { ethereumConfig } from "@/lib/chain-registry/chains/ethereum";

const MOCK_HISTORY: any[] = [];

const ETH_WETH = ethereumConfig.tokens.WETH;
const ETH_USDC = ethereumConfig.tokens.USDC;

type Chain = "0g" | "eth";

export default function Index() {
    const [showChart, setShowChart] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [chain, setChain] = useState<Chain>("0g");

    return (
        <div className="min-h-screen bg-transparent relative z-10">
            <main className="container mx-auto px-4 py-8 pt-32">
                <div className="flex flex-col lg:flex-row gap-6 justify-center">
                    {/* Left Column - Pool Liquidity (only when chart toggled) */}
                    <div className="hidden lg:block lg:flex-1 lg:max-w-md">
                        {showChart && (
                            <div className="animate-fade-in">
                                <PoolLiquidity />
                            </div>
                        )}
                    </div>

                    {/* Center Column - Swap Card */}
                    <div className="flex flex-col items-center gap-6 lg:w-[420px] flex-shrink-0">
                        {/* Network selector */}
                        <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-full">
                            {(["0g", "eth"] as Chain[]).map((c) => (
                                <button
                                    key={c}
                                    onClick={() => setChain(c)}
                                    className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors ${
                                        chain === c
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    {c === "0g" ? "0G Network" : "Ethereum"}
                                </button>
                            ))}
                        </div>

                        {chain === "0g" ? (
                            <SwapCardDex />
                        ) : (
                            <UniswapSwapCard
                                tokenIn={ETH_WETH}
                                tokenOut={ETH_USDC}
                                marketId="eth-weth-usdc"
                            />
                        )}

                        {/* Toggle Buttons */}
                        <div className="flex items-center gap-3">
                            <ToggleSection
                                label="Chart"
                                isVisible={showChart}
                                onToggle={() => setShowChart(!showChart)}
                            />
                            <ToggleSection
                                label="History"
                                isVisible={showHistory}
                                onToggle={() => setShowHistory(!showHistory)}
                            />
                        </div>
                    </div>

                    {/* Right Column - Spacer for balance */}
                    <div className="hidden lg:block lg:flex-1 lg:max-w-md" />
                </div>

                {showHistory && (
                    <div className="mt-8 animate-fade-in">
                        <SwapHistory records={MOCK_HISTORY} onRefresh={() => { }} />
                    </div>
                )}
            </main>
        </div>
    );
}
