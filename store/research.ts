/**
 * Research store — Zustand store for the /research page.
 *
 * Holds:
 *  - ReactFlow nodes / edges (the ATS agent graph)
 *  - Chat message list (user + SSE events)
 *  - currentRun / currentReceipt state
 *  - applyEvent() — single dispatcher that updates graph + chat in lockstep
 */

import { create } from 'zustand'
import type { Node, Edge } from '@xyflow/react'
import type { RunEvent, DecisionReceipt, AgentName, Mode } from '@/lib/ats/types'

// ── Agent node state ──────────────────────────────────────────────────────────

export type NodeState = 'idle' | 'thinking' | 'done' | 'vetoed'

export interface AgentNodeData extends Record<string, unknown> {
  agentId: AgentName
  label: string
  icon: string
  state: NodeState
  lastOutput: string
  confidence: number | null
  subTasks: { label: string; done: boolean }[]
}

// ── Chat message types ────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'system' | 'error'
  content: string
  agent?: AgentName
  ts: string
  eventType?: string
}

// ── Initial graph layout ──────────────────────────────────────────────────────

const INITIAL_NODES: Node<AgentNodeData>[] = [
  {
    id: 'data',
    type: 'agentNode',
    position: { x: 80, y: 280 },
    data: {
      agentId: 'data',
      label: 'Data Agent',
      icon: '📡',
      state: 'idle',
      lastOutput: '',
      confidence: null,
      subTasks: [],
    },
  },
  {
    id: 'regime',
    type: 'agentNode',
    position: { x: 380, y: 100 },
    data: {
      agentId: 'regime',
      label: 'Regime Agent',
      icon: '📊',
      state: 'idle',
      lastOutput: '',
      confidence: null,
      subTasks: [],
    },
  },
  {
    id: 'signal',
    type: 'agentNode',
    position: { x: 380, y: 280 },
    data: {
      agentId: 'signal',
      label: 'Signal Agent',
      icon: '📈',
      state: 'idle',
      lastOutput: '',
      confidence: null,
      subTasks: [
        { label: 'Technical', done: false },
        { label: 'Sentiment', done: false },
        { label: 'Causal', done: false },
        { label: 'Institutional', done: false },
      ],
    },
  },
  {
    id: 'graph',
    type: 'agentNode',
    position: { x: 380, y: 460 },
    data: {
      agentId: 'graph',
      label: 'Graph Agent',
      icon: '🕸️',
      state: 'idle',
      lastOutput: '',
      confidence: null,
      subTasks: [],
    },
  },
  {
    id: 'risk',
    type: 'agentNode',
    position: { x: 680, y: 280 },
    data: {
      agentId: 'risk',
      label: 'Risk Agent',
      icon: '🛡️',
      state: 'idle',
      lastOutput: '',
      confidence: null,
      subTasks: [],
    },
  },
  {
    id: 'orchestrator',
    type: 'agentNode',
    position: { x: 980, y: 150 },
    data: {
      agentId: 'orchestrator',
      label: 'Orchestrator',
      icon: '🎯',
      state: 'idle',
      lastOutput: '',
      confidence: null,
      subTasks: [],
    },
  },
  {
    id: 'execution',
    type: 'agentNode',
    position: { x: 980, y: 380 },
    data: {
      agentId: 'execution',
      label: 'Execution Agent',
      icon: '⚡',
      state: 'idle',
      lastOutput: '',
      confidence: null,
      subTasks: [],
    },
  },
]

