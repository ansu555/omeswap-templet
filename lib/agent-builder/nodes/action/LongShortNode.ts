import { BaseNode } from "../BaseNode";
import type {
  HandleDef,
  ConfigField,
  ExecutionContext,
} from "@/types/agent-builder-canvas";
import { useTransactionStore } from "@/store/transaction-store";

/**
 * LongShortNode — paper-trades a perp position.
 *
 * Until on-chain perp execution (e.g. GMX v2) is integrated, this node
 * records a clearly-labeled SIMULATED open into the local transaction
 * store. The terminal AgentTradesPanel surfaces these alongside live
 * Jaine swaps, prefixed with a "Sim" badge.
 *
 * Once a real perp adapter ships, swap the body of `execute()` for a real
 * router call — the upstream DAG and downstream UI don't need to change.
 */
export class LongShortNode extends BaseNode {
  readonly type = "long_short";
  readonly label = "Long / Short (Sim)";
  readonly description =
    "Open a simulated perp position. Records to the terminal trades panel — no on-chain transaction.";
  readonly icon = "TrendingUp";
  readonly category = "action" as const;
  readonly color = "border-amber-500";
  readonly bgColor = "bg-amber-950";

  readonly handles: HandleDef[] = [
    {
      id: "signal",
      label: "Execute",
      position: "left",
      type: "target",
      dataType: "signal",
    },
    {
      id: "simHash",
      label: "Sim Hash",
      position: "right",
      type: "source",
      dataType: "string",
    },
  ];

  readonly configSchema: ConfigField[] = [
    {
      key: "marketId",
      label: "Market",
      type: "select",
      options: ["gmx-btc-usd", "gmx-eth-usd", "gmx-avax-usd"],
      default: "gmx-btc-usd",
    },
    {
      key: "direction",
      label: "Direction",
      type: "select",
      options: ["long", "short"],
      default: "long",
    },
    {
      key: "sizeUsd",
      label: "Notional Size (USD)",
      type: "number",
      default: 100,
    },
    {
      key: "leverage",
      label: "Leverage (x)",
      type: "number",
      default: 5,
    },
    {
      key: "entryPrice",
      label: "Entry Price (override)",
      type: "number",
      default: 0,
    },
  ];

  async execute(
    inputs: Record<string, unknown>,
    context: ExecutionContext,
  ): Promise<Record<string, unknown>> {
    if (!inputs.signal) return { simHash: null };

    const marketId = (this.config.marketId as string) || "gmx-btc-usd";
    const direction = (this.config.direction as "long" | "short") || "long";
    const sizeUsd = Number(this.config.sizeUsd ?? 100);
    const leverage = Number(this.config.leverage ?? 5);
    const overrideEntry = Number(this.config.entryPrice ?? 0);

    // Resolve a reasonable entry price: explicit override → latest candle close
    // → 0. Real perp execution would fetch this from the perp DEX router.
    const candle = context.backtestCandle;
    const entryPrice =
      overrideEntry > 0
        ? overrideEntry
        : candle?.close && candle.close > 0
          ? candle.close
          : 0;

    const simHash = `sim:${cryptoRandomId()}`;
    const wallet = context.walletAddress ?? "0xagent";

    context.addLog(
      `[Long/Short SIM] ${direction.toUpperCase()} ${marketId} ${sizeUsd} USD x${leverage} @ ${entryPrice.toFixed(4)}`,
    );

    if (typeof window !== "undefined") {
      try {
        useTransactionStore.getState().addTransaction({
          type: "PERP_OPEN",
          fromToken: "USD",
          toToken: marketId.toUpperCase().replace("GMX-", "").replace("-USD", ""),
          fromAmount: sizeUsd,
          toAmount: entryPrice > 0 ? sizeUsd / entryPrice : 0,
          txHash: simHash,
          walletAddress: wallet,
          timestamp: Date.now(),
          source: "agent-perp-sim",
          dex: "GMX (sim)",
          direction,
          marketId,
          entryPrice,
          leverage,
          simulated: true,
        });
      } catch {
        /* non-critical */
      }
    }

    context.addChartMarker?.({
      time: Math.floor(Date.now() / 1000),
      label: `${direction === "long" ? "LONG" : "SHORT"} ${sizeUsd}`,
      color: direction === "long" ? "#22c55e" : "#ef4444",
      shape: direction === "long" ? "arrowUp" : "arrowDown",
    });

    return {
      simHash,
      direction,
      sizeUsd,
      entryPrice,
      leverage,
      simulated: true,
    };
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
