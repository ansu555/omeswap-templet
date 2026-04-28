"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/store/agent-builder";
import { useWallet } from "@/hooks/use-wallet";
import { normalizeWalletAddress } from "@/lib/onboarding";
import type { StrategyDraftPayload } from "@/lib/marketplace/validate-strategy";
import type { IndicatorDraftPayload } from "@/lib/marketplace/validate-strategy";

const STRAT_KEY = "omeswap_draft_strategy_id";
const IND_KEY = "omeswap_draft_indicator_id";

type Props = {
  open: boolean;
  onClose: () => void;
  mode: "strategy" | "indicator";
};

export function PublishModal({ open, onClose, mode }: Props) {
  const { address } = useWallet();
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);
  const nodeInstances = useStore((s) => s.nodeInstances);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [assetPairs, setAssetPairs] = useState("WAVAX/USDC");
  const [regimeGates, setRegimeGates] = useState("sideways,bull");
  const [stopLoss, setStopLoss] = useState("0.8");
  const [maxPositionPct, setMaxPositionPct] = useState("2");
  const [maxTradesPerDay, setMaxTradesPerDay] = useState("3");
  const [maxDailyLossPct, setMaxDailyLossPct] = useState("3");
  const [slippageBps, setSlippageBps] = useState("75");
  const [outputNodeId, setOutputNodeId] = useState("");
  const [outputHandle, setOutputHandle] = useState("price");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const wallet = address ? normalizeWalletAddress(address) : null;

  const buildConfigs = useCallback(() => {
    const configs: Record<string, Record<string, unknown>> = {};
    nodeInstances.forEach((inst, id) => {
      configs[id] = { ...inst.config };
    });
    return configs;
  }, [nodeInstances]);

  const strategyDraftPayload = useCallback((): StrategyDraftPayload => {
    const pairs = assetPairs
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const gates = regimeGates
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return {
      nodes: nodes as StrategyDraftPayload["nodes"],
      edges: edges as StrategyDraftPayload["edges"],
      configs: buildConfigs(),
      assetPairs: pairs,
      regimeGates: gates,
      risk: {
        stopLossPercent: parseFloat(stopLoss) || 0,
        maxPositionPct: parseFloat(maxPositionPct) || 2,
        maxTradesPerDay: parseInt(maxTradesPerDay, 10) || 3,
        maxDailyLossPct: parseFloat(maxDailyLossPct) || 3,
        slippageBps: parseInt(slippageBps, 10) || 75,
      },
    };
  }, [
    nodes,
    edges,
    buildConfigs,
    assetPairs,
    regimeGates,
    stopLoss,
    maxPositionPct,
    maxTradesPerDay,
    maxDailyLossPct,
    slippageBps,
  ]);

  const indicatorDraftPayload = useCallback((): IndicatorDraftPayload => ({
    nodes: nodes as IndicatorDraftPayload["nodes"],
    edges: edges as IndicatorDraftPayload["edges"],
    configs: buildConfigs(),
    outputNodeId: outputNodeId.trim(),
    outputHandle: outputHandle.trim() || "out",
    inputSchema: [],
  }), [nodes, edges, buildConfigs, outputNodeId, outputHandle]);

  useEffect(() => {
    if (!open) return;
    setMsg(null);
  }, [open]);

  async function ensureStrategyId(): Promise<string | null> {
    if (typeof window === "undefined" || !wallet) return null;
    let sid = sessionStorage.getItem(STRAT_KEY);
    if (sid) return sid;
    if (!name.trim()) {
      setMsg("Enter a strategy name to create a draft");
      return null;
    }
    const res = await fetch("/api/creator/strategies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": wallet,
      },
      body: JSON.stringify({ name: name.trim(), description }),
    });
    if (!res.ok) {
      setMsg(await res.text());
      return null;
    }
    const { id } = (await res.json()) as { id: string };
    sessionStorage.setItem(STRAT_KEY, id);
    return id;
  }

  async function ensureIndicatorId(): Promise<string | null> {
    if (typeof window === "undefined" || !wallet) return null;
    let iid = sessionStorage.getItem(IND_KEY);
    if (iid) return iid;
    if (!name.trim()) {
      setMsg("Enter an indicator name");
      return null;
    }
    const res = await fetch("/api/creator/indicators", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": wallet,
      },
      body: JSON.stringify({ name: name.trim(), description }),
    });
    if (!res.ok) {
      setMsg(await res.text());
      return null;
    }
    const { id } = (await res.json()) as { id: string };
    sessionStorage.setItem(IND_KEY, id);
    return id;
  }

  async function saveDraftStrategy() {
    if (!wallet) {
      setMsg("Connect wallet");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const sid = await ensureStrategyId();
      if (!sid) return;
      const pairs = assetPairs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const gates = regimeGates
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const draft_payload = strategyDraftPayload();
      const res = await fetch(`/api/creator/strategies/${sid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          description,
          asset_pairs: pairs,
          regime_gates: gates,
          draft_payload,
        }),
      });
      if (!res.ok) setMsg(await res.text());
      else setMsg("Draft saved");
    } finally {
      setBusy(false);
    }
  }

  async function publishStrategy() {
    if (!wallet) {
      setMsg("Connect wallet");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const sid = await ensureStrategyId();
      if (!sid) return;
      const pairs = assetPairs
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const gates = regimeGates
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const draft_payload = strategyDraftPayload();
      const patchRes = await fetch(`/api/creator/strategies/${sid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({
          name: name.trim() || undefined,
          description,
          asset_pairs: pairs,
          regime_gates: gates,
          draft_payload,
        }),
      });
      if (!patchRes.ok) {
        setMsg(await patchRes.text());
        return;
      }
      const res = await fetch(`/api/creator/strategies/${sid}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({ draft_payload }),
      });
      if (!res.ok) {
        const j = await res.json().catch(async () => ({ error: await res.text() }));
        setMsg(typeof j.error === "string" ? j.error : JSON.stringify(j));
        return;
      }
      setMsg("Published — view on Marketplace");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraftIndicator() {
    if (!wallet) {
      setMsg("Connect wallet");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      let iid = sessionStorage.getItem(IND_KEY);
      if (!iid) {
        if (!name.trim()) {
          setMsg("Enter name");
          setBusy(false);
          return;
        }
        const cr = await fetch("/api/creator/indicators", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": wallet,
          },
          body: JSON.stringify({ name: name.trim(), description }),
        });
        if (!cr.ok) {
          setMsg(await cr.text());
          return;
        }
        const { id } = (await cr.json()) as { id: string };
        sessionStorage.setItem(IND_KEY, id);
        iid = id;
      }
      const draft_payload = indicatorDraftPayload();
      const res = await fetch(`/api/creator/indicators/${iid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({ name: name.trim() || undefined, description, draft_payload }),
      });
      if (!res.ok) setMsg(await res.text());
      else setMsg("Indicator draft saved");
    } finally {
      setBusy(false);
    }
  }

  async function publishIndicator() {
    if (!wallet) {
      setMsg("Connect wallet");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const iid = await ensureIndicatorId();
      if (!iid) return;
      await fetch(`/api/creator/indicators/${iid}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({
          draft_payload: indicatorDraftPayload(),
        }),
      });
      const res = await fetch(`/api/creator/indicators/${iid}/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({ draft_payload: indicatorDraftPayload() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(async () => ({ error: await res.text() }));
        setMsg(typeof j.error === "string" ? j.error : JSON.stringify(j));
        return;
      }
      setMsg("Indicator published");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg border-zinc-700 bg-zinc-950 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "strategy" ? "Publish strategy" : "Publish indicator"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-zinc-700 bg-zinc-900"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border-zinc-700 bg-zinc-900"
            />
          </div>

          {mode === "strategy" && (
            <>
              <div>
                <Label>Asset pairs (comma)</Label>
                <Input
                  value={assetPairs}
                  onChange={(e) => setAssetPairs(e.target.value)}
                  className="border-zinc-700 bg-zinc-900"
                />
              </div>
              <div>
                <Label>Regime gates (comma)</Label>
                <Input
                  value={regimeGates}
                  onChange={(e) => setRegimeGates(e.target.value)}
                  className="border-zinc-700 bg-zinc-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Stop-loss %</Label>
                  <Input
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="border-zinc-700 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label>Max position %</Label>
                  <Input
                    value={maxPositionPct}
                    onChange={(e) => setMaxPositionPct(e.target.value)}
                    className="border-zinc-700 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label>Max trades / day</Label>
                  <Input
                    value={maxTradesPerDay}
                    onChange={(e) => setMaxTradesPerDay(e.target.value)}
                    className="border-zinc-700 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label>Max daily loss %</Label>
                  <Input
                    value={maxDailyLossPct}
                    onChange={(e) => setMaxDailyLossPct(e.target.value)}
                    className="border-zinc-700 bg-zinc-900"
                  />
                </div>
                <div>
                  <Label>Slippage (bps)</Label>
                  <Input
                    value={slippageBps}
                    onChange={(e) => setSlippageBps(e.target.value)}
                    className="border-zinc-700 bg-zinc-900"
                  />
                </div>
              </div>
            </>
          )}

          {mode === "indicator" && (
            <>
              <div>
                <Label>Output node id (from canvas)</Label>
                <Input
                  value={outputNodeId}
                  onChange={(e) => setOutputNodeId(e.target.value)}
                  placeholder="e.g. price_feed_2"
                  className="border-zinc-700 bg-zinc-900"
                />
              </div>
              <div>
                <Label>Output handle key</Label>
                <Input
                  value={outputHandle}
                  onChange={(e) => setOutputHandle(e.target.value)}
                  className="border-zinc-700 bg-zinc-900"
                />
              </div>
            </>
          )}

          {msg && (
            <p className="text-xs text-amber-200/90 whitespace-pre-wrap">{msg}</p>
          )}

          <div className="flex flex-wrap gap-2 pt-2">
            {mode === "strategy" ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy || !wallet}
                  onClick={() => void saveDraftStrategy()}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  disabled={busy || !wallet}
                  onClick={() => void publishStrategy()}
                >
                  Publish
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy || !wallet}
                  onClick={() => void saveDraftIndicator()}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  disabled={busy || !wallet}
                  onClick={() => void publishIndicator()}
                >
                  Publish
                </Button>
              </>
            )}
          </div>
          {!wallet && (
            <p className="text-xs text-zinc-500">Connect a wallet to publish.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
