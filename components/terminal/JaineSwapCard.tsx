"use client";

import { ArrowUpDown, Loader2, CheckCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";
import { useJaineSwap, JAINE_TOKENS, type JaineToken } from "@/hooks/use-jaine-swap";

// ── Token selector ────────────────────────────────────────────────────────────

function TokenSelector({
  selected,
  available,
  onChange,
}: {
  selected: JaineToken;
  available: JaineToken[];
  onChange: (token: JaineToken) => void;
}) {
  return (
    <select
      value={selected.symbol}
      onChange={(e) => {
        const t = available.find((t) => t.symbol === e.target.value) ?? available[0];
        onChange(t);
      }}
      className="bg-transparent text-sm font-semibold text-foreground outline-none cursor-pointer max-w-[90px]"
    >
      {available.map((t) => (
        <option key={t.symbol} value={t.symbol} className="bg-background">
          {t.symbol}
        </option>
      ))}
    </select>
  );
}

// ── Slippage preset button ────────────────────────────────────────────────────

function SlippageButton({
  bps,
  active,
  onClick,
}: {
  bps: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] px-1.5 py-0.5 rounded-md transition-colors border ${
        active
          ? "bg-primary/20 text-primary border-primary/30"
          : "bg-panel text-muted-foreground border-border hover:border-border/70 hover:text-foreground"
      }`}
    >
      {(bps / 100).toFixed(2)}%
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

/**
 * JaineSwapCard — on-chain token swap widget via Jaine DEX on 0G Mainnet.
 *
 * Supports: 0G (native), W0G, USDC.e — any pair via the UniswapV2 router.
 * Renders a disabled state with a clear env-var hint when the router address
 * is not yet configured (NEXT_PUBLIC_JAINE_ROUTER_ADDRESS).
 */
export function JaineSwapCard() {
  const { address } = useAccount();

  const {
    tokenIn,
    tokenOut,
    setTokenIn,
    setTokenOut,
    swapTokens,
    amountIn,
    setAmountIn,
    quote,
    quoteLoading,
    quoteError,
    slippageBps,
    setSlippageBps,
    balance,
    needsApproval,
    routerConfigured,
    approve,
    executeSwap,
    isApproving,
    isSwapping,
    isSuccess,
    txHash,
    error,
  } = useJaineSwap();

  const isLoading = isApproving || isSwapping;

  // Never let the same token appear on both sides
  const availableIn = JAINE_TOKENS.filter((t) => t.symbol !== tokenOut.symbol);
  const availableOut = JAINE_TOKENS.filter((t) => t.symbol !== tokenIn.symbol);

  const canSwap =
    routerConfigured &&
    !!address &&
    !!amountIn &&
    parseFloat(amountIn) > 0 &&
    !!quote;

  const parsedQuote = quote ? parseFloat(quote) : 0;
  const parsedAmountIn = amountIn ? parseFloat(amountIn) : 0;
  const minReceived =
    parsedQuote > 0
      ? ((parsedQuote * (10000 - slippageBps)) / 10000).toFixed(6)
      : null;
  const rate =
    parsedQuote > 0 && parsedAmountIn > 0
      ? (parsedQuote / parsedAmountIn).toFixed(6)
      : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header badge */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-primary/5 shrink-0">
        <span className="text-[10px] font-semibold text-primary tracking-widest uppercase">
          Swap via Jaine · 0G Mainnet
        </span>
        {!routerConfigured && (
          <span className="text-[9px] text-amber-400 flex items-center gap-1">
            <AlertTriangle size={9} />
            Preview only
          </span>
        )}
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Router not configured warning */}
        {!routerConfigured && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
            <p className="text-[11px] text-amber-400 font-medium flex items-center gap-1.5">
              <AlertTriangle size={11} /> Jaine router not configured
            </p>
            <p className="text-[9px] text-muted-foreground font-mono leading-relaxed">
              Set <span className="text-foreground/70">NEXT_PUBLIC_JAINE_ROUTER_ADDRESS</span> in .env to enable on-chain swaps.
            </p>
          </div>
        )}

        {/* Token In */}
        <div className="rounded-lg border border-border bg-panel p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">You pay</span>
            {address && (
              <button
                className="text-[9px] text-muted-foreground hover:text-foreground transition-colors tabular"
                onClick={() => setAmountIn(balance)}
              >
                Balance: {parseFloat(balance).toFixed(4)}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
              className="flex-1 min-w-0 bg-transparent outline-none text-xl font-medium text-foreground placeholder:text-muted-foreground/30 tabular"
            />
            <TokenSelector
              selected={tokenIn}
              available={availableIn}
              onChange={(t) => {
                setTokenIn(t);
                setAmountIn("");
              }}
            />
          </div>
        </div>

        {/* Flip direction button */}
        <div className="flex items-center justify-center">
          <button
            onClick={swapTokens}
            className="h-7 w-7 rounded-full border border-border bg-panel flex items-center justify-center hover:border-primary/50 hover:bg-primary/10 transition-all group"
          >
            <ArrowUpDown
              size={12}
              className="text-muted-foreground group-hover:text-primary transition-colors"
            />
          </button>
        </div>

        {/* Token Out */}
        <div className="rounded-lg border border-border bg-panel p-3 space-y-2">
          <span className="text-[10px] text-muted-foreground">You receive</span>
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              {quoteLoading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Fetching quote…</span>
                </div>
              ) : (
                <span
                  className={`text-xl font-medium tabular ${
                    parsedQuote > 0 ? "text-foreground" : "text-muted-foreground/30"
                  }`}
                >
                  {parsedQuote > 0 ? parsedQuote.toFixed(6) : "0.00"}
                </span>
              )}
            </div>
            <TokenSelector
              selected={tokenOut}
              available={availableOut}
              onChange={setTokenOut}
            />
          </div>
          {quoteError && (
            <p className="text-[10px] text-amber-400">{quoteError}</p>
          )}
        </div>

        {/* Slippage */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Max slippage</span>
          <div className="flex items-center gap-1.5">
            {[25, 50, 100, 200].map((bps) => (
              <SlippageButton
                key={bps}
                bps={bps}
                active={slippageBps === bps}
                onClick={() => setSlippageBps(bps)}
              />
            ))}
          </div>
        </div>

        {/* Rate + min received */}
        {rate && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Rate</span>
              <span className="tabular font-mono">
                1 {tokenIn.symbol} ≈ {rate} {tokenOut.symbol}
              </span>
            </div>
            {minReceived && (
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Min received ({(slippageBps / 100).toFixed(2)}% slip)</span>
                <span className="tabular font-mono">
                  {minReceived} {tokenOut.symbol}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Success banner */}
        {isSuccess && txHash && (
          <div className="rounded-lg border border-bull/20 bg-bull/5 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={12} className="text-bull" />
              <span className="text-[10px] text-bull font-medium">Swap confirmed</span>
            </div>
            <a
              href={`https://chainscan.0g.ai/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
            >
              View <ExternalLink size={8} />
            </a>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-[10px] text-bear bg-bear/5 rounded-lg border border-bear/20 px-2.5 py-2">
            {error.length > 120 ? error.slice(0, 120) + "…" : error}
          </p>
        )}
      </div>

      {/* Footer — action button */}
      <div className="p-4 border-t border-border space-y-2 shrink-0">
        {!address ? (
          <p className="text-center text-xs text-muted-foreground py-1">
            Connect your wallet to swap
          </p>
        ) : !routerConfigured ? (
          <button
            disabled
            className="w-full h-11 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-sm font-medium cursor-not-allowed"
          >
            Jaine router not configured
          </button>
        ) : needsApproval ? (
          <button
            onClick={approve}
            disabled={isLoading || !amountIn || parseFloat(amountIn) <= 0}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-opacity shadow-[0_0_30px_-6px_hsl(var(--primary)/0.6)]"
          >
            {isApproving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Approving {tokenIn.symbol}…
              </>
            ) : (
              `Approve ${tokenIn.symbol}`
            )}
          </button>
        ) : (
          <button
            onClick={executeSwap}
            disabled={isLoading || !canSwap}
            className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 transition-opacity shadow-[0_0_30px_-6px_hsl(var(--primary)/0.6)]"
          >
            {isSwapping ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Swapping…
              </>
            ) : (
              `Swap ${tokenIn.symbol} → ${tokenOut.symbol}`
            )}
          </button>
        )}

        <div className="flex items-center justify-center gap-1.5">
          <span className="text-[9px] text-muted-foreground/50">Powered by</span>
          <a
            href="https://jaine.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[9px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
          >
            Jaine <ExternalLink size={7} />
          </a>
          <span className="text-[9px] text-muted-foreground/50">· 0G Mainnet</span>
        </div>
      </div>
    </div>
  );
}
