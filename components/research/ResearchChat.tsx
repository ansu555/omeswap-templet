"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import {
  Send,
  Loader2,
  FileText,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  ExternalLink,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useResearchStore, type ChatMessage, type PendingApproval } from "@/store/research";
import type { RunEvent } from "@/lib/ats/types";

// ── SSE parser ────────────────────────────────────────────────────────────────

async function* parseSSE(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6).trim();
        if (data === "[DONE]") return;
        try {
          yield JSON.parse(data) as RunEvent;
        } catch {
          // skip malformed
        }
      }
    }
  }
}

// ── Agent icon map ────────────────────────────────────────────────────────────

const AGENT_ICONS: Record<string, string> = {
  data:         "📡",
  regime:       "📊",
  signal:       "📈",
  graph:        "🕸️",
  risk:         "🛡️",
  execution:    "⚡",
  orchestrator: "🎯",
};

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tr-sm text-[11px] text-white leading-relaxed"
          style={{
            background: "rgba(124,58,237,0.2)",
            border: "1px solid rgba(124,58,237,0.25)",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "error") {
    return (
      <div className="flex items-start gap-2">
        <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
        <p className="text-[11px] text-red-300 leading-relaxed">{msg.content}</p>
      </div>
    );
  }

  if (msg.role === "system") {
    return (
      <div className="flex justify-center">
        <span
          className="px-2.5 py-1 rounded-full text-[9px] text-white/30"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {msg.content}
        </span>
      </div>
    );
  }

  // agent message
  const icon = msg.agent ? AGENT_ICONS[msg.agent] ?? "🤖" : "🤖";
  const agentLabel = msg.agent ?? "agent";

  return (
    <div className="flex gap-2">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 text-sm"
        style={{
          background: "rgba(124,58,237,0.12)",
          border: "1px solid rgba(124,58,237,0.2)",
        }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] text-purple-400/70 font-medium capitalize">
            {agentLabel}
          </span>
          <span className="text-[8px] text-white/15 font-mono">
            {new Date(msg.ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <p className="text-[11px] text-white/75 leading-relaxed">{msg.content}</p>
      </div>
    </div>
  );
}

// ── Approval banner (assisted mode) ───────────────────────────────────────────

function ApprovalBanner({
  approval,
  onApprove,
  onDismiss,
  ticker,
  query,
}: {
  approval: PendingApproval;
  onApprove: () => void;
  onDismiss: () => void;
  ticker: string;
  query: string;
}) {
  const router = useRouter();
  const isRunning = useResearchStore((s) => s.isRunning);
  const isBuy = approval.decision === "BUY";

  const openInTerminal = () => {
    const params = new URLSearchParams({
      from: "research",
      runId: approval.run_id,
      decision: approval.decision,
      sizeUsd: String(approval.size_usd),
      ticker,
      query,
    });
    router.push(`/terminal?${params.toString()}`);
  };

  return (
    <div
      className="mx-4 mb-3 rounded-2xl overflow-hidden"
      style={{
        background: isBuy
          ? "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))"
          : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.06))",
        border: isBuy
          ? "1px solid rgba(16,185,129,0.3)"
          : "1px solid rgba(239,68,68,0.3)",
      }}
    >
      {/* Top label */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5"
        style={{
          background: isBuy
            ? "rgba(16,185,129,0.1)"
            : "rgba(239,68,68,0.1)",
          borderBottom: isBuy
            ? "1px solid rgba(16,185,129,0.15)"
            : "1px solid rgba(239,68,68,0.15)",
        }}
      >
        <Zap
          size={10}
          className={isBuy ? "text-emerald-400" : "text-red-400"}
        />
        <span
          className={clsx(
            "text-[9px] font-semibold uppercase tracking-widest",
            isBuy ? "text-emerald-400" : "text-red-400",
          )}
        >
          Assisted Mode — Approval Required
        </span>
      </div>

      {/* Body */}
      <div className="px-3 py-2.5 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] text-white/80">
            Consensus:{" "}
            <span
              className={clsx(
                "font-bold",
                isBuy ? "text-emerald-300" : "text-red-300",
              )}
            >
              {approval.decision}
            </span>
          </span>
          <span className="text-[11px] font-mono text-white/60">
            ${approval.size_usd.toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed">
          {isBuy
            ? "The ATS pipeline recommends a buy. Approve to sign and submit the swap."
            : "The ATS pipeline recommends a sell. Approve to sign and submit the swap."}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            disabled={isRunning}
            className={clsx(
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all",
              "disabled:opacity-40",
              isBuy
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30",
            )}
          >
            {isRunning ? (
              <Loader2 size={10} className="animate-spin" />
            ) : (
              <CheckCircle size={10} />
            )}
            Approve &amp; Execute
          </button>
          <button
            onClick={onDismiss}
            disabled={isRunning}
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-[10px] text-white/30 border border-white/10 hover:border-white/20 hover:text-white/50 transition-all disabled:opacity-40"
          >
            <XCircle size={10} />
            Dismiss
          </button>
        </div>
        <button
          onClick={openInTerminal}
          disabled={isRunning}
          className="w-full flex items-center justify-center gap-1 text-[9px] text-white/25 hover:text-white/50 transition-colors disabled:opacity-40"
        >
          <ExternalLink size={9} />
          Execute in Terminal
        </button>
      </div>
    </div>
  );
}

// ── Ticker selector ───────────────────────────────────────────────────────────

const QUICK_TICKERS = ["BTC", "ETH", "SOL", "AVAX", "BNB", "LINK"];

// ── Main component ────────────────────────────────────────────────────────────

export default function ResearchChat() {
  const { address } = useAccount();
  const [input, setInput] = useState("");
  const [ticker, setTicker] = useState("BTC");
  const [customTicker, setCustomTicker] = useState("");

  const messages = useResearchStore((s) => s.messages);
  const isRunning = useResearchStore((s) => s.isRunning);
  const mode = useResearchStore((s) => s.mode);
  const currentReceipt = useResearchStore((s) => s.currentReceipt);
  const pendingApproval = useResearchStore((s) => s.pendingApproval);
  const addUserMessage = useResearchStore((s) => s.addUserMessage);
  const applyEvent = useResearchStore((s) => s.applyEvent);
  const setReceiptOpen = useResearchStore((s) => s.setReceiptOpen);
  const clearPendingApproval = useResearchStore((s) => s.clearPendingApproval);
  const resetRun = useResearchStore((s) => s.resetRun);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Tracks the last query sent so the approve action can re-send it. */
  const lastQueryRef = useRef<string>("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeTicker = customTicker.trim().toUpperCase() || ticker;

  const sendQuery = useCallback(
    async (query: string, executionApproved = false) => {
      if (!query.trim() || isRunning || !address) return;

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      lastQueryRef.current = query;
      addUserMessage(
        executionApproved
          ? `✅ Approve & Execute — re-running with execution enabled`
          : query,
      );
      if (!executionApproved) setInput("");

      try {
        const res = await fetch("/api/research/run", {
          method: "POST",
          signal: abortRef.current.signal,
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": address,
          },
          body: JSON.stringify({
            query,
            ticker: activeTicker,
            mode,
            ...(executionApproved ? { executionApproved: true } : {}),
          }),
        });

        if (!res.ok || !res.body) {
          applyEvent({
            type: "run.error",
            run_id: `err_${Date.now()}`,
            ts: new Date().toISOString(),
            agent: "orchestrator",
            message: `HTTP ${res.status}: ${res.statusText}`,
          });
          return;
        }

        for await (const evt of parseSSE(res.body)) {
          applyEvent(evt);
          if (evt.type === "run.done" || evt.type === "run.error") break;
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          applyEvent({
            type: "run.error",
            run_id: `err_${Date.now()}`,
            ts: new Date().toISOString(),
            agent: "orchestrator",
            message: (err as Error).message ?? "Unknown error",
          });
        }
      }
    },
    [address, activeTicker, mode, isRunning, addUserMessage, applyEvent],
  );

  const handleApprove = useCallback(() => {
    const q = lastQueryRef.current;
    if (!q) return;
    sendQuery(q, true);
  }, [sendQuery]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuery(input);
    }
  }

  function handleAbort() {
    abortRef.current?.abort();
    resetRun();
  }

  return (
    <aside
      className="flex flex-col h-full"
      style={{
        background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a18 100%)",
        borderLeft: "1px solid rgba(82,39,255,0.2)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(82,39,255,0.15)" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🧠</span>
          <div>
            <p className="text-xs font-semibold text-white/90 leading-none">
              ATS Research
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={clsx(
                  "text-[8px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide",
                  mode === "autonomous"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : mode === "assisted"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                      : "bg-white/5 text-white/30 border border-white/10",
                )}
              >
                {mode === "autonomous"
                  ? "⚡ Auto"
                  : mode === "assisted"
                    ? "🤝 Assisted"
                    : "🔬 Solo"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isRunning && (
            <button
              onClick={handleAbort}
              className="text-[10px] text-red-400 hover:text-red-300 transition-colors px-2 py-1 rounded-lg"
              style={{ background: "rgba(239,68,68,0.1)" }}
            >
              Stop
            </button>
          )}
          {currentReceipt && !isRunning && (
            <button
              onClick={() => setReceiptOpen(true)}
              className="flex items-center gap-1 text-[10px] text-purple-400 hover:text-purple-300 transition-colors px-2 py-1 rounded-lg"
              style={{ background: "rgba(124,58,237,0.1)" }}
            >
              <FileText size={10} />
              Receipt
            </button>
          )}
        </div>
      </div>

      {/* Ticker selector */}
      <div
        className="px-4 py-2 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span className="text-[9px] text-white/30 shrink-0">Ticker</span>
        <div className="flex gap-1 flex-wrap">
          {QUICK_TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTicker(t);
                setCustomTicker("");
              }}
              className={clsx(
                "text-[9px] font-mono px-1.5 py-0.5 rounded-md transition-all",
                ticker === t && !customTicker
                  ? "bg-purple-600/40 text-purple-200 border border-purple-500/40"
                  : "text-white/35 border border-white/8 hover:border-white/20",
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <input
          value={customTicker}
          onChange={(e) => setCustomTicker(e.target.value.toUpperCase().slice(0, 8))}
          placeholder="Other…"
          className="w-14 bg-white/5 border border-white/10 rounded-md px-1.5 py-0.5 text-[9px] font-mono text-white/70 placeholder-white/20 focus:outline-none focus:border-purple-500/40"
        />
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <div className="text-3xl">
              {mode === "autonomous" ? "⚡" : mode === "assisted" ? "🤝" : "🔬"}
            </div>
            <p className="text-[11px] text-white/30 leading-relaxed">
              {mode === "autonomous"
                ? "Autonomous mode — trades execute automatically on consensus."
                : mode === "assisted"
                  ? "Assisted mode — you'll approve each trade before it executes."
                  : "Solo mode — research and analysis only, no execution."}
            </p>
            <p className="text-[10px] text-white/20 italic">
              e.g. "Should I buy {activeTicker} right now?"
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 py-1">
            <Loader2 size={12} className="text-purple-400 animate-spin shrink-0" />
            <span className="text-[10px] text-purple-400/70">
              ATS pipeline running…
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom hint */}
      {messages.length > 6 && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-20 right-6 w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
          style={{
            background: "rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ChevronDown size={13} />
        </button>
      )}

      {/* Assisted mode approval banner */}
      {pendingApproval && mode === "assisted" && (
        <ApprovalBanner
          approval={pendingApproval}
          onApprove={handleApprove}
          onDismiss={clearPendingApproval}
          ticker={activeTicker}
          query={lastQueryRef.current}
        />
      )}

      {/* Input */}
      <div
        className="px-4 pb-4 pt-3"
        style={{ borderTop: "1px solid rgba(82,39,255,0.15)" }}
      >
        {!address && (
          <p className="text-[10px] text-amber-400/80 mb-2 text-center">
            Connect your wallet to run research.
          </p>
        )}
        <div
          className="flex gap-2 items-end rounded-2xl px-3 py-2"
          style={{
            background: "rgba(82,39,255,0.08)",
            border: "1px solid rgba(82,39,255,0.22)",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning || !address}
            placeholder={`Analyse ${activeTicker}…`}
            rows={2}
            className="flex-1 bg-transparent text-[11px] text-white placeholder-white/20 focus:outline-none resize-none leading-relaxed disabled:opacity-40"
          />
          <button
            onClick={() => sendQuery(input)}
            disabled={!input.trim() || isRunning || !address}
            className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center disabled:opacity-20 transition-all hover:scale-105"
            style={{
              background:
                input.trim() && !isRunning && address
                  ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                  : "rgba(255,255,255,0.08)",
            }}
          >
            {isRunning ? (
              <Loader2 size={12} className="text-white/50 animate-spin" />
            ) : (
              <Send size={11} className="text-white" />
            )}
          </button>
        </div>
        <p className="text-[9px] text-white/15 mt-1.5 text-center">
          ↵ send · shift+↵ newline
        </p>
      </div>
    </aside>
  );
}
