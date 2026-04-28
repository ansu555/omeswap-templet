"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { normalizeWalletAddress } from "@/lib/onboarding";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StrategyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { address } = useWallet();
  const wallet = address ? normalizeWalletAddress(address) : null;
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["strategy-detail", id],
    queryFn: async () => {
      const res = await fetch(`/api/marketplace/strategies/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{
        strategy: Record<string, unknown>;
        currentVersion: Record<string, unknown> | null;
        versions: unknown[];
        indicatorRefs: { id: string; name: string; version_number: number }[];
        sampleReceipts: unknown[];
        activationCount: number;
        backtestRuns: { id: string; summary: unknown; created_at: string }[];
      }>;
    },
  });

  const [activateOpen, setActivateOpen] = useState(false);
  const [mode, setMode] = useState("research");
  const [reportReason, setReportReason] = useState("");

  const activateMut = useMutation({
    mutationFn: async () => {
      if (!wallet || !data?.currentVersion?.id) throw new Error("Missing");
      const res = await fetch("/api/activations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({
          strategy_id: id,
          strategy_version_id: data.currentVersion.id,
          mode,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json() as Promise<{ id: string }>;
    },
    onSuccess: (r) => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("omeswap_activation_id", r.id);
        sessionStorage.setItem(
          "omeswap_strategy_version_id",
          String(data?.currentVersion?.id ?? ""),
        );
      }
      setActivateOpen(false);
      qc.invalidateQueries({ queryKey: ["library-activations"] });
    },
  });

  const bookmarkMut = useMutation({
    mutationFn: async () => {
      if (!wallet) throw new Error("Connect wallet");
      const res = await fetch("/api/marketplace/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({ strategy_id: id }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
  });

  const reportMut = useMutation({
    mutationFn: async () => {
      if (!wallet || !reportReason.trim()) throw new Error("Reason required");
      const res = await fetch("/api/marketplace/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": wallet,
        },
        body: JSON.stringify({
          target_type: "strategy",
          target_id: id,
          reason: reportReason.trim(),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 pt-24 text-zinc-500 text-sm">
        Loading…
      </div>
    );
  }
  if (error || !data?.strategy) {
    return (
      <div className="container max-w-4xl mx-auto px-4 pt-24 text-red-400 text-sm">
        {(error as Error)?.message ?? "Not found"}
      </div>
    );
  }

  const s = data.strategy;
  const st = String(s.status ?? "");
  const isNew =
    Date.now() - new Date(String(s.created_at)).getTime() <
    14 * 24 * 60 * 60 * 1000;

  return (
    <div className="container max-w-4xl mx-auto px-4 pt-24 pb-16">
      <Link
        href="/marketplace"
        className="text-sm text-zinc-500 hover:text-zinc-300"
      >
        ← Marketplace
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">
            {String(s.name)}
          </h1>
          <p className="mt-2 text-zinc-400 text-sm max-w-2xl">
            {String(s.description ?? "")}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {st.replace("_", " ")}
            </Badge>
            {isNew && <Badge>New</Badge>}
            {st === "live_eligible" && (
              <Badge variant="secondary">Live eligible</Badge>
            )}
            {data.activationCount > 0 && <Badge variant="secondary">Active</Badge>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2" id="activate">
          <Button
            variant="secondary"
            disabled={!wallet}
            onClick={() => void bookmarkMut.mutate()}
          >
            Bookmark
          </Button>
          <Button onClick={() => setActivateOpen(true)} disabled={!wallet}>
            Activate
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-medium text-zinc-300">Indicators</h2>
          <ul className="mt-2 text-sm text-zinc-500 space-y-1">
            {data.indicatorRefs.length === 0 && <li>None listed</li>}
            {data.indicatorRefs.map((r) => (
              <li key={`${r.id}-${r.version_number}`}>
                <Link
                  href={`/marketplace/indicators/${r.id}`}
                  className="text-cyan-400 hover:underline"
                >
                  {r.name}
                </Link>{" "}
                <span className="text-zinc-600">v{r.version_number}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <h2 className="text-sm font-medium text-zinc-300">Sample receipts</h2>
          <ul className="mt-2 text-xs text-zinc-500 font-mono space-y-1">
            {(data.sampleReceipts as { id: string; tx_hash?: string }[]).map(
              (r) => (
                <li key={r.id}>{r.tx_hash ?? r.id}</li>
              ),
            )}
            {data.sampleReceipts.length === 0 && <li>None yet</li>}
          </ul>
        </div>
      </div>

      <Tabs defaultValue="backtest" className="mt-8">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="backtest">Backtest</TabsTrigger>
          <TabsTrigger value="paper" disabled className="opacity-50">
            Paper (soon)
          </TabsTrigger>
          <TabsTrigger value="live">Live</TabsTrigger>
        </TabsList>
        <TabsContent value="backtest" className="mt-4 text-sm text-zinc-400">
          {data.backtestRuns.length === 0 ? (
            <p>No backtest runs recorded.</p>
          ) : (
            <ul className="space-y-2">
              {data.backtestRuns.map((b) => (
                <li
                  key={b.id}
                  className="rounded border border-zinc-800 p-2 font-mono text-xs"
                >
                  {JSON.stringify(b.summary)}
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
        <TabsContent value="live" className="mt-4 text-sm text-zinc-400">
          Live metrics aggregate from decision receipts. Open My Library to
          inspect receipts after running the agent with an activation.
        </TabsContent>
      </Tabs>

      <div className="mt-8 rounded-xl border border-zinc-800 p-4 space-y-2">
        <h2 className="text-sm font-medium text-zinc-300">Report listing</h2>
        <textarea
          className="w-full min-h-[80px] rounded border border-zinc-700 bg-zinc-900 p-2 text-sm"
          placeholder="Describe the issue…"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
        <Button
          variant="destructive"
          size="sm"
          disabled={!wallet || reportMut.isPending}
          onClick={() => void reportMut.mutate()}
        >
          Submit report
        </Button>
      </div>

      <Dialog open={activateOpen} onOpenChange={setActivateOpen}>
        <DialogContent className="border-zinc-700 bg-zinc-950 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Activate strategy</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger className="border-zinc-700 bg-zinc-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem
                    value="live"
                    disabled={st !== "live_eligible"}
                  >
                    Live (requires live eligible)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {activateMut.error && (
              <p className="text-xs text-red-400">
                {(activateMut.error as Error).message}
              </p>
            )}
            <Button
              disabled={activateMut.isPending || !data.currentVersion}
              onClick={() => void activateMut.mutate()}
            >
              Confirm
            </Button>
            <p className="text-[10px] text-zinc-500">
              After activate, open Agent builder to run with this activation;
              session stores activation id for receipts.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
