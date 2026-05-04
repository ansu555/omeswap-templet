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
  BrainCircuit,
  BarChart3,
  LineChart,
  Network,
  ShieldAlert,
  Target,
  Bot,
  Activity,
  Square,
  MessageCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const AGENT_META: Record<string, { Icon: LucideIcon; label: string; color: string }> = {
  data: { Icon: Activity, label: "Data", color: "text-sky-300" },
  regime: { Icon: BarChart3, label: "Regime", color: "text-indigo-300" },
  signal: { Icon: LineChart, label: "Signal", color: "text-emerald-300" },
  graph: { Icon: Network, label: "Graph", color: "text-violet-300" },
  risk: { Icon: ShieldAlert, label: "Risk", color: "text-rose-300" },
  execution: { Icon: Zap, label: "Execution", color: "text-amber-300" },
  orchestrator: { Icon: Target, label: "Orchestrator", color: "text-purple-300" },
};

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[88%] px-3.5 py-2.5 rounded-lg rounded-tr-sm text-[11px] text-white leading-relaxed shadow-[0_10px_30px_rgba(76,29,149,0.18)]"
          style={{
            background: "linear-gradient(135deg, rgba(124,58,237,0.34), rgba(37,99,235,0.24))",
            border: "1px solid rgba(167,139,250,0.24)",
          }}
        >
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "error") {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-red-500/15 bg-red-500/[0.08] px-3 py-2">
        <AlertCircle size={14} className="text-red-300 mt-0.5 shrink-0" />
        <p className="text-[11px] text-red-200/85 leading-relaxed">{msg.content}</p>
      </div>
    );
  }

  if (msg.role === "system") {
    return (
      <div className="flex justify-center">
        <span
          className="max-w-[90%] px-2.5 py-1 rounded-md text-[9px] text-white/[0.36] leading-relaxed text-center"
          style={{
            background: "rgba(255,255,255,0.035)",
            border: "1px solid rgba(255,255,255,0.065)",
          }}
        >
          {msg.content}
        </span>
      </div>
    );
  }

  const meta = msg.agent ? AGENT_META[msg.agent] : undefined;
  const Icon = meta?.Icon ?? Bot;
  const agentLabel = meta?.label ?? msg.agent ?? "Assistant";

  return (
    <div className="flex gap-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: "rgba(124,58,237,0.13)",
          border: "1px solid rgba(167,139,250,0.18)",
        }}
      >
        <Icon size={14} className={meta?.color ?? "text-purple-300"} />
      </div>
      <div className="flex-1 min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[9px] text-white/45 font-medium">
            {agentLabel}
          </span>
          <span className="text-[8px] text-white/[0.18] font-mono">
            {new Date(msg.ts).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <p className="text-[11px] text-white/[0.78] leading-relaxed">{msg.content}</p>
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
      className="mx-4 mb-3 rounded-lg overflow-hidden"
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
              "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[10px] font-semibold transition-all",
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
            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-[10px] text-white/30 border border-white/10 hover:border-white/20 hover:text-white/50 transition-all disabled:opacity-40"
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
const KNOWN_TICKERS = [
  "BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "AVAX", "DOGE", "DOT", "MATIC",
  "LINK", "UNI", "ATOM", "LTC", "BCH", "NEAR", "APT", "ARB", "OP", "INJ",
  "SUI", "SEI", "TIA", "RNDR", "PEPE", "WIF", "BONK", "JUP", "PYTH",
  "SHIB", "TRX", "TON", "FTM", "CRV", "AAVE",
];

const RESEARCH_INTENT_RE =
  /\b(analy[sz]e|research|scan|check|signal|regime|risk|price|market|trend|forecast|chart|technical|sentiment|news|correlation|buy|sell|hold|long|short|entry|exit|trade|position|portfolio)\b|\bshould\s+(i|we)\b|\bwhat\s+about\b/i;
const QUESTION_RE =
  /[?]|\b(should|can|could|would|is|are|will|what|why|how|when)\b/i;

function extractTickerFromText(text: string): string | null {
  const upper = text.toUpperCase();
  for (const ticker of KNOWN_TICKERS) {
    const re = new RegExp(`(^|[^A-Z])${ticker}(?=[^A-Z]|$)`);
    if (re.test(upper)) return ticker;
  }
  return null;
}

function parseResearchIntent(query: string, fallbackTicker: string) {
  const trimmed = query.trim();
  const explicitTicker = extractTickerFromText(trimmed);
  const tickerOnlyText = trimmed
    .toUpperCase()
    .replace(/^\$/, "")
    .replace(/[?!.,]+$/, "")
    .trim();
  const tickerOnly = explicitTicker !== null && tickerOnlyText === explicitTicker;
  const hasResearchIntent = RESEARCH_INTENT_RE.test(trimmed);
  const hasTickerQuestion = explicitTicker !== null && QUESTION_RE.test(trimmed);

  return {
    shouldRun: tickerOnly || hasResearchIntent || hasTickerQuestion,
    ticker: explicitTicker ?? fallbackTicker,
    explicitTicker,
  };
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ResearchChat() {
  const { address } = useAccount();
  const [input, setInput] = useState("");
  const [ticker, setTicker] = useState("BTC");
  const [customTicker, setCustomTicker] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  const messages = useResearchStore((s) => s.messages);
  const isRunning = useResearchStore((s) => s.isRunning);
  const mode = useResearchStore((s) => s.mode);
  const currentReceipt = useResearchStore((s) => s.currentReceipt);
  const pendingApproval = useResearchStore((s) => s.pendingApproval);
  const addUserMessage = useResearchStore((s) => s.addUserMessage);
  const addAssistantMessage = useResearchStore((s) => s.addAssistantMessage);
  const applyEvent = useResearchStore((s) => s.applyEvent);
  const setReceiptOpen = useResearchStore((s) => s.setReceiptOpen);
  const clearPendingApproval = useResearchStore((s) => s.clearPendingApproval);
  const resetRun = useResearchStore((s) => s.resetRun);

  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  /** Tracks the last query sent so the approve action can re-send it. */
  const lastQueryRef = useRef<string>("");
  const lastTickerRef = useRef<string>("BTC");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isRunning, isReplying]);

  const activeTicker = customTicker.trim().toUpperCase() || ticker;

  const sendQuery = useCallback(
    async (query: string, executionApproved = false) => {
      const trimmedQuery = query.trim();
      if (!trimmedQuery || isRunning || isReplying || !address) return;

      const intent = parseResearchIntent(trimmedQuery, activeTicker);
      const runTicker = executionApproved
        ? lastTickerRef.current || intent.ticker
        : intent.ticker;

      addUserMessage(
        executionApproved
          ? "Approve & Execute - re-running with execution enabled"
          : trimmedQuery,
      );
      if (!executionApproved) setInput("");

      if (!executionApproved && !intent.shouldRun) {
        const history = messages
          .filter(
            (msg) =>
              !msg.eventType && (msg.role === "user" || msg.role === "agent"),
          )
          .slice(-8)
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content,
          }));

        setIsReplying(true);
        try {
          const res = await fetch("/api/research/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-wallet-address": address,
            },
            body: JSON.stringify({
              message: trimmedQuery,
              ticker: activeTicker,
              history,
            }),
          });
          const data = (await res.json()) as { reply?: string; error?: string };
          if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
          addAssistantMessage(data.reply?.trim() || "I am here.");
        } catch (err) {
          applyEvent({
            type: "run.error",
            run_id: `chat_${Date.now()}`,
            ts: new Date().toISOString(),
            agent: "orchestrator",
            message: `LLM reply failed: ${(err as Error).message ?? "Unknown error"}`,
          });
        } finally {
          setIsReplying(false);
        }
        return;
      }

      if (!executionApproved && intent.explicitTicker) {
        if (QUICK_TICKERS.includes(intent.explicitTicker)) {
          setTicker(intent.explicitTicker);
          setCustomTicker("");
        } else {
          setCustomTicker(intent.explicitTicker);
        }
      }

      abortRef.current?.abort();
      abortRef.current = new AbortController();
      lastQueryRef.current = trimmedQuery;
      lastTickerRef.current = runTicker;

      try {
        const res = await fetch("/api/research/run", {
          method: "POST",
          signal: abortRef.current.signal,
          headers: {
            "Content-Type": "application/json",
            "x-wallet-address": address,
          },
          body: JSON.stringify({
            query: trimmedQuery,
            ticker: runTicker,
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
    [
      address,
      activeTicker,
      mode,
      isRunning,
      isReplying,
      messages,
      addUserMessage,
      addAssistantMessage,
      applyEvent,
    ],
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
      className="flex flex-col h-full min-h-0"
      style={{
        background: "linear-gradient(180deg, rgba(15,15,29,0.98) 0%, rgba(8,9,18,0.98) 100%)",
        borderLeft: "1px solid rgba(148,163,184,0.12)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5"
        style={{ borderBottom: "1px solid rgba(148,163,184,0.10)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/[0.12] text-purple-300 ring-1 ring-purple-300/15">
            <BrainCircuit size={16} />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-white/[0.92] leading-none">
              ATS Research
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={clsx(
                  "h-1.5 w-1.5 rounded-full",
                  isRunning
                    ? "bg-purple-400 animate-pulse"
                    : isReplying
                      ? "bg-blue-400 animate-pulse"
                      : "bg-emerald-400",
                )}
              />
              <span
                className={clsx(
                  "text-[8px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide",
                  mode === "autonomous"
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                    : mode === "assisted"
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/25"
                      : "bg-white/5 text-white/30 border border-white/10",
                )}
              >
                {mode === "autonomous"
                  ? "Auto"
                  : mode === "assisted"
                    ? "Assisted"
                    : "Solo"}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isRunning && (
            <button
              onClick={handleAbort}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-[10px] text-red-300 transition-colors hover:bg-red-500/15"
              style={{ background: "rgba(239,68,68,0.08)" }}
            >
              <Square size={10} />
              Stop
            </button>
          )}
          {currentReceipt && !isRunning && (
            <button
              onClick={() => setReceiptOpen(true)}
              className="flex h-7 items-center gap-1 rounded-md px-2 text-[10px] text-purple-300 transition-colors hover:bg-purple-500/15"
              style={{ background: "rgba(124,58,237,0.08)" }}
            >
              <FileText size={10} />
              Receipt
            </button>
          )}
        </div>
      </div>

      {/* Ticker selector */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <span className="text-[9px] text-white/35 shrink-0">Asset</span>
        <div className="flex-1 min-w-0 flex gap-1 overflow-x-auto">
          {QUICK_TICKERS.map((t) => (
            <button
              key={t}
              onClick={() => {
                setTicker(t);
                setCustomTicker("");
              }}
              className={clsx(
                "h-6 min-w-10 rounded-md px-2 text-[9px] font-mono transition-all",
                ticker === t && !customTicker
                  ? "bg-purple-500/[0.24] text-purple-100 border border-purple-300/35 shadow-[0_0_18px_rgba(124,58,237,0.18)]"
                  : "text-white/35 border border-white/[0.08] bg-white/[0.025] hover:border-white/20 hover:text-white/60",
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
          className="h-6 w-16 bg-white/[0.035] border border-white/10 rounded-md px-1.5 text-[9px] font-mono text-white/70 placeholder-white/20 focus:outline-none focus:border-purple-400/45"
        />
      </div>

      {/* Messages */}
      <div
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.08) transparent",
        }}
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.04] text-purple-300 ring-1 ring-white/10">
              <MessageCircle size={17} />
            </div>
            <p className="text-[11px] font-medium text-white/55">Ready for {activeTicker}</p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {isRunning && (
          <div className="flex items-center gap-2 rounded-md border border-purple-300/10 bg-purple-500/[0.06] px-3 py-2">
            <Loader2 size={12} className="text-purple-300 animate-spin shrink-0" />
            <span className="text-[10px] text-purple-200/70">
              ATS pipeline running…
            </span>
          </div>
        )}
        {isReplying && (
          <div className="flex items-center gap-2 rounded-md border border-blue-300/10 bg-blue-500/[0.06] px-3 py-2">
            <Loader2 size={12} className="text-blue-300 animate-spin shrink-0" />
            <span className="text-[10px] text-blue-200/70">
              Thinking…
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom hint */}
      {messages.length > 6 && (
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="absolute bottom-20 right-6 w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
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
        style={{ borderTop: "1px solid rgba(148,163,184,0.10)" }}
      >
        {!address && (
          <p className="text-[10px] text-amber-400/80 mb-2 text-center">
            Connect your wallet to run research.
          </p>
        )}
        <div
          className="flex gap-2 items-end rounded-lg px-3 py-2.5 transition-colors focus-within:border-purple-300/45"
          style={{
            background: "rgba(15,23,42,0.46)",
            border: "1px solid rgba(148,163,184,0.14)",
          }}
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning || isReplying || !address}
            placeholder={`Analyse ${activeTicker}…`}
            rows={2}
            className="flex-1 min-h-8 bg-transparent text-[11px] text-white placeholder-white/25 focus:outline-none resize-none leading-relaxed disabled:opacity-40"
          />
          <button
            onClick={() => sendQuery(input)}
            disabled={!input.trim() || isRunning || isReplying || !address}
            className="shrink-0 w-7 h-7 rounded-md flex items-center justify-center disabled:opacity-20 transition-all hover:scale-105"
            style={{
              background:
                input.trim() && !isRunning && !isReplying && address
                  ? "linear-gradient(135deg, #7c3aed, #2563eb)"
                  : "rgba(255,255,255,0.08)",
            }}
          >
            {isRunning || isReplying ? (
              <Loader2 size={12} className="text-white/50 animate-spin" />
            ) : (
              <Send size={11} className="text-white" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
