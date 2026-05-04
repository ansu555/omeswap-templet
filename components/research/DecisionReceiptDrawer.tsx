"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useResearchStore } from "@/store/research";
import type { DecisionReceipt, AgentVote } from "@/lib/ats/types";
import clsx from "clsx";

// ── Helpers ───────────────────────────────────────────────────────────────────

function DecisionBadge({ decision }: { decision: string }) {
  const colour =
    decision === "BUY"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : decision === "SELL"
        ? "border-red-500/40 bg-red-500/10 text-red-300"
        : decision === "VETO"
          ? "border-orange-500/40 bg-orange-500/10 text-orange-300"
          : "border-white/20 bg-white/5 text-white/60";

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border",
        colour,
      )}
    >
      {decision}
    </span>
  );
}

function VotePill({ vote }: { vote: AgentVote }) {
  const voteColour =
    vote.vote === "BUY"
      ? "text-emerald-400"
      : vote.vote === "SELL"
        ? "text-red-400"
        : "text-white/40";

  return (
    <div
      className="rounded-lg p-2.5 space-y-1.5"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-white/80 capitalize">
          {vote.agent}
        </span>
        <div className="flex items-center gap-2">
          {vote.vetoed && (
            <span className="text-[9px] text-red-400 font-medium bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-full">
              VETO
            </span>
          )}
          <span className={clsx("text-[11px] font-bold", voteColour)}>
            {vote.vote}
          </span>
        </div>
      </div>
      {/* Confidence bar */}
      <div className="space-y-0.5">
        <div className="flex justify-between">
          <span className="text-[9px] text-white/30">Confidence</span>
          <span className="text-[9px] font-mono text-white/50">
            {Math.round(vote.confidence * 100)}%
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/5">
          <div
            className={clsx(
              "h-full rounded-full transition-all duration-500",
              vote.vote === "BUY"
                ? "bg-emerald-500"
                : vote.vote === "SELL"
                  ? "bg-red-500"
                  : "bg-white/20",
            )}
            style={{ width: `${Math.round(vote.confidence * 100)}%` }}
          />
        </div>
      </div>
      {vote.rationale && (
        <p className="text-[10px] text-white/35 leading-snug line-clamp-2">
          {vote.rationale}
        </p>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DecisionReceiptDrawer() {
  const receiptOpen = useResearchStore((s) => s.receiptOpen);
  const setReceiptOpen = useResearchStore((s) => s.setReceiptOpen);
  const receipt = useResearchStore((s) => s.currentReceipt);

  if (!receipt) return null;

  const r: DecisionReceipt = receipt;
  const decisionDate = r.created_at
    ? new Date(r.created_at).toLocaleString()
    : new Date().toLocaleString();

  return (
    <Sheet open={receiptOpen} onOpenChange={setReceiptOpen}>
      <SheetContent
        side="right"
        className="w-full max-w-[420px] overflow-y-auto p-0"
        style={{
          background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a18 100%)",
          border: "none",
          borderLeft: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        {/* Header */}
        <SheetHeader
          className="px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <SheetTitle className="flex items-center gap-3 text-sm font-bold text-white">
            <span className="text-lg">📋</span>
            Decision Receipt
            <DecisionBadge decision={r.consensus.decision} />
          </SheetTitle>
          <p className="text-[10px] text-white/30 font-mono mt-0.5">
            {r.run_id}
          </p>
          <p className="text-[10px] text-white/25">{decisionDate}</p>
        </SheetHeader>

        {/* Body */}
        <div className="px-5 py-4 space-y-5">
          {/* Trigger */}
          <Section title="Trigger">
            <div
              className="rounded-lg p-3 space-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex gap-2">
                <span className="text-[9px] text-white/30 uppercase tracking-wide shrink-0 mt-0.5">
                  Type
                </span>
                <span className="text-[10px] text-white/70 capitalize">
                  {r.trigger_type.replace("_", " ")}
                </span>
              </div>
              {r.query && (
                <div className="flex gap-2">
                  <span className="text-[9px] text-white/30 uppercase tracking-wide shrink-0 mt-0.5">
                    Query
                  </span>
                  <span className="text-[10px] text-white/70 italic">
                    "{r.query}"
                  </span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="text-[9px] text-white/30 uppercase tracking-wide shrink-0 mt-0.5">
                  Ticker
                </span>
                <span className="text-[10px] text-white/80 font-mono font-semibold">
                  {r.ticker}
                </span>
              </div>
            </div>
          </Section>

          {/* Market Regime */}
          <Section title="Regime">
            <div
              className="rounded-lg px-3 py-2 flex items-center justify-between"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
              }}
            >
              <span className="text-[11px] text-indigo-300 font-medium capitalize">
                {r.regime.replace(/_/g, " ")}
              </span>
              <span className="text-lg">
                {r.regime.includes("bull")
                  ? "📈"
                  : r.regime.includes("bear")
                    ? "📉"
                    : r.regime === "sideways"
                      ? "↔️"
                      : "🔍"}
              </span>
            </div>
          </Section>

          {/* Agent votes */}
          <Section title={`Agent Votes (${r.agent_votes.length})`}>
            <div className="space-y-2">
              {r.agent_votes.map((v) => (
                <VotePill key={v.agent} vote={v} />
              ))}
            </div>
          </Section>

          {/* Consensus */}
          <Section title="Consensus">
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center justify-between">
                <DecisionBadge decision={r.consensus.decision} />
                <span className="text-[10px] font-mono text-white/50">
                  {Math.round(r.consensus.confidence * 100)}% confidence
                </span>
              </div>
              {r.consensus.rationale && (
                <p className="text-[10px] text-white/50 leading-relaxed">
                  {r.consensus.rationale}
                </p>
              )}
              {r.consensus.approved_by.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.consensus.approved_by.map((a) => (
                    <span
                      key={a}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
              {r.consensus.vetoed_by.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.consensus.vetoed_by.map((a) => (
                    <span
                      key={a}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20"
                    >
                      {a} (against)
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Risk Sizing */}
          <Section title="Risk Sizing">
            <div
              className="rounded-lg p-3 space-y-2"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {r.risk_sizing.veto_triggered ? (
                <div className="flex items-center gap-2 text-[11px] text-orange-300">
                  <span>⛔</span>
                  <span>Risk veto: {r.risk_sizing.veto_reason ?? "Hard rule breached"}</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ["Kelly Fraction", `${(r.risk_sizing.kelly_fraction * 100).toFixed(1)}%`],
                    ["Size", `$${r.risk_sizing.size_usd.toFixed(2)}`],
                    ["Max Loss", `$${r.risk_sizing.max_loss_usd.toFixed(2)}`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="text-[9px] text-white/30">{k}</div>
                      <div className="text-[11px] font-mono text-white/80">{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Section>

          {/* Causal chain */}
          {r.causal_chain.active_chains.length > 0 && (
            <Section title="Causal Chains">
              <div className="space-y-2">
                {r.causal_chain.active_chains.slice(0, 3).map((c) => (
                  <div
                    key={c.chain.id}
                    className="rounded-lg p-2.5 space-y-1"
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-white/70">
                        {c.chain.name}
                      </span>
                      <span
                        className={clsx(
                          "text-[9px] font-mono",
                          c.chain.expected_impact === "positive"
                            ? "text-emerald-400"
                            : c.chain.expected_impact === "negative"
                              ? "text-red-400"
                              : "text-white/30",
                        )}
                      >
                        {Math.round(c.active_probability * 100)}% active
                      </span>
                    </div>
                    {c.supporting_evidence && (
                      <p className="text-[9px] text-white/30 line-clamp-2">
                        {c.supporting_evidence}
                      </p>
                    )}
                  </div>
                ))}
                <div className="text-[9px] text-white/25 text-center capitalize">
                  Net bias: {r.causal_chain.net_directional_bias}
                </div>
              </div>
            </Section>
          )}

          {/* Execution */}
          {(r.tx_hash || r.storage_root_hash) && (
            <Section title="Execution">
              <div
                className="rounded-lg p-3 space-y-2"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                {r.tx_hash && (
                  <div>
                    <div className="text-[9px] text-white/30 mb-0.5">Tx Hash</div>
                    <span className="text-[10px] font-mono text-purple-400 break-all">
                      {r.tx_hash}
                    </span>
                  </div>
                )}
                {r.storage_root_hash && (
                  <div>
                    <div className="text-[9px] text-white/30 mb-0.5">
                      0G Storage Root
                    </div>
                    <span className="text-[10px] font-mono text-white/40 break-all">
                      {r.storage_root_hash}
                    </span>
                  </div>
                )}
                <div className="text-[9px] text-white/25">
                  Chain ID: {r.chain_id}
                </div>
              </div>
            </Section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
