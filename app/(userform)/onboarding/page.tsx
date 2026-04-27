'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

import {
  RESPONSE_KEYS,
  RISK_QUESTIONNAIRE_VERSION,
  RISK_QUESTIONS,
  type RiskResponses,
  computeRiskScore,
  getRiskCategory,
  isValidResponseScore,
  normalizeWalletAddress,
} from '@/lib/onboarding'
import { cn } from '@/lib/utils'
import { useWallet } from '@/hooks/use-wallet'

type OnboardingStatusResponse =
  | { exists: false }
  | {
      exists: true
      riskScore: number
      riskCategory: 'conservative' | 'balanced' | 'aggressive'
    }

function hasCompleteResponses(
  responses: Partial<RiskResponses>,
): responses is RiskResponses {
  return RESPONSE_KEYS.every((key) => isValidResponseScore(responses[key]))
}

function getCategoryLabel(category: 'conservative' | 'balanced' | 'aggressive') {
  switch (category) {
    case 'conservative':
      return 'Conservative'
    case 'balanced':
      return 'Balanced'
    case 'aggressive':
      return 'Aggressive'
  }
}

export default function OnboardingPage() {
  const router = useRouter()
  const { address, isConnected } = useWallet()

  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)
  const [statusCheckedAddress, setStatusCheckedAddress] = useState<string | null>(
    null,
  )
  const [responses, setResponses] = useState<Partial<RiskResponses>>({})
  const [notes, setNotes] = useState('')
  const [step, setStep] = useState(0)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const normalizedAddress = useMemo(
    () => (address ? normalizeWalletAddress(address) : ''),
    [address],
  )

  const fetchStatus = useCallback(async () => {
    if (!normalizedAddress) {
      return
    }

    setStatusLoading(true)
    setStatusError(null)

    try {
      const response = await fetch(
        `/api/onboarding?wallet=${encodeURIComponent(normalizedAddress)}`,
        { method: 'GET', cache: 'no-store' },
      )

      if (!response.ok) {
        throw new Error('Unable to verify onboarding status.')
      }

      const data = (await response.json()) as OnboardingStatusResponse

      if (data.exists) {
        router.replace('/explore')
        return
      }

      setStatusCheckedAddress(normalizedAddress)
    } catch {
      setStatusError('Could not verify onboarding status. Please retry.')
    } finally {
      setStatusLoading(false)
    }
  }, [normalizedAddress, router])

  useEffect(() => {
    if (!isConnected || !normalizedAddress) {
      setStatusCheckedAddress(null)
      setStatusError(null)
      setStatusLoading(false)
      return
    }

    void fetchStatus()
  }, [fetchStatus, isConnected, normalizedAddress])

  const answeredCount = useMemo(
    () =>
      RESPONSE_KEYS.reduce(
        (count, key) => (isValidResponseScore(responses[key]) ? count + 1 : count),
        0,
      ),
    [responses],
  )

  const isReviewStep = step >= RISK_QUESTIONS.length
  const activeQuestion = isReviewStep ? null : RISK_QUESTIONS[step]
  const activeScore = activeQuestion ? responses[activeQuestion.id] : undefined
  const hasCurrentAnswer = activeQuestion
    ? isValidResponseScore(activeScore)
    : hasCompleteResponses(responses)

  const computedScore = hasCompleteResponses(responses)
    ? computeRiskScore(responses)
    : null
  const computedCategory = computedScore === null ? null : getRiskCategory(computedScore)

  const onSelectScore = (score: 1 | 2 | 3 | 4 | 5) => {
    if (!activeQuestion) {
      return
    }

    setResponses((previous) => ({
      ...previous,
      [activeQuestion.id]: score,
    }))
    setSubmitError(null)
  }

  const onNext = () => {
    if (step < RISK_QUESTIONS.length) {
      setStep((previous) => previous + 1)
    }
  }

  const onBack = () => {
    if (step > 0) {
      setStep((previous) => previous - 1)
    }
  }

  const onSubmit = async () => {
    if (!normalizedAddress || !hasCompleteResponses(responses) || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: normalizedAddress,
          responses,
          notes: notes.trim() || undefined,
          questionnaireVersion: RISK_QUESTIONNAIRE_VERSION,
        }),
      })

      if (response.status === 409) {
        router.replace('/explore')
        return
      }

      if (!response.ok) {
        throw new Error('Unable to submit onboarding.')
      }

      router.replace('/explore')
    } catch {
      setSubmitError('Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isConnected || !normalizedAddress) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-primary/80">
            Omeswap onboarding
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Connect wallet to continue</h1>
          <p className="mt-4 text-white/70">
            Onboarding is saved once per wallet. Connect to check your profile.
          </p>
          <div className="mt-8">
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  if (statusLoading || statusCheckedAddress !== normalizedAddress) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-8">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <p className="text-white/80">Checking onboarding status for this wallet...</p>
        </div>
      </div>
    )
  }

  if (statusError) {
    return (
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-red-400/30 bg-red-500/10 p-8">
          <h1 className="text-2xl font-semibold">Status check failed</h1>
          <p className="mt-3 text-red-100/90">{statusError}</p>
          <button
            type="button"
            onClick={() => {
              void fetchStatus()
            }}
            className="mt-6 rounded-xl bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/30"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-10">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary/80">
              Omeswap risk onboarding
            </p>
            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
              {isReviewStep ? 'Review and submit' : 'Risk profile questionnaire'}
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Wallet: {normalizedAddress.slice(0, 6)}...{normalizedAddress.slice(-4)}
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
            {isReviewStep
              ? `${RISK_QUESTIONS.length}/${RISK_QUESTIONS.length}`
              : `${step + 1}/${RISK_QUESTIONS.length}`}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(answeredCount / RISK_QUESTIONS.length) * 100}%` }}
          />
        </div>

        {!isReviewStep && activeQuestion && (
          <section className="mt-8">
            <p className="text-sm font-medium text-white/60">
              Question {step + 1} of {RISK_QUESTIONS.length}
            </p>
            <h2 className="mt-2 text-xl font-semibold">{activeQuestion.title}</h2>

            <div className="mt-6 space-y-3">
              {activeQuestion.options.map((option) => {
                const selected = option.score === activeScore
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelectScore(option.score)}
                    className={cn(
                      'w-full rounded-2xl border px-4 py-4 text-left transition',
                      selected
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-white/10 bg-white/5 hover:border-white/25',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm md:text-base">{option.label}</span>
                      <span className="rounded-full border border-current/30 px-2 py-0.5 text-xs">
                        {option.score}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {isReviewStep && (
          <section className="mt-8 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-white/60">Risk score preview</p>
              <p className="mt-2 text-3xl font-semibold">
                {computedScore ?? '--'}
                <span className="ml-2 text-sm text-white/60">/ 100</span>
              </p>
              <p className="mt-2 text-sm text-white/70">
                Category:{' '}
                <span className="font-medium text-white">
                  {computedCategory ? getCategoryLabel(computedCategory) : '--'}
                </span>
              </p>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="mb-2 block text-sm font-medium text-white/80"
              >
                Notes / goals (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Share your investment goals or constraints..."
                rows={4}
                maxLength={1000}
                className="w-full resize-y rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {submitError && <p className="text-sm text-red-300">{submitError}</p>}
          </section>
        )}

        <div className="mt-10 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={step === 0 || isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {!isReviewStep ? (
            <button
              type="button"
              onClick={onNext}
              disabled={!hasCurrentAnswer || isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-black transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                void onSubmit()
              }}
              disabled={!hasCompleteResponses(responses) || isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-black transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Submit onboarding'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