const INITIAL_EDGES: Edge[] = [
  // Data → Phase 2 agents
  { id: 'data-regime', source: 'data', target: 'regime', animated: false, style: { stroke: '#6b7280' } },
  { id: 'data-signal', source: 'data', target: 'signal', animated: false, style: { stroke: '#6b7280' } },
  { id: 'data-graph',  source: 'data', target: 'graph',  animated: false, style: { stroke: '#6b7280' } },
  // Phase 2 → Risk
  { id: 'regime-risk', source: 'regime', target: 'risk', animated: false, style: { stroke: '#6b7280' } },
  { id: 'signal-risk', source: 'signal', target: 'risk', animated: false, style: { stroke: '#6b7280' } },
  { id: 'graph-risk',  source: 'graph',  target: 'risk', animated: false, style: { stroke: '#6b7280' } },
  // Risk → Orchestrator
  { id: 'risk-orch', source: 'risk', target: 'orchestrator', animated: false, style: { stroke: '#6b7280' } },
  // Orchestrator → Execution
  { id: 'orch-exec', source: 'orchestrator', target: 'execution', animated: false, style: { stroke: '#6b7280' } },
]

// ── Pending approval (assisted mode) ─────────────────────────────────────────

export interface PendingApproval {
  run_id: string
  decision: 'BUY' | 'SELL'
  size_usd: number
}

// ── Store ─────────────────────────────────────────────────────────────────────

interface ResearchStore {
  nodes: Node<AgentNodeData>[]
  edges: Edge[]
  messages: ChatMessage[]
  currentRun: string | null
  currentReceipt: DecisionReceipt | null
  mode: Mode
  isRunning: boolean
  receiptOpen: boolean
  /**
   * Set when the orchestrator emits execution.pending with awaiting_approval=true
   * (assisted mode, consensus reached, waiting for user to confirm the trade).
   * Cleared on run.start, run.done, run.error, or execution.done.
   */
  pendingApproval: PendingApproval | null

  setMode: (mode: Mode) => void
  setReceiptOpen: (open: boolean) => void
  clearPendingApproval: () => void
  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string) => void
  applyEvent: (evt: RunEvent) => void
  resetRun: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function patchNode(
  nodes: Node<AgentNodeData>[],
  agentId: AgentName,
  patch: Partial<AgentNodeData>,
): Node<AgentNodeData>[] {
  return nodes.map((n) =>
    n.id === agentId ? { ...n, data: { ...n.data, ...patch } } : n,
  )
}

function animateEdge(
  edges: Edge[],
  sourceId: string,
  targetId?: string,
  color = '#7c3aed',
): Edge[] {
  return edges.map((e) => {
    const matches = targetId
      ? e.source === sourceId && e.target === targetId
      : e.source === sourceId || e.target === sourceId
    return matches
      ? { ...e, animated: true, style: { stroke: color } }
      : e
  })
}

function resetEdges(edges: Edge[]): Edge[] {
  return edges.map((e) => ({ ...e, animated: false, style: { stroke: '#6b7280' } }))
}

function formatRunDoneMessage(evt: RunEvent): string {
  const receipt = evt.receipt
  if (!receipt) return evt.message ?? 'Research run complete.'

  const confidence = Math.round(receipt.consensus.confidence * 100)
  const vetoReason = receipt.risk_sizing.veto_reason
    ? ` (${receipt.risk_sizing.veto_reason})`
    : ''
  const risk = receipt.risk_sizing.veto_triggered
    ? `Risk vetoed${vetoReason}`
    : `Risk allowed about $${receipt.risk_sizing.size_usd.toFixed(2)} position size`
  const execution = receipt.tx_hash
    ? `Execution submitted: ${receipt.tx_hash}.`
    : 'No execution was submitted.'
  const rationale = receipt.consensus.rationale
    ? ` Rationale: ${receipt.consensus.rationale}`
    : ''

  return `${receipt.ticker} research complete: ${receipt.consensus.decision} with ${confidence}% confidence. ${risk}. ${execution}${rationale}`
}

function eventToMessage(evt: RunEvent): ChatMessage {
  const content =
    evt.type === 'run.done'
      ? formatRunDoneMessage(evt)
      : evt.message ?? `[${evt.type}]`
  const roleMap: Partial<Record<RunEvent['type'], ChatMessage['role']>> = {
    'run.error': 'error',
    'run.start':  'system',
  }
  return {
    id: `evt_${evt.ts}_${Math.random().toString(36).slice(2, 6)}`,
    role: roleMap[evt.type] ?? 'agent',
    content,
    agent: evt.agent,
    ts: evt.ts,
    eventType: evt.type,
  }
}

