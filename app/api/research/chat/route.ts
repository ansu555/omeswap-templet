import { type NextRequest, NextResponse } from 'next/server'

import { callLLM, type LLMMessage } from '@/lib/ats/llm'
import { requireWallet } from '@/lib/marketplace/wallet-header'

export const dynamic = 'force-dynamic'

interface ChatHistoryItem {
  role?: 'user' | 'assistant'
  content?: string
}

export async function POST(req: NextRequest) {
  const userWallet = requireWallet(req)
  if (userWallet instanceof Response) return userWallet

  let body: {
    message?: string
    ticker?: string
    history?: ChatHistoryItem[]
  }

  try {
    body = (await req.json()) as typeof body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const message = body.message?.trim()
  if (!message) {
    return NextResponse.json({ error: '`message` is required' }, { status: 400 })
  }

  const ticker = body.ticker?.trim().toUpperCase() || 'BTC'
  const history: LLMMessage[] = Array.isArray(body.history)
    ? body.history
        .slice(-8)
        .filter(
          (item): item is Required<ChatHistoryItem> =>
            (item.role === 'user' || item.role === 'assistant') &&
            typeof item.content === 'string' &&
            item.content.trim().length > 0,
        )
        .map((item) => ({
          role: item.role,
          content: item.content.trim().slice(0, 800),
        }))
    : []

  try {
    const reply = await callLLM({
      userWallet,
      maxTokens: 260,
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content:
            'You are the Omeswap ATS Research chat companion. Reply naturally and briefly. ' +
            'Do not start or pretend to run the ATS graph. If the user wants market analysis, ' +
            `tell them they can ask for a research run such as "analyze ${ticker}".`,
        },
        ...history,
        { role: 'user', content: message },
      ],
    })

    return NextResponse.json({
      reply: reply.trim() || 'I am here. Ask me anything, or ask for a market research run.',
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
