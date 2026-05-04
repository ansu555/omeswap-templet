# Graphify Process For Omeswap

Last updated: 2026-05-04

This repo contains generated Graphify output in `graphify-out/`, `graphify-meta/`, and several nested `graphify-out/` folders. Treat those files as generated architecture snapshots, not hand-maintained source docs.

## Goal

Use Graphify to inspect code relationships after meaningful code changes. Keep hand-written docs in `README.md`, `CLAUDE.md`, and `doc/` aligned first; regenerate Graphify artifacts when graph views or generated reports are needed.

## Suggested Slices

| Slice | Paths |
|---|---|
| Root app shell | `app/`, `components/layout/`, `components/providers/` |
| Trade and terminal | `app/(app)/trade`, `app/terminal`, `components/trade`, `components/terminal`, `lib/dex` |
| Marketplace | `app/api/marketplace`, `app/api/creator`, `components/marketplace`, `components/creator`, `lib/marketplace`, `supabase/migrations` |
| Agent builder | `app/(builder)`, `components/agent-builder`, `lib/agent-builder`, `store/agent-builder.ts`, `types/agent-builder*` |
| ATS backend | `ats/`, `tests/` |
| Chain and 0G | `lib/chain-registry`, `lib/zerog`, `contracts` |
| Standalone app | `avax-agent/` |

## Recommended Flow

1. Update code or hand-written docs.
2. Run project validation (`npm run build`, ATS tests, or focused checks).
3. Regenerate Graphify output when architecture graphs are needed.
4. Archive or compare generated reports in `graphify-meta/`.
5. Do not manually patch generated HTML/JSON unless the task is explicitly about generated artifact cleanup.

## Ignore By Default

- `node_modules/`
- `.next/`
- `.venv/`
- Python `__pycache__/`
- `tsconfig.tsbuildinfo`
- generated `graphify-out/` folders unless regenerating/comparing them

## Maintenance Note

If generated Markdown under `graphify-meta/` disagrees with the hand-written docs, prefer the hand-written docs and rerun Graphify rather than editing generated reports manually.
