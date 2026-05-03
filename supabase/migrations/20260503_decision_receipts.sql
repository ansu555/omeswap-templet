-- ============================================================
-- DECISION RECEIPTS — ATS extension
-- ============================================================
--
-- Extends the existing public.decision_receipts table (created in
-- 20260427120000_create_marketplace.sql) with the fields required
-- by the ATS research co-pilot (doc § 3.1).
--
-- New columns mirror the structured receipt shown in
-- DecisionReceiptDrawer:
--   TRIGGER · SOURCE · AGENT VOTES · REGIME ·
--   CAUSAL CHAIN · RISK SIZING · CONSENSUS
--
-- The existing marketplace-linked columns (activation_id,
-- strategy_version_id) remain — ATS receipts leave them NULL.
-- A direct user_wallet FK makes per-user queries efficient without
-- joining through activations.
-- ============================================================

-- ── Direct user link (ATS receipts don't have an activation) ──
ALTER TABLE public.decision_receipts
  ADD COLUMN IF NOT EXISTS user_wallet      TEXT
    CONSTRAINT decision_receipts_user_lowercase
      CHECK (user_wallet IS NULL OR user_wallet = lower(user_wallet));

COMMENT ON COLUMN public.decision_receipts.user_wallet IS 'Lowercase EVM address of the user who initiated this ATS run. NULL for marketplace-activation receipts.';

-- ── ATS run metadata ───────────────────────────────────────
ALTER TABLE public.decision_receipts
  ADD COLUMN IF NOT EXISTS run_id           TEXT,
  ADD COLUMN IF NOT EXISTS ticker           TEXT,
  ADD COLUMN IF NOT EXISTS trigger_type     TEXT
    CONSTRAINT decision_receipts_trigger_check
      CHECK (trigger_type IS NULL OR trigger_type IN ('user_query', 'scheduled', 'alert'));

COMMENT ON COLUMN public.decision_receipts.run_id        IS 'Unique identifier for the ATS SSE run that produced this receipt.';
COMMENT ON COLUMN public.decision_receipts.ticker        IS 'Primary asset ticker analysed (e.g. BTC, ETH).';
COMMENT ON COLUMN public.decision_receipts.trigger_type  IS 'What initiated the run: user_query | scheduled | alert.';

-- ── Multi-chain + 0G Storage ───────────────────────────────
ALTER TABLE public.decision_receipts
  ADD COLUMN IF NOT EXISTS chain_id           INT,
  ADD COLUMN IF NOT EXISTS storage_root_hash  TEXT;

COMMENT ON COLUMN public.decision_receipts.chain_id          IS 'EVM chain ID on which the trade was (or would have been) executed. 16600 = 0G Newton Testnet.';
COMMENT ON COLUMN public.decision_receipts.storage_root_hash IS 'Content-addressed root hash of the full receipt blob on 0G Storage. NULL until 0G Storage upload completes.';

-- ── ATS structured receipt fields (doc § 3.1) ─────────────
ALTER TABLE public.decision_receipts
  ADD COLUMN IF NOT EXISTS agent_votes    JSONB,
  ADD COLUMN IF NOT EXISTS regime         TEXT,
  ADD COLUMN IF NOT EXISTS causal_chain   JSONB,
  ADD COLUMN IF NOT EXISTS risk_sizing    JSONB,
  ADD COLUMN IF NOT EXISTS consensus      JSONB;

COMMENT ON COLUMN public.decision_receipts.agent_votes  IS 'Array of {agent, vote, confidence, rationale} objects from all 6 ATS agents.';
COMMENT ON COLUMN public.decision_receipts.regime       IS 'Market regime label determined by the Regime Agent (e.g. bull_trending, bear_volatile, sideways).';
COMMENT ON COLUMN public.decision_receipts.causal_chain IS 'Active causal chains identified by the Signal Agent (from lib/ats/causal-chains.json).';
COMMENT ON COLUMN public.decision_receipts.risk_sizing  IS 'Position sizing output from the Risk Agent: {kelly_fraction, size_usd, max_loss_usd, veto_triggered}.';
COMMENT ON COLUMN public.decision_receipts.consensus    IS 'Final orchestrator consensus: {decision, confidence, rationale, approved_by, vetoed_by}.';

-- ── Indexes for ATS queries ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_receipts_user_wallet
  ON public.decision_receipts(user_wallet)
  WHERE user_wallet IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_receipts_run_id
  ON public.decision_receipts(run_id)
  WHERE run_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_receipts_ticker
  ON public.decision_receipts(ticker)
  WHERE ticker IS NOT NULL;

-- ── RLS — extend so users can read their own ATS receipts ─
-- (The service role is already allowed to read/write everything
--  via the admin client. This SELECT policy lets per-user reads
--  work if we ever expose a row-level Supabase client.)
CREATE POLICY "receipts: ats owner read"
  ON public.decision_receipts FOR SELECT
  USING (user_wallet = lower(current_setting('app.wallet', true)));

-- ============================================================
-- DONE
-- ============================================================
