"use client";

import { memo, useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { AgentNodeData, NodeState } from "@/store/research";
import clsx from "clsx";
import {
  Activity,
  BarChart3,
  ChevronDown,
  ChevronUp,
  LineChart,
  Network,
  ShieldAlert,
  Target,
  Zap,
  XCircle,
} from "lucide-react";

type AgentNodeProps = NodeProps & { data: AgentNodeData };

// ── State colours ─────────────────────────────────────────────────────────────

const STATE_STYLES: Record<
  NodeState,
  { border: string; glow: string; badge: string; badgeText: string; handle: string }
> = {
  idle: {
    border: "border-white/[0.08]",
    glow: "",
    badge: "bg-white/5 text-white/30",
    badgeText: "Idle",
    handle: "#64748b",
  },
  thinking: {
    border: "border-purple-400/55",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.24)]",
    badge: "bg-purple-500/[0.16] text-purple-200",
    badgeText: "Thinking",
    handle: "#a855f7",
  },
  done: {
    border: "border-emerald-400/55",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.18)]",
    badge: "bg-emerald-500/[0.16] text-emerald-200",
    badgeText: "Done",
    handle: "#22c55e",
  },
  vetoed: {
    border: "border-red-400/55",
    glow: "shadow-[0_0_20px_rgba(239,68,68,0.22)]",
    badge: "bg-red-500/[0.16] text-red-200",
    badgeText: "Vetoed",
    handle: "#ef4444",
  },
};

const AGENT_ICONS = {
  data: Activity,
  regime: BarChart3,
  signal: LineChart,
  graph: Network,
  risk: ShieldAlert,
  execution: Zap,
  orchestrator: Target,
};

// ── Component ─────────────────────────────────────────────────────────────────

export const AgentNode = memo(function AgentNode({
  data,
}: AgentNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const styles = STATE_STYLES[data.state];
  const hasSubTasks = data.subTasks.length > 0;
  const doneSubTasks = data.subTasks.filter((t) => t.done).length;
  const Icon = AGENT_ICONS[data.agentId];

  return (
    <div
      className={clsx(
        "relative rounded-lg border px-3 py-2.5 min-w-[170px] max-w-[210px] text-left select-none transition-all duration-300",
        "cursor-default",
        styles.border,
        styles.glow,
        data.state === "idle" ? "opacity-60" : "opacity-100",
      )}
      style={{
        background:
          "linear-gradient(135deg, rgba(10,14,25,0.97) 0%, rgba(20,18,38,0.97) 100%)",
        boxShadow:
          data.state === "idle"
            ? "0 12px 28px rgba(0,0,0,0.14)"
            : undefined,
      }}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: styles.handle,
          border: "none",
          width: 8,
          height: 8,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: styles.handle,
          border: "none",
          width: 8,
          height: 8,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.04] text-white/60">
          <Icon size={12} />
        </span>
        <span className="text-[11px] font-semibold text-white/90 leading-none truncate flex-1">
          {data.label}
        </span>
        <span
          className={clsx(
            "shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full",
            styles.badge,
          )}
        >
          {styles.badgeText}
        </span>
      </div>

      {/* Thinking pulse bar */}
      {data.state === "thinking" && (
        <div className="h-0.5 w-full rounded-full overflow-hidden mb-1.5 bg-white/5">
          <div
            className="h-full rounded-full bg-purple-300"
            style={{ animation: "thinking-slide 1.5s ease-in-out infinite" }}
          />
        </div>
      )}

      {/* Confidence bar (done state) */}
      {data.state === "done" && data.confidence !== null && (
        <div className="mb-1.5">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[9px] text-white/30">Confidence</span>
            <span className="text-[9px] text-emerald-400 font-mono">
              {Math.round(data.confidence * 100)}%
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.round(data.confidence * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Last output */}
      {data.lastOutput && (
        <p className="text-[10px] text-white/45 leading-snug line-clamp-2 mb-1">
          {data.lastOutput}
        </p>
      )}

      {/* Sub-tasks for Signal Agent */}
      {hasSubTasks && (
        <div>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-[9px] text-white/30 hover:text-white/60 transition-colors"
          >
            <span>
              {doneSubTasks}/{data.subTasks.length} sub-tasks
            </span>
            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
          </button>
          {expanded && (
            <div className="mt-1 space-y-0.5">
              {data.subTasks.map((t) => (
                <div key={t.label} className="flex items-center gap-1">
                  <span
                    className={clsx(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      t.done ? "bg-emerald-400" : "bg-white/15",
                    )}
                  />
                  <span
                    className={clsx(
                      "text-[9px]",
                      t.done ? "text-white/70" : "text-white/25",
                    )}
                  >
                    {t.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vetoed X */}
      {data.state === "vetoed" && (
        <div className="absolute inset-0 rounded-lg flex items-center justify-center pointer-events-none">
          <XCircle size={44} className="text-red-500/20" />
        </div>
      )}

      <style>{`
        @keyframes thinking-slide {
          0%   { width: 0%; margin-left: 0%; }
          50%  { width: 60%; margin-left: 20%; }
          100% { width: 0%; margin-left: 100%; }
        }
      `}</style>
    </div>
  );
});

export default AgentNode;
