# Graph Report - app/(app)  (2026-04-18)

## Corpus Check
- Corpus is ~4,597 words - fits in a single context window. You may not need a graph.

## Summary
- 12 nodes · 6 edges · 6 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Explore Favorites Flow|Explore Favorites Flow]]
- [[_COMMUNITY_Portfolio Pricing Flow|Portfolio Pricing Flow]]
- [[_COMMUNITY_App Layout Shell|App Layout Shell]]
- [[_COMMUNITY_Transactions History View|Transactions History View]]
- [[_COMMUNITY_Pool Detail Route|Pool Detail Route]]
- [[_COMMUNITY_Trade Route|Trade Route]]

## God Nodes (most connected - your core abstractions)

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Explore Favorites Flow"
Cohesion: 0.67
Nodes (0): 

### Community 1 - "Portfolio Pricing Flow"
Cohesion: 0.67
Nodes (0): 

### Community 2 - "App Layout Shell"
Cohesion: 1.0
Nodes (0): 

### Community 3 - "Transactions History View"
Cohesion: 1.0
Nodes (0): 

### Community 4 - "Pool Detail Route"
Cohesion: 1.0
Nodes (0): 

### Community 5 - "Trade Route"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `App Layout Shell`** (2 nodes): `layout.tsx`, `AppLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Transactions History View`** (2 nodes): `page.tsx`, `TransactionHistory()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pool Detail Route`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Trade Route`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._