// ── Create store ──────────────────────────────────────────────────────────────

export const useResearchStore = create<ResearchStore>((set, get) => ({
  nodes: INITIAL_NODES,
  edges: INITIAL_EDGES,
  messages: [],
  currentRun: null,
  currentReceipt: null,
  mode: 'solo',
  isRunning: false,
  receiptOpen: false,
  pendingApproval: null,

  setMode: (mode) => set({ mode }),
  setReceiptOpen: (open) => set({ receiptOpen: open }),
  clearPendingApproval: () => set({ pendingApproval: null }),

  addUserMessage: (content) => {
    const msg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content,
      ts: new Date().toISOString(),
    }
    set((s) => ({ messages: [...s.messages, msg] }))
  },

  addAssistantMessage: (content) => {
    const msg: ChatMessage = {
      id: `assistant_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      role: 'agent',
      agent: 'orchestrator',
      content,
      ts: new Date().toISOString(),
    }
    set((s) => ({ messages: [...s.messages, msg] }))
  },

  resetRun: () =>
    set({
      nodes: INITIAL_NODES.map((n) => ({
        ...n,
        data: {
          ...n.data,
          state: 'idle' as NodeState,
          lastOutput: '',
          confidence: null,
          subTasks: n.data.subTasks.map((t) => ({ ...t, done: false })),
        },
      })),
      edges: resetEdges(get().edges),
      currentRun: null,
      currentReceipt: null,
      isRunning: false,
      pendingApproval: null,
    }),

  applyEvent: (evt: RunEvent) => {
    set((s) => {
      let { nodes, edges } = s
      const messages = [...s.messages, eventToMessage(evt)]
      let isRunning = s.isRunning
      let currentRun = s.currentRun
      let currentReceipt = s.currentReceipt
      let receiptOpen = s.receiptOpen
      let pendingApproval = s.pendingApproval

      switch (evt.type) {
        // ── Run lifecycle ──────────────────────────────────────────────────────
        case 'run.start':
          isRunning = true
          currentRun = evt.run_id
          pendingApproval = null
          // Reset all nodes to idle
          nodes = INITIAL_NODES.map((n) => ({
            ...n,
            data: {
              ...n.data,
              state: 'idle' as NodeState,
              lastOutput: '',
              confidence: null,
              subTasks: n.data.subTasks.map((t) => ({ ...t, done: false })),
            },
          }))
          edges = resetEdges(INITIAL_EDGES)
          break

        case 'run.done':
          isRunning = false
          pendingApproval = null
          if (evt.receipt) {
            currentReceipt = evt.receipt
            receiptOpen = true
          }
          // Mark orchestrator done
          nodes = patchNode(nodes, 'orchestrator', {
            state: 'done',
            lastOutput: evt.message ?? 'Run complete',
          })
          break

        case 'run.error':
          isRunning = false
          pendingApproval = null
          break

        // ── Agent thinking ─────────────────────────────────────────────────────
        case 'agent.thinking':
          if (evt.agent) {
            nodes = patchNode(nodes, evt.agent, {
              state: 'thinking',
              lastOutput: evt.message ?? '',
            })
            // Animate incoming edges
            edges = animateEdge(edges, 'data', evt.agent, '#7c3aed')
          }
          break

        // ── Agent done ─────────────────────────────────────────────────────────
        case 'agent.done': {
          if (evt.agent) {
            const payload = evt.payload as Record<string, unknown> | undefined
            const conf =
              typeof payload?.confidence === 'number' ? payload.confidence : null
            nodes = patchNode(nodes, evt.agent, {
              state: 'done',
              lastOutput: evt.message ?? '',
              confidence: conf,
            })
            // Animate outgoing edges
            if (evt.agent === 'data') {
              edges = animateEdge(edges, 'data', 'regime', '#22c55e')
              edges = animateEdge(edges, 'data', 'signal', '#22c55e')
              edges = animateEdge(edges, 'data', 'graph',  '#22c55e')
            } else if (
              evt.agent === 'regime' ||
              evt.agent === 'signal' ||
              evt.agent === 'graph'
            ) {
              edges = animateEdge(edges, evt.agent, 'risk', '#22c55e')
            } else if (evt.agent === 'risk') {
              edges = animateEdge(edges, 'risk', 'orchestrator', '#22c55e')
            } else if (evt.agent === 'orchestrator') {
              edges = animateEdge(edges, 'orchestrator', 'execution', '#22c55e')
            }
          }
          break
        }

        // ── Agent vetoed ───────────────────────────────────────────────────────
        case 'agent.vetoed':
          if (evt.agent) {
            nodes = patchNode(nodes, evt.agent, {
              state: 'vetoed',
              lastOutput: evt.message ?? 'Vetoed',
            })
            edges = animateEdge(edges, evt.agent, undefined, '#ef4444')
          }
          break

        // ── Agent-specific events ──────────────────────────────────────────────
        case 'agent.data':
          nodes = patchNode(nodes, 'data', {
            state: 'done',
            lastOutput: evt.message ?? 'Data bundle ready',
          })
          edges = animateEdge(edges, 'data', 'regime', '#22c55e')
          edges = animateEdge(edges, 'data', 'signal', '#22c55e')
          edges = animateEdge(edges, 'data', 'graph',  '#22c55e')
          break

        case 'regime.classified':
          nodes = patchNode(nodes, 'regime', {
            state: 'done',
            lastOutput: evt.message ?? '',
          })
          edges = animateEdge(edges, 'regime', 'risk', '#22c55e')
          break

        case 'signal.update': {
          const payload = evt.payload as Record<string, unknown> | undefined
          const subTaskKey = payload?.sub_task as string | undefined
          if (subTaskKey) {
            nodes = nodes.map((n) =>
              n.id === 'signal'
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      state: 'thinking' as NodeState,
                      lastOutput: evt.message ?? '',
                      subTasks: n.data.subTasks.map((t) =>
                        t.label.toLowerCase() === subTaskKey.toLowerCase()
                          ? { ...t, done: true }
                          : t,
                      ),
                    },
                  }
                : n,
            )
          }
          break
        }

        case 'graph.update':
          nodes = patchNode(nodes, 'graph', {
            state: 'thinking',
            lastOutput: evt.message ?? '',
          })
          break

        case 'risk.sizing': {
          const payload = evt.payload as Record<string, unknown> | undefined
          const veto = payload?.veto_triggered as boolean | undefined
          nodes = patchNode(nodes, 'risk', {
            state: veto ? 'vetoed' : 'thinking',
            lastOutput: evt.message ?? '',
          })
          break
        }

        case 'consensus.reached':
          nodes = patchNode(nodes, 'orchestrator', {
            state: 'thinking',
            lastOutput: evt.message ?? '',
          })
          edges = animateEdge(edges, 'risk', 'orchestrator', '#a855f7')
          break

        case 'execution.pending': {
          const p = evt.payload as Record<string, unknown> | undefined
          // awaiting_approval=true signals the orchestrator is pausing for user
          // approval in assisted mode; this is distinct from the execution agent's
          // own "about to sign" pending event (which lacks awaiting_approval).
          if (p?.awaiting_approval === true) {
            const decision = p.decision as 'BUY' | 'SELL' | undefined
            const size_usd = typeof p.size_usd === 'number' ? p.size_usd : 0
            if (decision === 'BUY' || decision === 'SELL') {
              pendingApproval = { run_id: evt.run_id, decision, size_usd }
            }
          }
          nodes = patchNode(nodes, 'execution', {
            state: 'thinking',
            lastOutput: evt.message ?? '',
          })
          break
        }

        case 'execution.done':
          pendingApproval = null
          nodes = patchNode(nodes, 'execution', {
            state: 'done',
            lastOutput: evt.message ?? '',
          })
          break
      }

      return { nodes, edges, messages, isRunning, currentRun, currentReceipt, receiptOpen, pendingApproval }
    })
  },
}))
