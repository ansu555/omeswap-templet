"use client";

import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useResearchStore } from "@/store/research";
import { AgentNode } from "@/components/research/nodes/AgentNode";

// ── Node type registry ────────────────────────────────────────────────────────

// Cast needed: xyflow NodeTypes expects NodeProps without data generic
const nodeTypes: NodeTypes = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  agentNode: AgentNode as any,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function AgentGraphCanvas() {
  const nodes = useResearchStore((s) => s.nodes);
  const edges = useResearchStore((s) => s.edges);
  const isRunning = useResearchStore((s) => s.isRunning);
  const currentRun = useResearchStore((s) => s.currentRun);

  return (
    <div className="relative w-full h-full">
      {/* Run-ID badge */}
      {currentRun && (
        <div
          className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono"
          style={{
            background: "rgba(124,58,237,0.15)",
            border: "1px solid rgba(124,58,237,0.3)",
            color: "#c4b5fd",
          }}
        >
          {isRunning && (
            <span
              className="w-1.5 h-1.5 rounded-full bg-purple-400"
              style={{ animation: "pulse 1s ease-in-out infinite" }}
            />
          )}
          <span className="truncate max-w-[160px]">{currentRun}</span>
        </div>
      )}

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5 rounded-xl text-[9px]"
        style={{
          background: "rgba(0,0,0,0.55)",
          border: "1px solid rgba(255,255,255,0.06)",
          backdropFilter: "blur(8px)",
        }}
      >
        {(
          [
            ["#6b7280", "Idle"],
            ["#a855f7", "Thinking"],
            ["#22c55e", "Done"],
            ["#ef4444", "Vetoed"],
          ] as const
        ).map(([color, label]) => (
          <div key={label} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: color }}
            />
            <span className="text-white/40">{label}</span>
          </div>
        ))}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        minZoom={0.4}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        style={{ background: "transparent" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255,255,255,0.04)"
        />
        <Controls
          style={{
            background: "rgba(13,13,26,0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
          }}
          showInteractive={false}
        />
      </ReactFlow>

      <style>{`
        .react-flow__edge-path {
          transition: stroke 0.5s ease, stroke-width 0.3s ease;
        }
      `}</style>
    </div>
  );
}
