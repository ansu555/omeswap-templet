# Omeswap Documentation

Last updated: 2026-05-04

This directory contains the hand-maintained project documentation. Generated graph artifacts live in `graphify-out/` and nested `graphify-out/` folders; update those by rerunning Graphify rather than editing them by hand.

## Current References

| Document | Purpose |
|---|---|
| [../README.md](../README.md) | Main project setup, routes, environment, and architecture summary. |
| [ATS_Agent_Execution_Flow.md](ATS_Agent_Execution_Flow.md) | Current Python ATS flow, agents, Redis/Postgres state, FastAPI routes, and execution path. |
| [phases/index.md](phases/index.md) | Phase-by-phase implementation map and validation commands. |
| [BUILT.md](BUILT.md) | Inventory of implemented frontend, marketplace, backend, 0G, and testing modules. |
| [guideline.md](guideline.md) | Practical guide for chain, 0G, DEX, and registry changes. |
| [marketplace/README.md](marketplace/README.md) | Marketplace documentation index and current implementation map. |
| [idea.md](idea.md) | Product vision and current implementation alignment. |
| [recode.md](recode.md) | Work log of major implementation/documentation updates. |

## Documentation Rules

- Keep the current shipped behavior in `README.md`, `CLAUDE.md`, `ATS_Agent_Execution_Flow.md`, `BUILT.md`, and phase docs.
- Keep future product thinking in `idea.md` or explicitly marked backlog sections.
- When a doc describes a route, API, environment variable, migration, or test, verify it against the repo before editing.
- Do not hand-edit generated Graphify HTML/JSON/markdown reports unless the task explicitly asks for generated artifact cleanup.
