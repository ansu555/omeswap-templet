"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import dynamic_import from "next/dynamic";
import ResearchChat from "@/components/research/ResearchChat";
import DecisionReceiptDrawer from "@/components/research/DecisionReceiptDrawer";
import { useResearchStore } from "@/store/research";
import { Loader2, Settings, Wallet } from "lucide-react";
import Link from "next/link";

// ── Lazy-load the graph canvas (uses @xyflow/react which is heavy) ─────────────
const AgentGraphCanvas = dynamic_import(
  () => import("@/components/research/AgentGraphCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={20} className="text-purple-400 animate-spin" />
      </div>
    ),
  },
);

// ── Settings gate ─────────────────────────────────────────────────────────────

interface UserSettings {
  model: string | null;
  mode: "autonomous" | "assisted" | "solo" | null;
  hasApiKey: boolean;
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ResearchPage() {
  const { address } = useAccount();
  const setMode = useResearchStore((s) => s.setMode);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Load user settings and apply mode to the store
  useEffect(() => {
    if (!address) {
      setSettingsLoading(false);
      return;
    }

    fetch("/api/user-settings", {
      headers: { "x-wallet-address": address },
    })
      .then((r) => r.json())
      .then((data: UserSettings) => {
        setSettings(data);
        if (data.mode) setMode(data.mode);
      })
      .catch(() => setSettings({ model: null, mode: null, hasApiKey: false }))
      .finally(() => setSettingsLoading(false));
  }, [address, setMode]);

  // ── Not connected ───────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div
        className="min-h-screen pt-20 flex items-center justify-center px-4"
        style={{ background: "linear-gradient(135deg, #07070d 0%, #10101c 100%)" }}
      >
        <div
          className="rounded-lg px-10 py-12 text-center max-w-sm"
          style={{
            background: "rgba(13,13,26,0.95)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 text-purple-300">
            <Wallet size={21} />
          </div>
          <h2 className="text-base font-semibold text-white mb-2">
            Connect Your Wallet
          </h2>
          <p className="text-[11px] text-white/40">
            Connect a wallet to access the ATS research co-pilot.
          </p>
        </div>
      </div>
    );
  }

  // ── Loading settings ────────────────────────────────────────────────────────
  if (settingsLoading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 size={24} className="text-purple-400 animate-spin" />
      </div>
    );
  }

  // ── Missing API key / model — redirect banner ────────────────────────────────
  const missingConfig =
    settings && (!settings.hasApiKey || !settings.model);

  return (
    <div
      className="flex flex-col bg-[#080810]"
      style={{ height: "100dvh", paddingTop: "64px" }}
    >
      {/* Missing-settings banner */}
      {missingConfig && (
        <div
          className="flex items-center justify-between gap-3 px-4 py-2 text-[11px]"
          style={{
            background: "rgba(234,179,8,0.08)",
            borderBottom: "1px solid rgba(234,179,8,0.25)",
          }}
        >
          <div className="flex items-center gap-2 text-amber-300">
            <Settings size={12} />
            <span>
              Set your OpenRouter API key and model in Portfolio Settings to
              enable full ATS reasoning.
            </span>
          </div>
          <Link
            href="/portfolio"
            className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-medium text-amber-300 hover:text-white transition-colors"
            style={{ background: "rgba(234,179,8,0.15)" }}
          >
            Go to Settings
          </Link>
        </div>
      )}

      {/* 2/3 + 1/3 split */}
      <div className="flex flex-1 min-h-0 overflow-hidden max-lg:flex-col">
        {/* Left — agent graph canvas (2/3) */}
        <div
          className="flex-1 min-h-0 max-lg:h-[52dvh]"
          style={{
            background: "linear-gradient(135deg, #07070d 0%, #0f1020 52%, #080a12 100%)",
          }}
        >
          <AgentGraphCanvas />
        </div>

        {/* Right — research chat (1/3, min 320px) */}
        <div
          className="relative flex-shrink-0 w-full lg:w-[clamp(360px,34vw,520px)] max-lg:h-[48dvh]"
        >
          <ResearchChat />
        </div>
      </div>

      {/* Receipt drawer (portal) */}
      <DecisionReceiptDrawer />
    </div>
  );
}
