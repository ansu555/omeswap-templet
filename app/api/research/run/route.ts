/**
 * /api/research/run
 *
 * POST — Starts an ATS research run and streams RunEvents as Server-Sent Events.
 *
 * Request body (JSON):
 *   {
 *     query             : string  — User's natural-language query (required)
 *     ticker?           : string  — Asset ticker; extracted from query if omitted
 *     mode?             : Mode    — Trading mode override; falls back to user_settings
 *     chainId?          : number  — Chain override (default: 0G Newton, 16600)
 *     executionApproved?: boolean — Assisted-mode: user has approved execution
 *   }
 *
 * Response: text/event-stream
 *   Each event is a JSON-serialised RunEvent (lib/ats/types.ts) on a `data:` line.
 *   Stream closes after `run.done` or `run.error`.
 *
 * Post-run: receipt blob is uploaded to 0G Storage (best-effort);
 *   storage_root_hash is back-filled in decision_receipts if upload succeeds.
 *
 * Auth: x-wallet-address header (requireWallet helper).
 */

import { type NextRequest } from 'next/server'
import { createPublicClient, http, formatEther } from 'viem'

import { requireWallet } from '@/lib/marketplace/wallet-header'
import { createSupabaseAdminClient } from '@/lib/supabase/server'
import { getOrCreateAgentWallet } from '@/lib/agent-wallet/manager'
import { runOrchestrator } from '@/lib/ats/orchestrator'
import { saveAgentMemory } from '@/lib/zerog'
import { getChainConfig, DEFAULT_CHAIN_ID } from '@/lib/chain-registry'
import type { RunEvent, Mode } from '@/lib/ats/types'
import type { AxlTransport } from '@/lib/axl'

export const dynamic = 'force-dynamic'

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_MODES: Mode[] = ['autonomous', 'assisted', 'solo']
const VALID_TRANSPORTS: AxlTransport[] = ['local', 'axl', 'auto']

/**
 * Ordered list of known tickers used to extract a ticker from a free-text query
 * when the caller doesn't provide one explicitly.
 */
const KNOWN_TICKERS = [
  'W0G', '0G',
  'BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'AVAX', 'DOGE', 'DOT', 'MATIC',
  'LINK', 'UNI', 'ATOM', 'LTC', 'BCH', 'NEAR', 'APT', 'ARB', 'OP', 'INJ',
  'SUI', 'SEI', 'TIA', 'RNDR', 'PEPE', 'WIF', 'BONK', 'JUP', 'PYTH',
  'SHIB', 'TRX', 'TON', 'FTM', 'CRV', 'AAVE',
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractTicker(query: string): string {
  const upper = query.toUpperCase()
  for (const t of KNOWN_TICKERS) {
    // Word-boundary match: ticker must not be part of a longer word
    const re = new RegExp(`(?<![A-Z])${t}(?![A-Z])`)
    if (re.test(upper)) return t
  }
  return 'BTC'
}

function makeRunId(): string {
  return `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Best-effort estimate of the agent wallet balance in USD.
 * For the 0G chain we don't have a live price oracle, so we use a conservative
 * placeholder ($1 per native token). On Ethereum mainnet we use $3,000/ETH.
 * Failures are swallowed and return 0 so Kelly sizing gracefully falls back.
 */
async function estimateAgentBalanceUSD(
  agentAddress: string,
  chainId: number,
): Promise<number> {
  try {
    const config = getChainConfig(chainId)
    const client = createPublicClient({
      chain: config.chain,
      transport: http(config.chain.rpcUrls.default.http[0]),
    })
    const raw = await client.getBalance({ address: agentAddress as `0x${string}` })
    const native = parseFloat(formatEther(raw))
    // ETH mainnet: rough $3k/ETH; 0G testnet: $1 placeholder
    const priceUSD = chainId === 1 ? 3000 : 1
    return native * priceUSD
  } catch {
    return 0
  }
}

function formatSSE(event: RunEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`)
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const userWallet = requireWallet(req)
  if (userWallet instanceof Response) return userWallet

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: {
    query?: string
    ticker?: string
    mode?: string
    chainId?: number
    executionApproved?: boolean
    transport?: string
  }
  try {
    body = (await req.json()) as typeof body
  } catch {
    body = {}
  }

  const query = body.query?.trim()
  if (!query) {
    return new Response(
      JSON.stringify({ error: '`query` is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    )
  }

  const ticker = body.ticker?.trim().toUpperCase() || extractTicker(query)
  const chainId =
    typeof body.chainId === 'number' && Number.isFinite(body.chainId)
      ? body.chainId
      : DEFAULT_CHAIN_ID

  // ── Load user settings (mode fallback) ──────────────────────────────────────
  const supabase = createSupabaseAdminClient()
  const { data: settings } = await supabase
    .from('user_settings')
    .select('mode')
    .eq('user_wallet', userWallet.toLowerCase())
    .maybeSingle()

  const modeFromBody = body.mode as Mode | undefined
  const mode: Mode =
    (modeFromBody && VALID_MODES.includes(modeFromBody) ? modeFromBody : null) ??
    (settings?.mode && VALID_MODES.includes(settings.mode as Mode)
      ? (settings.mode as Mode)
      : null) ??
    'solo'

  // Optional per-request transport override (defaults to ATS_AGENT_TRANSPORT in orchestrator)
  const transportFromBody = body.transport?.toLowerCase() as AxlTransport | undefined
  const transport: AxlTransport | undefined =
    transportFromBody && VALID_TRANSPORTS.includes(transportFromBody)
      ? transportFromBody
      : undefined

  // ── Agent wallet: init (idempotent) + estimate USD balance ──────────────────
  const run_id = makeRunId()
  let agentBalanceUSD = 0
  try {
    const { address } = await getOrCreateAgentWallet(userWallet, chainId)
    agentBalanceUSD = await estimateAgentBalanceUSD(address, chainId)
  } catch (walletErr) {
    console.warn('[ATS run] Agent wallet init failed (non-fatal):', walletErr)
  }

  // ── SSE stream ──────────────────────────────────────────────────────────────
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (evt: RunEvent) => {
        try {
          controller.enqueue(formatSSE(evt))
        } catch {
          // Client disconnected — swallow enqueue errors so cleanup still runs
        }
      }

      try {
        const receipt = await runOrchestrator(
          {
            run_id,
            query,
            ticker,
            mode,
            userWallet,
            chainId,
            executionApproved: body.executionApproved,
            agentBalanceUSD,
            transport,
          },
          send,
        )

        // ── 0G Storage: persist receipt blob (best-effort) ──────────────────
        if (receipt.id) {
          try {
            const { rootHash } = await saveAgentMemory(
              `ats_receipt_${run_id}`,
              receipt,
            )
            await supabase
              .from('decision_receipts')
              .update({ storage_root_hash: rootHash })
              .eq('id', receipt.id)
          } catch (storageErr) {
            console.warn(
              '[ATS run] 0G Storage upload failed (non-fatal):',
              storageErr instanceof Error ? storageErr.message : storageErr,
            )
          }
        }
      } catch (err) {
        // Top-level safety net — the orchestrator should have already emitted
        // run.error internally, but we guard against any uncaught exception
        // here so the stream always closes cleanly.
        const msg = err instanceof Error ? err.message : String(err)
        send({
          type: 'run.error',
          run_id,
          ts: new Date().toISOString(),
          agent: 'orchestrator',
          message: `Unhandled error: ${msg}`,
          payload: { error: msg },
        })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable Nginx proxy buffering
    },
  })
}
